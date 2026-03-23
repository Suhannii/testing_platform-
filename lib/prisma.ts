/**
 * Prisma client singleton
 *
 * In development, Next.js hot-reload creates new module instances on every
 * change, which would exhaust the DB connection pool. We store the client on
 * `globalThis` so it is reused across reloads.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Log warnings and errors in development; errors only in production
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
