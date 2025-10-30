import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/admin/simple-participants - Get all participants registered via simple registration
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

    // Get all participants with simple registration type
    const participants = await prisma.participant.findMany({
      where: {
        // Filter for simple registrations using JSON path
        additionalInfo: {
          path: ['registrationType'],
          equals: 'simple'
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            nationality: true,
            password: true // We'll check if it exists
          }
        },
        hackathon: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true
          }
        }
      },
      orderBy: {
        registeredAt: 'desc'
      }
    })

    // Transform the data to include hasPassword flag
    const transformedParticipants = participants.map(participant => ({
      id: participant.id,
      user: {
        id: participant.user.id,
        name: participant.user.name,
        email: participant.user.email,
        phone: participant.user.phone,
        city: participant.user.city,
        nationality: participant.user.nationality,
        hasPassword: !!participant.user.password // Convert to boolean
      },
      hackathon: participant.hackathon,
      teamRole: participant.teamRole,
      teamName: participant.teamName,
      projectTitle: participant.projectTitle,
      projectDescription: participant.projectDescription,
      status: participant.status,
      registeredAt: participant.registeredAt,
      additionalInfo: participant.additionalInfo
    }))

    return NextResponse.json({
      participants: transformedParticipants,
      total: transformedParticipants.length
    })

  } catch (error) {
    console.error('Error fetching simple participants:', error)
    return NextResponse.json({ 
      error: 'حدث خطأ في الخادم' 
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
