// WHY THIS FILE EXISTS:
// Entry point for the Tabby Hono server.
// Registers all routes, applies middleware and starts the server.
// Auth routes are public — no middleware needed.
// Sessions routes are protected — auth middleware runs first.

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import "dotenv/config";
import auth from "./routes/auth";
import sessions from "./routes/sessions";
import authMiddleware from "./middleware/auth";
import classify from "./routes/classify";

const app = new Hono();

// WHY: CORS allows the Chrome extension to make requests to this server.
// Without this the browser blocks cross-origin requests from the extension.
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.route("/auth", auth);
app.use("/sessions/*", authMiddleware);
app.route("/sessions", sessions);
app.route("/ai", classify);

app.get("/health", (c) => c.json({ status: "ok" }));

const port = Number(process.env.PORT) || 3000;

serve({ fetch: app.fetch, port }, () => {
  console.log(`[Tabby] Server running on port ${port}`);
});

export default app;
