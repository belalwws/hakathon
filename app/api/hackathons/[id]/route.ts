import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/hackathons/[id] - Get hackathon details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    console.log('🔍 Fetching hackathon:', resolvedParams.id)

    const hackathon = await prisma.hackathon.findUnique({
      where: { id: resolvedParams.id }
    })

    // Get participant count separately to avoid relation issues
    let participantCount = 0
    try {
      const participants = await prisma.participant.count({
        where: { hackathonId: resolvedParams.id }
      })
      participantCount = participants
    } catch (error) {
      console.log('⚠️ Could not count participants:', error.message)
    }

    console.log('📊 Hackathon found:', hackathon ? 'Yes' : 'No')

    if (!hackathon) {
      console.log('❌ Hackathon not found:', resolvedParams.id)
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Format the response with safe date handling
    const response = {
      id: hackathon.id,
      title: hackathon.title,
      description: hackathon.description,
      startDate: hackathon.startDate ? hackathon.startDate.toISOString() : null,
      endDate: hackathon.endDate ? hackathon.endDate.toISOString() : null,
      registrationDeadline: hackathon.registrationDeadline ? hackathon.registrationDeadline.toISOString() : null,
      maxParticipants: hackathon.maxParticipants,
      status: hackathon.status,
      prizes: hackathon.prizes,
      requirements: hackathon.requirements,
      categories: hackathon.categories,
      location: hackathon.location,
      participantCount: participantCount,
      createdAt: hackathon.createdAt ? hackathon.createdAt.toISOString() : null
    }

    console.log('✅ Hackathon data prepared successfully')
    return NextResponse.json({ hackathon: response })

  } catch (error) {
    console.error('Error fetching hackathon:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
