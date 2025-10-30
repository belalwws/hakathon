import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/hackathons/[id]/file-tracking - Get file upload tracking for hackathon
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params

    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Get hackathon with teams and their file upload status
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: {
        id: true,
        title: true,
        teams: {
          select: {
            id: true,
            name: true,
            teamNumber: true,
            ideaTitle: true,
            ideaDescription: true,
            ideaFile: true,
            createdAt: true,
            updatedAt: true,
            participants: {
              select: {
                id: true,
                teamRole: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          },
          orderBy: { teamNumber: 'asc' }
        }
      }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Process teams data to include upload status
    const teamsWithStatus = hackathon.teams.map(team => {
      const hasUploadedFile = Boolean(team.ideaFile)
      const hasProjectInfo = Boolean(team.ideaTitle && team.ideaDescription)
      const completionStatus = hasUploadedFile && hasProjectInfo ? 'complete' : 
                              hasProjectInfo ? 'partial' : 'none'
      
      return {
        id: team.id,
        name: team.name,
        teamNumber: team.teamNumber,
        ideaTitle: team.ideaTitle,
        ideaDescription: team.ideaDescription,
        ideaFile: team.ideaFile,
        hasUploadedFile,
        hasProjectInfo,
        completionStatus,
        participantCount: team.participants.length,
        participants: team.participants,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
        lastActivity: team.updatedAt
      }
    })

    // Calculate statistics
    const totalTeams = teamsWithStatus.length
    const teamsWithFiles = teamsWithStatus.filter(t => t.hasUploadedFile).length
    const teamsWithProjectInfo = teamsWithStatus.filter(t => t.hasProjectInfo).length
    const completeTeams = teamsWithStatus.filter(t => t.completionStatus === 'complete').length
    const partialTeams = teamsWithStatus.filter(t => t.completionStatus === 'partial').length
    const noDataTeams = teamsWithStatus.filter(t => t.completionStatus === 'none').length

    const statistics = {
      totalTeams,
      teamsWithFiles,
      teamsWithProjectInfo,
      completeTeams,
      partialTeams,
      noDataTeams,
      fileUploadPercentage: totalTeams > 0 ? Math.round((teamsWithFiles / totalTeams) * 100) : 0,
      completionPercentage: totalTeams > 0 ? Math.round((completeTeams / totalTeams) * 100) : 0
    }

    return NextResponse.json({
      hackathonId: hackathon.id,
      hackathonTitle: hackathon.title,
      teams: teamsWithStatus,
      statistics
    })

  } catch (error) {
    console.error('Error fetching file tracking data:', error)
    return NextResponse.json({ error: 'خطأ في جلب بيانات تتبع الملفات' }, { status: 500 })
  }
}

// DELETE /api/admin/hackathons/[id]/file-tracking - Delete team files
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params

    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { teamIds, deleteType } = await request.json()

    if (!teamIds || !Array.isArray(teamIds) || teamIds.length === 0) {
      return NextResponse.json({ error: 'معرفات الفرق مطلوبة' }, { status: 400 })
    }

    // Verify hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { id: true, title: true }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    let updateData: any = {}
    let deletedCount = 0

    if (deleteType === 'files' || deleteType === 'all') {
      updateData.ideaFile = null
    }

    if (deleteType === 'project_info' || deleteType === 'all') {
      updateData.ideaTitle = null
      updateData.ideaDescription = null
    }

    // Update teams to remove specified data
    const result = await prisma.team.updateMany({
      where: {
        id: { in: teamIds },
        hackathonId: hackathonId
      },
      data: updateData
    })

    deletedCount = result.count

    console.log(`✅ Deleted ${deleteType} for ${deletedCount} teams in hackathon:`, hackathonId)

    return NextResponse.json({
      message: `تم حذف ${deleteType === 'files' ? 'الملفات' : deleteType === 'project_info' ? 'معلومات المشروع' : 'جميع البيانات'} بنجاح`,
      deletedCount,
      hackathonId: hackathon.id,
      hackathonTitle: hackathon.title
    })

  } catch (error) {
    console.error('Error deleting team files:', error)
    return NextResponse.json({ error: 'خطأ في حذف ملفات الفرق' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
