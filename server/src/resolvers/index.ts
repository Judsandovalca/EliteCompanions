import { PrismaClient, Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import {
  hashPassword,
  verifyPassword,
  createToken,
  setTokenCookie,
  clearTokenCookie,
} from "../auth.js";
// TODO: Re-enable Redis caching later
// import type { Redis } from "ioredis";

export interface GraphQLContext {
  prisma: PrismaClient;
  req: Request;
  res: Response;
  userId: string | null;
  // redis: Redis;
}

type Context = GraphQLContext;

interface CompanionsInput {
  cursor?: string;
  limit?: number;
  city?: string;
  category?: string;
  ethnicity?: string;
  bodyType?: string;
  hairColor?: string;
  ageMin?: number;
  ageMax?: number;
  priceMin?: number;
  priceMax?: number;
  verified?: boolean;
  tag?: string;
  sortBy?: "NEWEST" | "RATING" | "PRICE_LOW" | "PRICE_HIGH";
  search?: string;
}

interface CompanionImageInput {
  position: number;
  s3Key: string;
  thumbUrl: string;
  mediumUrl: string;
  fullUrl: string;
  width: number;
  height: number;
  blurHash?: string;
  isPrimary: boolean;
}

interface CreateCompanionInput {
  name: string;
  age: number;
  bio?: string;
  tagline?: string;
  ethnicity?: string;
  bodyType?: string;
  hairColor?: string;
  eyeColor?: string;
  height?: number;
  languages: string[];
  services: string[];
  tags?: string[];
  availability?: string;
  city: string;
  region?: string;
  country: string;
  pricePerHour?: number;
  currency?: string;
  categoryIds: string[];
  images: CompanionImageInput[];
}

interface RegisterInput {
  email: string;
  name: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 60;
// const CACHE_TTL = 60; // seconds

export const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, { prisma, userId }: Context) => {
      if (!userId) return null;
      return prisma.user.findUnique({ where: { id: userId } });
    },

    companions: async (
      _: unknown,
      { input }: { input?: CompanionsInput },
      { prisma }: Context
    ) => {
      const {
        cursor,
        limit: rawLimit,
        city,
        category,
        ethnicity,
        bodyType,
        hairColor,
        ageMin,
        ageMax,
        priceMin,
        priceMax,
        verified,
        tag,
        sortBy = "NEWEST",
        search,
      } = input ?? {};

      const limit = Math.min(rawLimit ?? DEFAULT_LIMIT, MAX_LIMIT);

      // Build where clause
      const where: Prisma.CompanionWhereInput = {
        status: "ACTIVE",
        ...(city && { city: { equals: city, mode: "insensitive" as const } }),
        ...(ethnicity && { ethnicity: { equals: ethnicity, mode: "insensitive" as const } }),
        ...(bodyType && { bodyType: { equals: bodyType, mode: "insensitive" as const } }),
        ...(hairColor && { hairColor: { equals: hairColor, mode: "insensitive" as const } }),
        ...(verified !== undefined && { verified }),
        ...(ageMin || ageMax
          ? { age: { ...(ageMin && { gte: ageMin }), ...(ageMax && { lte: ageMax }) } }
          : {}),
        ...(priceMin || priceMax
          ? {
              pricePerHour: {
                ...(priceMin && { gte: priceMin }),
                ...(priceMax && { lte: priceMax }),
              },
            }
          : {}),
        ...(tag && { tags: { has: tag } }),
        ...(category && {
          categories: { some: { category: { slug: category } } },
        }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { tagline: { contains: search, mode: "insensitive" as const } },
            { bio: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      // Build orderBy
      const orderBy: Prisma.CompanionOrderByWithRelationInput =
        sortBy === "RATING"
          ? { rating: "desc" }
          : sortBy === "PRICE_LOW"
          ? { pricePerHour: "asc" }
          : sortBy === "PRICE_HIGH"
          ? { pricePerHour: "desc" }
          : { createdAt: "desc" };

      const [totalCount, companions] = await Promise.all([
        prisma.companion.count({ where }),
        prisma.companion.findMany({
          where,
          orderBy,
          take: limit + 1,
          ...(cursor && { cursor: { id: cursor }, skip: 1 }),
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        }),
      ]);

      const hasMore = companions.length > limit;
      const edges = hasMore ? companions.slice(0, limit) : companions;
      const nextCursor = hasMore ? edges[edges.length - 1].id : null;

      return { edges, nextCursor, hasMore, totalCount };
    },

    companion: async (_: unknown, { id }: { id: string }, { prisma }: Context) => {
      return prisma.companion.findUnique({
        where: { id },
        include: {
          images: { orderBy: { position: "asc" } },
          categories: { include: { category: true } },
        },
      });
    },

    categories: async (_: unknown, __: unknown, { prisma }: Context) => {
      const categories = await prisma.category.findMany({
        include: { _count: { select: { companions: true } } },
        orderBy: { name: "asc" },
      });
      return categories.map((c) => ({
        ...c,
        count: c._count.companions,
      }));
    },

    myCompanions: async (
      _: unknown,
      __: unknown,
      { prisma, userId }: Context
    ) => {
      if (!userId) {
        throw new Error("Debes iniciar sesión para ver tus perfiles");
      }
      return prisma.companion.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          categories: { include: { category: true } },
        },
      });
    },

    featuredCompanions: async (
      _: unknown,
      { limit = 12 }: { limit?: number },
      { prisma }: Context
    ) => {
      return prisma.companion.findMany({
        where: { status: "ACTIVE", featured: true },
        take: limit,
        orderBy: { rating: "desc" },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
        },
      });
    },
  },

  Mutation: {
    register: async (
      _: unknown,
      { input }: { input: RegisterInput },
      { prisma, res }: Context
    ) => {
      const { email, name, password } = input;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new Error("Ya existe una cuenta con ese correo electrónico");
      }

      if (password.length < 8) {
        throw new Error("La contraseña debe tener al menos 8 caracteres");
      }

      const hashed = await hashPassword(password);
      const user = await prisma.user.create({
        data: { email, name, password: hashed },
      });

      const token = createToken(user.id);
      setTokenCookie(res, token);

      return { user };
    },

    login: async (
      _: unknown,
      { input }: { input: LoginInput },
      { prisma, res }: Context
    ) => {
      const { email, password } = input;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error("Correo o contraseña incorrectos");
      }

      const valid = await verifyPassword(password, user.password);
      if (!valid) {
        throw new Error("Correo o contraseña incorrectos");
      }

      const token = createToken(user.id);
      setTokenCookie(res, token);

      return { user };
    },

    logout: (_: unknown, __: unknown, { res }: Context) => {
      clearTokenCookie(res);
      return true;
    },

    toggleCompanionStatus: async (
      _: unknown,
      { id }: { id: string },
      { prisma, userId }: Context
    ) => {
      if (!userId) {
        throw new Error("Debes iniciar sesión");
      }
      const companion = await prisma.companion.findUnique({ where: { id } });
      if (!companion) {
        throw new Error("Perfil no encontrado");
      }
      if (companion.userId !== userId) {
        throw new Error("No tienes permiso para modificar este perfil");
      }
      if (companion.status === "SUSPENDED") {
        throw new Error("No puedes cambiar el estado de un perfil suspendido");
      }
      const newStatus = companion.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      return prisma.companion.update({
        where: { id },
        data: { status: newStatus },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          categories: { include: { category: true } },
        },
      });
    },

    createCompanion: async (
      _: unknown,
      { input }: { input: CreateCompanionInput },
      { prisma, userId }: Context
    ) => {
      if (!userId) {
        throw new Error("Debes iniciar sesión para publicar un perfil");
      }

      if (input.name.length < 2 || input.name.length > 50) {
        throw new Error("El nombre debe tener entre 2 y 50 caracteres");
      }
      if (input.age < 18 || input.age > 99) {
        throw new Error("La edad debe estar entre 18 y 99 años");
      }
      if (input.images.length === 0) {
        throw new Error("Debes subir al menos una imagen");
      }
      if (input.images.length > 10) {
        throw new Error("Máximo 10 imágenes permitidas");
      }
      if (!input.images.some((img) => img.isPrimary)) {
        throw new Error("Debes marcar una imagen como principal");
      }

      if (input.categoryIds.length > 0) {
        const validCategories = await prisma.category.findMany({
          where: { id: { in: input.categoryIds } },
          select: { id: true },
        });
        if (validCategories.length !== input.categoryIds.length) {
          throw new Error("Una o más categorías no son válidas");
        }
      }

      return prisma.companion.create({
        data: {
          name: input.name,
          age: input.age,
          bio: input.bio,
          tagline: input.tagline,
          ethnicity: input.ethnicity,
          bodyType: input.bodyType,
          hairColor: input.hairColor,
          eyeColor: input.eyeColor,
          height: input.height,
          languages: input.languages,
          services: input.services,
          tags: input.tags ?? [],
          availability: input.availability,
          city: input.city,
          region: input.region,
          country: input.country,
          pricePerHour: input.pricePerHour,
          currency: input.currency ?? "USD",
          userId,
          images: {
            create: input.images.map((img) => ({
              position: img.position,
              s3Key: img.s3Key,
              thumbUrl: img.thumbUrl,
              mediumUrl: img.mediumUrl,
              fullUrl: img.fullUrl,
              width: img.width,
              height: img.height,
              blurHash: img.blurHash,
              isPrimary: img.isPrimary,
            })),
          },
          categories: {
            create: input.categoryIds.map((categoryId) => ({ categoryId })),
          },
        },
        include: {
          images: { orderBy: { position: "asc" } },
          categories: { include: { category: true } },
        },
      });
    },
  },

  Companion: {
    primaryImage: (parent: { images?: { isPrimary: boolean }[] }) => {
      return parent.images?.[0] ?? null;
    },
    categories: (parent: { categories?: { category: unknown }[] }) => {
      return parent.categories?.map((c) => c.category) ?? [];
    },
  },
};
