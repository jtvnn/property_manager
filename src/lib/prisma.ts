import { PrismaClient } from '@prisma/client'

// Create a single instance
let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  // In development, ensure we reuse the same instance across hot reloads
  const globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient
  }
  
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient()
  }
  
  prisma = globalWithPrisma.prisma
}

export { prisma }