// WHY THIS FILE EXISTS:
// Single Prisma database client shared across the entire server.
// Prisma 7 requires a driver adapter — it no longer accepts a plain
// connection string. PrismaPg is the official PostgreSQL adapter
// that connects to our Supabase database using the DATABASE_URL
// from our .env file.

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })

const db = new PrismaClient({ adapter })

export default db