import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// DELETE /api/supervisor/hackathons/[id]/teams/[teamId]/members/[participantId] - Remove member from team
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; teamId: string; participantId: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId, teamId, participantId } = params
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    // Verify supervisor is assigned to this hackathon
    if (userRole === "supervisor") {
      const supervisor = await prisma.supervisor.findFirst({
        where: {
          userId: userId!,
          hackathonId: hackathonId,
          isActive: true
        }
      })

      if (!supervisor) {
        return NextResponse.json({ 
          error: "غير مصرح - لست مشرفاً على هذا الهاكاثون" 
        }, { status: 403 })
      }

      // Check permissions
      const permissions = supervisor.permissions as any
      if (permissions && permissions.canManageTeams === false) {
        return NextResponse.json({ 
          error: "ليس لديك صلاحية إدارة الفرق" 
        }, { status: 403 })
      }
    }

    // Check if participant exists and is in the team
    const participant = await prisma.participant.findFirst({
      where: {
        id: participantId,
        hackathonId: hackathonId,
        teamId: teamId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        team: {
          select: {
            name: true
          }
        }
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'العضو غير موجود في هذا الفريق' }, { status: 404 })
    }

    // Remove participant from team
    await prisma.participant.update({
      where: { id: participantId },
      data: { teamId: null }
    })

    return NextResponse.json({
      message: `تم إزالة ${participant.user.name} من ${participant.team?.name} بنجاح`,
      removedMember: {
        name: participant.user.name,
        email: participant.user.email,
        fromTeam: participant.team?.name
      }
    })

  } catch (error) {
    console.error('Error removing member from team:', error)
    return NextResponse.json({ error: 'خطأ في إزالة العضو من الفريق' }, { status: 500 })
  }
}

