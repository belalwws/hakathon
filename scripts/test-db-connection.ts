/**
 * Test Database Connection
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('Testing database connection...')
    await prisma.$connect()
    console.log('✅ Connected to database successfully!')
    
    const count = await prisma.hackathon.count()
    console.log(`✅ Found ${count} hackathons in database`)
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
