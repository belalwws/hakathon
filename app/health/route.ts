import { NextResponse } from 'next/server'

// Health check endpoint for Render
export async function GET() {
  try {
    // Check database connection
    let dbStatus = 'unknown'
    try {
      const { prisma } = await import('@/lib/prisma')
      await prisma.$queryRaw`SELECT 1`
      dbStatus = 'connected'
    } catch (error) {
      console.error('Database health check failed:', error)
      dbStatus = 'disconnected'
    }

    // Check environment variables
    const envStatus = {
      NODE_ENV: process.env.NODE_ENV || 'missing',
      DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'missing',
      JWT_SECRET: process.env.JWT_SECRET ? 'configured' : 'missing',
      GMAIL_USER: process.env.GMAIL_USER ? 'configured' : 'missing'
    }

    const isHealthy = dbStatus === 'connected' && 
                     process.env.DATABASE_URL && 
                     process.env.JWT_SECRET

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: envStatus,
      version: '1.0.0'
    }, { 
      status: isHealthy ? 200 : 503 
    })

  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    })
  }
}
