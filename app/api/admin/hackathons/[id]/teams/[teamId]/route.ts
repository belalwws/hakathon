import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/admin/hackathons/[id]/teams/[teamId] - Delete a team
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; teamId: string }> }
) {
  try {
    const params = await context.params
    const { teamId } = params

    // First, unassign all participants from the team
    await prisma.participant.updateMany({
      where: {
        teamId: teamId
      },
      data: {
        teamId: null
      }
    })

    // Then delete the team
    await prisma.team.delete({
      where: {
        id: teamId
      }
    })

    return NextResponse.json({
      message: 'تم حذف الفريق بنجاح'
    })

  } catch (error) {
    console.error('Error deleting team:', error)
    return NextResponse.json({ error: 'خطأ في حذف الفريق' }, { status: 500 })
  }
}
