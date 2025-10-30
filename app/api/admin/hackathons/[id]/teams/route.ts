import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/hackathons/[id]/teams - Get all teams for a hackathon
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    // Allow both admin and supervisor
    if (!["admin", "supervisor"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    // If supervisor, verify they're assigned to this hackathon
    if (userRole === "supervisor") {
      const supervisor = await prisma.supervisor.findFirst({
        where: {
          userId: userId!,
          OR: [
            { hackathonId: hackathonId },
            { hackathonId: null } // General supervisor
          ],
          isActive: true
        }
      })

      if (!supervisor) {
        return NextResponse.json({
          error: "لست مشرفاً على هذا الهاكاثون"
        }, { status: 403 })
      }

      // Check permissions
      const permissions = supervisor.permissions as any
      if (permissions && permissions.canManageTeams === false) {
        return NextResponse.json({
          error: "ليس لديك صلاحية عرض الفرق"
        }, { status: 403 })
      }
    }

    const teams = await prisma.team.findMany({
      where: {
        hackathonId: hackathonId
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                city: true,
                nationality: true,
                preferredRole: true
              }
            }
          }
        }
      },
      orderBy: {
        teamNumber: 'asc'
      }
    })

    return NextResponse.json({
      teams: teams.map(team => ({
        id: team.id,
        name: team.name,
        teamNumber: team.teamNumber,
        projectName: team.ideaTitle,
        createdAt: team.createdAt,
        members: team.participants.map(participant => ({
          id: participant.id,
          registeredAt: participant.registeredAt,
          teamRole: participant.teamRole,
          additionalInfo: participant.additionalInfo,
          user: {
            name: participant.user.name,
            email: participant.user.email,
            phone: participant.user.phone,
            city: participant.user.city,
            nationality: participant.user.nationality,
            preferredRole: participant.user.preferredRole || 'مطور'
          }
        }))
      }))
    })

  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json({ error: 'خطأ في جلب الفرق' }, { status: 500 })
  }
}

// DELETE /api/admin/hackathons/[id]/teams - Delete all teams for a hackathon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params

    // First, remove team assignments from participants
    await prisma.participant.updateMany({
      where: {
        hackathonId: hackathonId,
        teamId: { not: null }
      },
      data: {
        teamId: null
      }
    })

    // Then delete all teams
    const deletedTeams = await prisma.team.deleteMany({
      where: {
        hackathonId: hackathonId
      }
    })

    return NextResponse.json({
      message: `تم حذف ${deletedTeams.count} فريق بنجاح`,
      deletedCount: deletedTeams.count
    })

  } catch (error) {
    console.error('Error deleting teams:', error)
    return NextResponse.json({ error: 'خطأ في حذف الفرق' }, { status: 500 })
  }
}
