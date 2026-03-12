import "dotenv/config";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { PrismaClient } from "@prisma/client";
import { Redis } from "ioredis";
import { typeDefs } from "./schema/typeDefs.js";
import { resolvers } from "./resolvers/index.js";

const PORT = parseInt(process.env.PORT ?? "4000", 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:3000";

async function main() {
  const prisma = new PrismaClient();
  const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  // Gracefully handle Redis connection failures (server works without cache)
  redis.on("error", (err) => {
    console.warn("Redis connection error (caching disabled):", err.message);
  });

  try {
    await redis.connect();
    console.log("Redis connected");
  } catch {
    console.warn("Redis unavailable — running without cache");
  }

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  const app = express();

  app.use(cors({ origin: CORS_ORIGIN }));
  app.use(express.json({ limit: "1mb" }));

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async () => ({ prisma, redis }),
    })
  );

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.listen(PORT, () => {
    console.log(`GraphQL API ready at http://localhost:${PORT}/graphql`);
  });
}

main().catch(console.error);
