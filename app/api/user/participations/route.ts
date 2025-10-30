import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/user/participations - Get user's hackathon participations with team info
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'جلسة غير صالحة' }, { status: 401 })
    }

    // Get user's participations with hackathon and team info
    const participations = await prisma.participant.findMany({
      where: {
        userId: payload.userId
      },
      include: {
        hackathon: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            status: true
          }
        },
        team: {
          select: {
            id: true,
            name: true,
            teamNumber: true,
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    preferredRole: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        registeredAt: 'desc'
      }
    })

    // Transform data for frontend
    const transformedParticipations = participations.map(participation => ({
      id: participation.id,
      hackathon: {
        id: participation.hackathon.id,
        title: participation.hackathon.title,
        description: participation.hackathon.description,
        startDate: participation.hackathon.startDate.toISOString(),
        endDate: participation.hackathon.endDate.toISOString(),
        status: participation.hackathon.status
      },
      teamName: participation.teamName,
      projectTitle: participation.projectTitle,
      projectDescription: participation.projectDescription,
      teamRole: participation.teamRole,
      status: participation.status,
      registeredAt: participation.registeredAt.toISOString(),
      approvedAt: participation.approvedAt?.toISOString(),
      rejectedAt: participation.rejectedAt?.toISOString(),
      team: participation.team ? {
        id: participation.team.id,
        name: participation.team.name,
        teamNumber: participation.team.teamNumber,
        participants: participation.team.participants.map(participant => ({
          id: participant.id,
          user: {
            id: participant.user.id,
            name: participant.user.name,
            email: participant.user.email,
            preferredRole: participant.user.preferredRole || 'مطور'
          }
        }))
      } : null
    }))

    return NextResponse.json({
      participations: transformedParticipations
    })

  } catch (error) {
    console.error('Error fetching user participations:', error)
    return NextResponse.json({ error: 'خطأ في جلب المشاركات' }, { status: 500 })
  }
}
