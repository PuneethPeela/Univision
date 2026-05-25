import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://apple@localhost:5432/univision?sslmode=disable",
  },
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
  },
});
