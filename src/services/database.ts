import { PrismaClient } from '@prisma/client'

// Global variable to store the Prisma instance
declare global {
  var __prisma: PrismaClient | undefined
}

// Create Prisma client instance
const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

// In development, store the instance globally to prevent multiple instances
if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma
}

export { prisma }
