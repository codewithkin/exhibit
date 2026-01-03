import { env } from "@exhibit/env/server";
import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";

import { PrismaClient } from "../prisma/generated/client";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

// Use ACCELERATE_URL when provided, otherwise fall back to the regular DATABASE_URL
const accelerateUrl = process.env.ACCELERATE_URL ?? env.DATABASE_URL;

const prisma = new PrismaClient({ adapter, accelerateUrl }).$extends(withAccelerate());

export default prisma;
