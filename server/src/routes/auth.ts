// WHY THIS FILE EXISTS:
// Handles user registration and login for Tabby.
// Registration creates a new user with a hashed password.
// Login verifies credentials and returns a JWT token.
// That token is stored in the extension and sent with every
// subsequent request to identify and authenticate the user.
// Passwords are never stored in plain text — always bcrypt hashed.

import { Hono } from "hono";
import { sign } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../db/client";

const auth = new Hono();

// POST /auth/register
auth.post("/register", async (c) => {
  try {
    const { email, password, displayName } = await c.req.json();

    if (!email || !password || !displayName) {
      return c.json(
        { error: "Email, password and display name are required" },
        400,
      );
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return c.json({ error: "Email already registered" }, 409);
    }

    // WHY: Never store plain text passwords — hash with bcrypt
    const hashed = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: { email, password: hashed, displayName },
    });

    return c.json(
      {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      201,
    );
  } catch (error) {
    return c.json({ error: "Registration failed" }, 500);
  }
});

// POST /auth/login
auth.post("/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // WHY: JWT token contains userId and email so the server
    // can identify the user on every subsequent request
    const token = sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    return c.json({ error: "Login failed" }, 500);
  }
});

export default auth;
