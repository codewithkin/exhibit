import { env } from "@exhibit/env/server";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../prisma/generated/client";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

// const ACCELERATE_URL = env.ACCELERATE_URL;

const prisma = new PrismaClient({ adapter });

export default prisma;