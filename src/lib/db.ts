import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Return a proxy that throws on actual database access but doesn't crash at import time.
    // This allows the app to build without DATABASE_URL set (e.g. in CI environments).
    return new Proxy({} as PrismaClient, {
      get(_target, prop) {
        if (prop === 'then' || prop === 'catch') return undefined;
        return () => {
          throw new Error(
            'DATABASE_URL environment variable is not set. Please configure your database connection.'
          );
        };
      },
    });
  }

  // Neon-optimised connection pool settings.
  // - max: 5 keeps us within Neon free-tier concurrent connection limits.
  // - idleTimeoutMillis: releases idle connections quickly on serverless (Vercel functions spin down fast).
  // - connectionTimeoutMillis: fails fast rather than hanging silently on cold-start.
  const pool = new pg.Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: false },
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? ['warn', 'error']
      : ['error'],
  });
}

// Reuse the same Prisma instance across hot-reloads in development.
export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
