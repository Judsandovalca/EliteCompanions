import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { PrismaClient } from "@prisma/client";
import { typeDefs } from "./schema/typeDefs.js";
import { resolvers } from "./resolvers/index.js";
import { getUserIdFromRequest } from "./auth.js";
import { uploadRouter } from "./routes/upload.js";
import type { GraphQLContext } from "./resolvers/index.js";

const PORT = parseInt(process.env.PORT ?? "4000", 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:3000";

async function main() {
  const prisma = new PrismaClient();

  const server = new ApolloServer<GraphQLContext>({ typeDefs, resolvers });
  await server.start();

  const app = express();

  const corsOptions = {
    origin: CORS_ORIGIN,
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  // Explicitly handle preflight for /graphql
  app.options("/graphql", cors(corsOptions));

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.use(
    "/graphql",
    expressMiddleware<GraphQLContext>(server, {
      context: async ({ req, res }) => {
        const userId = getUserIdFromRequest(req as unknown as Parameters<typeof getUserIdFromRequest>[0]);
        return { prisma, req, res, userId } as unknown as GraphQLContext;
      },
    }) as unknown as express.RequestHandler
  );

  app.use("/uploads", express.static("public/uploads"));
  app.use("/api", uploadRouter);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.listen(PORT, () => {
    console.log(`GraphQL API ready at http://localhost:${PORT}/graphql`);
  });
}

main().catch(console.error);
