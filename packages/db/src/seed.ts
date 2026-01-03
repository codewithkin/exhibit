import { config } from "dotenv";
import { resolve } from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/client";
import { CATEGORIES } from "./categories";

// Load env from server app
config({ path: resolve(__dirname, "../../../apps/server/.env") });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log("🌱 Seeding categories...");

  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        icon: category.icon,
      },
      create: {
        name: category.name,
        slug: category.slug,
        icon: category.icon,
      },
    });
    console.log(`  ✓ ${category.name}`);
  }

  console.log("\n✅ Seeding complete!");
}

seed()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
