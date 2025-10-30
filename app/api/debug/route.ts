import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug endpoint called')
    
    // Test database connection
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Test admin user
    const adminCount = await prisma.admin.count()
    console.log('👤 Admin count:', adminCount)
    
    // Test hackathon count
    const hackathonCount = await prisma.hackathon.count()
    console.log('🏆 Hackathon count:', hackathonCount)
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      message: 'Debug check passed',
      stats: {
        admins: adminCount,
        hackathons: hackathonCount
      }
    })
    
  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
