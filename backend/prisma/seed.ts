// ============================================================
// PulseAnalytics Development Seed
// ============================================================
//
// Creates sample records that we can use while developing:
//
// Workspace
//    └── Demo User
//          └── Demo Session
//
// The seed is only for development/testing.
//
// ============================================================

import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

// ============================================================
// Prisma Setup
// ============================================================

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not defined in the environment."
  );
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

// ============================================================
// Seed Database
// ============================================================

async function main() {
  console.log("Starting database seed...");

  // ----------------------------------------------------------
  // Create or reuse demo workspace
  // ----------------------------------------------------------

  const workspace = await prisma.workspace.upsert({
    where: {
      slug: "demo-workspace",
    },

    update: {},

    create: {
      name: "Demo Workspace",
      slug: "demo-workspace",
    },
  });

  console.log(
    `Workspace ready: ${workspace.name}`
  );

  // ----------------------------------------------------------
  // Create or reuse demo user
  // ----------------------------------------------------------

  const user = await prisma.user.upsert({
    where: {
      workspaceId_externalId: {
        workspaceId: workspace.id,
        externalId: "demo-user-001",
      },
    },

    update: {
      lastSeenAt: new Date(),
    },

    create: {
      workspaceId: workspace.id,
      externalId: "demo-user-001",
      email: "demo@example.com",
    },
  });

  console.log(
    `User ready: ${user.externalId}`
  );

  // ----------------------------------------------------------
  // Create a demo session
  // ----------------------------------------------------------

  // ----------------------------------------------------------
// Create or reuse a demo session
// ----------------------------------------------------------
//
// We reuse an existing development session instead of
// creating a new session every time `npm run seed` runs.
//
// This keeps our development database clean.
//

let session = await prisma.session.findFirst({
  where: {
    workspaceId: workspace.id,
    userId: user.id,
  },
  orderBy: {
    createdAt: "desc",
  },
});

if (!session) {
  session = await prisma.session.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,

      deviceType: "desktop",
      browser: "Chrome",
      operatingSystem: "Windows",

      country: "India",
      city: "Kolkata",
    },
  });
}

console.log(`Session ready: ${session.id}`);

  console.log(
    `Session created: ${session.id}`
  );

  // ----------------------------------------------------------
  // Final output
  // ----------------------------------------------------------

  console.log("\nSeed completed successfully.");

  console.log("\nDevelopment IDs:");
  console.log(`Workspace: ${workspace.id}`);
  console.log(`User:      ${user.id}`);
  console.log(`Session:   ${session.id}`);
}

// ============================================================
// Execute Seed
// ============================================================

main()
  .catch((error) => {
    console.error("Seed failed:", error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });