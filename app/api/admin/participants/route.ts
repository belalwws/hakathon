import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET /api/admin/participants - Get all participants
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Get all participants with related data
    const participants = await prisma.participant.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            city: true,
            nationality: true
          }
        },
        hackathon: {
          select: {
            title: true
          }
        },
        team: {
          select: {
            name: true,
            teamNumber: true
          }
        }
      },
      orderBy: {
        registeredAt: 'desc'
      }
    })

    // Transform data for frontend
    const transformedParticipants = participants.map(participant => ({
      id: participant.id,
      user: participant.user,
      hackathon: participant.hackathon,
      teamType: participant.teamType,
      teamRole: participant.teamRole,
      status: participant.status,
      registeredAt: participant.registeredAt.toISOString(),
      team: participant.team
    }))

    return NextResponse.json(transformedParticipants)
  } catch (error) {
    console.error('Error fetching participants:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
