import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || ''

export const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000,
  max: 3,
  maxUses: 100,
})
export const db = drizzle(pool)
