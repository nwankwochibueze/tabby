import { PrismaClient } from "@prisma/client";

// WHY: Single Prisma instance shared across the entire server.
// Creating multiple instances causes connection pool exhaustion.
const db = new PrismaClient();

export default db;
