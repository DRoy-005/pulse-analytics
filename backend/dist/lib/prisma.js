// ============================================================
// Prisma Client
// ============================================================
//
// Creates the Prisma database client used throughout the
// backend.
//
// Prisma 7 uses the PostgreSQL driver adapter, so we create
// a PrismaPg adapter and pass it to PrismaClient.
//
// Keeping this in one file prevents different parts of the
// application from creating unnecessary database clients.
//
// ============================================================
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
// ============================================================
// Environment Validation
// ============================================================
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL is not defined in the environment.");
}
// ============================================================
// PostgreSQL Adapter
// ============================================================
const adapter = new PrismaPg({
    connectionString: databaseUrl,
});
// ============================================================
// Prisma Client
// ============================================================
export const prisma = new PrismaClient({
    adapter,
});
