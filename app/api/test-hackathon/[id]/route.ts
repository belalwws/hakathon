import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🚀 TEST: Hackathon check started')
    
    const { id: hackathonId } = await params
    console.log('🆔 Checking hackathon ID:', hackathonId)
    
    // Step 1: Check if Prisma is working
    try {
      console.log('✅ Step 1: Testing Prisma connection...')
      await prisma.$queryRaw`SELECT 1 as test`
      console.log('✅ Step 1: Prisma connection successful')
    } catch (error) {
      console.error('❌ Step 1: Prisma connection failed:', error)
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
    
    // Step 2: Check if hackathon exists
    try {
      console.log('✅ Step 2: Looking for hackathon...')
      const hackathon = await prisma.hackathon.findUnique({
        where: { id: hackathonId },
        select: { 
          id: true, 
          title: true, 
          certificateTemplate: true,
          status: true,
          createdAt: true
        }
      })
      
      if (!hackathon) {
        console.log('❌ Step 2: Hackathon not found')
        return NextResponse.json({ 
          error: 'Hackathon not found',
          hackathonId: hackathonId
        }, { status: 404 })
      }
      
      console.log('✅ Step 2: Hackathon found:', hackathon)
      
      return NextResponse.json({
        success: true,
        message: 'Hackathon check completed successfully',
        hackathon: hackathon
      })
      
    } catch (error) {
      console.error('❌ Step 2: Hackathon lookup failed:', error)
      return NextResponse.json({ 
        error: 'Hackathon lookup failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        hackathonId: hackathonId
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('❌ TEST: Unexpected error:', error)
    return NextResponse.json({
      error: 'Test failed: ' + (error.message || 'Unknown error'),
      stack: error.stack
    }, { status: 500 })
  }
}
