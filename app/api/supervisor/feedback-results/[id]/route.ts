import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId } = params

    // Verify supervisor authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 403 })
    }

    // If supervisor, verify they have access to this hackathon
    if (payload.role === 'supervisor') {
      const supervisorAssignment = await prisma.supervisor.findFirst({
        where: {
          userId: payload.userId,
          hackathonId: hackathonId,
          isActive: true
        }
      })

      if (!supervisorAssignment) {
        return NextResponse.json({ error: 'غير مصرح بالوصول لهذا الهاكاثون' }, { status: 403 })
      }
    }

    // Get hackathon details
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: {
        id: true,
        title: true,
        participants: {
          select: { id: true }
        }
      }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Get all feedbacks for this hackathon
    const feedbacks = await prisma.feedback.findMany({
      where: { hackathonId },
      include: {
        participant: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate statistics
    const totalResponses = feedbacks.length
    const totalParticipants = hackathon.participants.length
    const responseRate = totalParticipants > 0 ? (totalResponses / totalParticipants) * 100 : 0

    let totalRating = 0
    const ratingDistribution: Record<number, number> = {}

    feedbacks.forEach(feedback => {
      totalRating += feedback.overallRating
      ratingDistribution[feedback.overallRating] = (ratingDistribution[feedback.overallRating] || 0) + 1
    })

    const averageRating = totalResponses > 0 ? totalRating / totalResponses : 0

    // Format feedbacks
    const formattedFeedbacks = feedbacks.map(f => ({
      id: f.id,
      participantName: f.participant.user.name,
      participantEmail: f.participant.user.email,
      overallRating: f.overallRating,
      responses: f.responses as Record<string, any>,
      suggestions: f.suggestions || undefined,
      createdAt: f.createdAt.toISOString()
    }))

    return NextResponse.json({
      hackathonTitle: hackathon.title,
      ratingScale: 5,
      feedbacks: formattedFeedbacks,
      stats: {
        totalResponses,
        averageRating,
        ratingDistribution,
        responseRate
      }
    })

  } catch (error) {
    console.error('Error fetching feedback results:', error)
    return NextResponse.json({ error: 'خطأ في تحميل نتائج التقييم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
