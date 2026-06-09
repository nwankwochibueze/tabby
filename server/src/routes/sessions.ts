// WHY THIS FILE EXISTS:
// Users need to save their current tab groups as named sessions
// so they can restore them later or sync across devices.
// This route handles creating, fetching and deleting sessions.
// All routes here are protected — only authenticated users can access them.
// The userId comes from the auth middleware, not from the request body,
// so users can only ever access their own sessions.

import { Hono } from 'hono'
import db from '../db/client'


// WHY: We define the context variables type so TypeScript knows
// that userId is always a string when set by the auth middleware.
type Variables = {
  userId: string
}

const sessions = new Hono<{ Variables: Variables }>()

// GET /sessions — get all saved sessions for the logged in user
sessions.get("/", async (c) => {
  try {
    const userId = c.get("userId");

    const userSessions = await db.session.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return c.json({ sessions: userSessions });
  } catch (error) {
    return c.json({ error: "Failed to fetch sessions" }, 500);
  }
});

// POST /sessions — save current tab groups as a named session
sessions.post("/", async (c) => {
  try {
    const userId = c.get("userId");
    const { name, groups } = await c.req.json();

    if (!name || !groups) {
      return c.json({ error: "Name and groups are required" }, 400);
    }

    const session = await db.session.create({
      data: {
        name,
        userId,
        groups,
      },
    });

    return c.json({ session }, 201);
  } catch (error) {
    return c.json({ error: "Failed to save session" }, 500);
  }
});

// DELETE /sessions/:id — delete a saved session
sessions.delete("/:id", async (c) => {
  try {
    const userId = c.get("userId");
    const id = c.req.param("id");

    // WHY: Verify the session belongs to this user before deleting
    const session = await db.session.findUnique({ where: { id } });

    if (!session || session.userId !== userId) {
      return c.json({ error: "Session not found" }, 404);
    }

    await db.session.delete({ where: { id } });

    return c.json({ message: "Session deleted" });
  } catch (error) {
    return c.json({ error: "Failed to delete session" }, 500);
  }
});

export default sessions;
