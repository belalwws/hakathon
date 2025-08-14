import { PrismaClient } from "@prisma/client"

// Ensure DATABASE_URL exists for Prisma (fallback to local SQLite)
if (!process.env.DATABASE_URL) {
	process.env.DATABASE_URL = "file:./dev.db"
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma 