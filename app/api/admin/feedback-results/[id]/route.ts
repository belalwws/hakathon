import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) {
  try {
    const { id: hackathonId } = params

    // Verify admin
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch hackathon
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        feedbacks: {
          orderBy: { createdAt: 'desc' }
        },
        feedbackForm: true,
        participants: true
      }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 })
    }

    // Parse feedbacks
    const feedbacks = hackathon.feedbacks.map(f => ({
      id: f.id,
      participantName: f.participantName,
      participantEmail: f.participantEmail,
      overallRating: f.overallRating,
      responses: JSON.parse(f.responses),
      suggestions: f.suggestions,
      createdAt: f.createdAt.toISOString()
    }))

    // Calculate statistics
    const totalResponses = feedbacks.length
    const totalParticipants = hackathon.participants.length
    
    const averageRating = totalResponses > 0
      ? feedbacks.reduce((sum, f) => sum + f.overallRating, 0) / totalResponses
      : 0

    const ratingDistribution: Record<number, number> = {}
    const ratingScale = hackathon.feedbackForm?.ratingScale || 5
    
    for (let i = 1; i <= ratingScale; i++) {
      ratingDistribution[i] = 0
    }
    
    feedbacks.forEach(f => {
      ratingDistribution[f.overallRating] = (ratingDistribution[f.overallRating] || 0) + 1
    })

    const responseRate = totalParticipants > 0
      ? (totalResponses / totalParticipants) * 100
      : 0

    const stats = {
      totalResponses,
      averageRating,
      ratingDistribution,
      responseRate
    }

    return NextResponse.json({
      feedbacks,
      stats,
      hackathonTitle: hackathon.title,
      ratingScale
    })

  } catch (error) {
    console.error('Error fetching feedback results:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

