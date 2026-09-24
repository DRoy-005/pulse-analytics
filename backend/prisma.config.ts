// ============================================================
// Prisma Configuration
// ============================================================
//
// Prisma 7 keeps the database connection URL in this
// configuration file.
//
// The actual DATABASE_URL will live in .env so that database
// credentials are never committed to GitHub.
//
// ============================================================

import "dotenv/config";

import {
  defineConfig,
  env,
} from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: env("DATABASE_URL"),
  },
});