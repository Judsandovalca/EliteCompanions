import { PrismaClient, Prisma } from "@prisma/client";
import type { Redis } from "ioredis";

interface Context {
  prisma: PrismaClient;
  redis: Redis;
}

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
  sortBy?: "NEWEST" | "RATING" | "PRICE_LOW" | "PRICE_HIGH";
}

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 60;
const CACHE_TTL = 60; // seconds

export const resolvers = {
  Query: {
    companions: async (
      _: unknown,
      { input }: { input?: CompanionsInput },
      { prisma, redis }: Context
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
        sortBy = "NEWEST",
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
        ...(category && {
          categories: { some: { category: { slug: category } } },
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

      // Try cache for first page with no filters
      const isFirstPage = !cursor && !city && !category && !ethnicity && !bodyType && !hairColor;
      const cacheKey = isFirstPage ? `companions:feed:${sortBy}:${limit}` : null;

      if (cacheKey) {
        const cached = await redis.get(cacheKey).catch(() => null);
        if (cached) return JSON.parse(cached);
      }

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

      const result = { edges, nextCursor, hasMore, totalCount };

      if (cacheKey) {
        await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => {});
      }

      return result;
    },

    companion: async (_: unknown, { id }: { id: string }, { prisma, redis }: Context) => {
      const cacheKey = `companion:${id}`;
      const cached = await redis.get(cacheKey).catch(() => null);
      if (cached) return JSON.parse(cached);

      const companion = await prisma.companion.findUnique({
        where: { id },
        include: {
          images: { orderBy: { position: "asc" } },
          categories: { include: { category: true } },
        },
      });

      if (companion) {
        await redis.setex(cacheKey, 300, JSON.stringify(companion)).catch(() => {});
      }

      return companion;
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

    featuredCompanions: async (
      _: unknown,
      { limit = 12 }: { limit?: number },
      { prisma, redis }: Context
    ) => {
      const cacheKey = `companions:featured:${limit}`;
      const cached = await redis.get(cacheKey).catch(() => null);
      if (cached) return JSON.parse(cached);

      const companions = await prisma.companion.findMany({
        where: { status: "ACTIVE", featured: true },
        take: limit,
        orderBy: { rating: "desc" },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
        },
      });

      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(companions)).catch(() => {});
      return companions;
    },
  },

  Companion: {
    primaryImage: (parent: any) => {
      return parent.images?.[0] ?? null;
    },
    categories: (parent: any) => {
      return parent.categories?.map((c: any) => c.category) ?? [];
    },
  },
};
