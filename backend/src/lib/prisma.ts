import { PrismaClient } from '@prisma/client'
import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

// Neon serverless connection
const connectionString = process.env.DATABASE_URL!

// Create Neon connection pool
const pool = new Pool({ connectionString })

// Create Prisma client with Neon adapter
const adapter = new PrismaNeon(pool)

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
})

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
  await pool.end()
})

export default prisma
