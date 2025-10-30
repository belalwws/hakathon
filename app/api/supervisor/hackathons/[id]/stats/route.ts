import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/supervisor/hackathons/[id]/stats - Get hackathon statistics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    // Verify supervisor is assigned to this hackathon
    if (userRole === "supervisor") {
      const assignment = await prisma.supervisor.findFirst({
        where: {
          userId: userId!,
          hackathonId: hackathonId,
          isActive: true
        }
      })

      if (!assignment) {
        return NextResponse.json({ error: "غير مصرح - لست مشرفاً على هذا الهاكاثون" }, { status: 403 })
      }
    }

    // Get participants statistics
    const [
      totalParticipants,
      approvedParticipants,
      pendingParticipants,
      rejectedParticipants
    ] = await Promise.all([
      prisma.participant.count({ where: { hackathonId } }),
      prisma.participant.count({ where: { hackathonId, status: 'approved' } }),
      prisma.participant.count({ where: { hackathonId, status: 'pending' } }),
      prisma.participant.count({ where: { hackathonId, status: 'rejected' } })
    ])

    // Get teams statistics
    const [totalTeams, activeTeams] = await Promise.all([
      prisma.team.count({ where: { hackathonId } }),
      prisma.team.count({ where: { hackathonId, status: 'active' } })
    ])

    return NextResponse.json({
      stats: {
        totalParticipants,
        approvedParticipants,
        pendingParticipants,
        rejectedParticipants,
        totalTeams,
        activeTeams
      }
    })

  } catch (error) {
    console.error("Error fetching hackathon stats:", error)
    return NextResponse.json({ 
      error: "حدث خطأ في جلب الإحصائيات" 
    }, { status: 500 })
  }
}
