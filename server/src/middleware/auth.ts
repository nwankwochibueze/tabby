// WHY THIS FILE EXISTS:
// Protects routes that require authentication.
// Reads the JWT token from the Authorization header,
// verifies it and sets userId on the Hono context.
// Without this middleware any user could access any session.
// Used by sessions routes — not by auth routes (login/register are public).

import { createMiddleware } from "hono/factory";
import { jwtVerify } from "jose";

type Variables = {
  userId: string;
};

const authMiddleware = createMiddleware<{ Variables: Variables }>(
  async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.split(" ")[1]!;

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      const { payload } = await jwtVerify(token, secret);

      c.set("userId", payload["userId"] as string);
      await next();
    } catch {
      return c.json({ error: "Invalid or expired token" }, 401);
    }
  },
);

export default authMiddleware;
