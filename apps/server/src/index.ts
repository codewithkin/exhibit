import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "@exhibit/auth";
import { env } from "@exhibit/env/server";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.on(["GET", "POST"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.get("/", (c) => {
  return c.text("OK");
});

export default {
  port: 3000,
  fetch: app.fetch,
};

console.log("Server is running on http://localhost:3000");
