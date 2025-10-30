import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// DELETE /api/supervisor/hackathons/[id]/teams/[teamId] - Delete a team
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; teamId: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId, teamId } = params
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

    // Check if team exists
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        hackathonId: hackathonId
      }
    })

    if (!team) {
      return NextResponse.json({ error: 'الفريق غير موجود' }, { status: 404 })
    }

    // Unassign all participants from the team
    await prisma.participant.updateMany({
      where: {
        teamId: teamId
      },
      data: {
        teamId: null
      }
    })

    // Delete the team
    await prisma.team.delete({
      where: {
        id: teamId
      }
    })

    return NextResponse.json({
      message: `تم حذف ${team.name} بنجاح`
    })

  } catch (error) {
    console.error('Error deleting team:', error)
    return NextResponse.json({ error: 'خطأ في حذف الفريق' }, { status: 500 })
  }
}

