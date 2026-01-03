import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "@exhibit/auth";
import { env } from "@exhibit/env/server";
import prisma from "@exhibit/db";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "PUT", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.on(["GET", "POST"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// Get all categories
app.get("/api/categories", async (c) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  return c.json(categories);
});

// Complete onboarding - set role and categories
app.post("/api/onboarding", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json<{
    role: "ARTIST" | "COLLECTOR";
    categoryIds: string[];
  }>();

  if (!body.role || !["ARTIST", "COLLECTOR"].includes(body.role)) {
    return c.json({ error: "Invalid role" }, 400);
  }

  if (!body.categoryIds || body.categoryIds.length === 0) {
    return c.json({ error: "Select at least one category" }, 400);
  }

  // Update user role and onboarding status
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      role: body.role,
      onboardingCompleted: true,
    },
  });

  // Add user category preferences
  await prisma.userCategory.createMany({
    data: body.categoryIds.map((categoryId) => ({
      userId: session.user.id,
      categoryId,
    })),
    skipDuplicates: true,
  });

  return c.json({ success: true });
});

// Get current user with onboarding status
app.get("/api/user/me", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      categories: {
        include: { category: true },
      },
    },
  });

  return c.json(user);
});

app.get("/", (c) => {
  return c.text("OK");
});

export default {
  port: 3000,
  fetch: app.fetch,
};

console.log("Server is running on http://localhost:3000");
