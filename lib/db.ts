import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { logger } from "./logger";

const SLOW_QUERY_THRESHOLD_MS = 500;

function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const client = new PrismaClient({ adapter });

  return client.$extends({
    query: {
      async $allOperations({ model, operation, args, query }) {
        const start = performance.now();
        try {
          const result = await query(args);
          const durationMs = Math.round(performance.now() - start);
          if (durationMs > SLOW_QUERY_THRESHOLD_MS) {
            logger.warn("db.slow_query", { model, operation, durationMs });
          } else {
            logger.info("db.query", { model, operation, durationMs });
          }
          return result;
        } catch (err) {
          const durationMs = Math.round(performance.now() - start);
          logger.error("db.query_error", err, { model, operation, durationMs });
          throw err;
        }
      },
    },
  });
}

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createClient> };

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
