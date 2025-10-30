import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/admin/hackathons/[id] - Get specific hackathon
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔍 Admin API: Fetching hackathon data')

    // Skip authentication for development
    // TODO: Re-enable authentication in production
    /*
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }
    */

    const resolvedParams = await params
    // Get hackathon basic info first
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!hackathon) {
      console.log('❌ Hackathon not found:', resolvedParams.id)
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Get participants separately to avoid schema issues
    let participants = []
    try {
      participants = await prisma.participant.findMany({
        where: { hackathonId: resolvedParams.id },
        select: {
          id: true,
          userId: true,
          hackathonId: true,
          teamName: true,
          projectTitle: true,
          projectDescription: true,
          githubRepo: true,
          teamRole: true,
          status: true,
          registeredAt: true,
          approvedAt: true,
          rejectedAt: true,
          teamId: true,
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
      })
      console.log('✅ Found participants:', participants.length)
    } catch (error) {
      console.log('⚠️ Could not fetch participants:', error.message)
    }

    // Get teams separately
    let teams = []
    try {
      teams = await prisma.team.findMany({
        where: { hackathonId: resolvedParams.id },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      })
      console.log('✅ Found teams:', teams.length)
    } catch (error) {
      console.log('⚠️ Could not fetch teams:', error.message)
    }

    console.log('✅ Hackathon data prepared successfully')

    // Transform data for frontend
    const transformedHackathon = {
      id: hackathon.id,
      title: hackathon.title,
      description: hackathon.description,
      startDate: hackathon.startDate ? hackathon.startDate.toISOString() : null,
      endDate: hackathon.endDate ? hackathon.endDate.toISOString() : null,
      registrationDeadline: hackathon.registrationDeadline ? hackathon.registrationDeadline.toISOString() : null,
      maxParticipants: hackathon.maxParticipants,
      status: hackathon.status,
      prizes: hackathon.prizes,
      requirements: hackathon.requirements,
      categories: hackathon.categories,
      settings: hackathon.settings,
      createdAt: hackathon.createdAt ? hackathon.createdAt.toISOString() : null,
      participants: participants.map(p => ({
        id: p.id,
        userId: p.userId,
        user: p.user,
        teamId: p.teamId,
        teamName: p.teamName,
        projectTitle: p.projectTitle,
        projectDescription: p.projectDescription,
        githubRepo: p.githubRepo,
        teamRole: p.teamRole,
        status: p.status,
        registeredAt: p.registeredAt ? p.registeredAt.toISOString() : null,
        approvedAt: p.approvedAt ? p.approvedAt.toISOString() : null,
        rejectedAt: p.rejectedAt ? p.rejectedAt.toISOString() : null
      })),
      teams: teams,
      stats: {
        totalParticipants: participants.length,
        totalTeams: teams.length,
        totalJudges: 0, // Will be calculated separately if needed
        pendingParticipants: participants.filter(p => p.status === 'pending').length,
        approvedParticipants: participants.filter(p => p.status === 'approved').length,
        rejectedParticipants: participants.filter(p => p.status === 'rejected').length
      }
    }

    return NextResponse.json({ hackathon: transformedHackathon })

  } catch (error) {
    console.error('Error fetching hackathon details:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// PATCH /api/admin/hackathons/[id] - Update hackathon status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { status, settings } = body

    // Validate status if provided
    if (status && !['draft', 'open', 'closed', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'حالة غير صحيحة' }, { status: 400 })
    }

    // Ensure at least one field is provided
    if (!status && !settings) {
      return NextResponse.json({ error: 'لا توجد بيانات للتحديث' }, { status: 400 })
    }

    const resolvedParams = await params
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}
    if (status) updateData.status = status
    if (settings) updateData.settings = settings

    // Update hackathon
    const updatedHackathon = await prisma.hackathon.update({
      where: { id: resolvedParams.id },
      data: updateData
    })

    const message = status && settings ? 'تم تحديث الهاكاثون بنجاح' :
                   status ? 'تم تحديث حالة الهاكاثون بنجاح' :
                   'تم تحديث إعدادات الهاكاثون بنجاح'

    return NextResponse.json({
      message,
      hackathon: updatedHackathon
    })

  } catch (error) {
    console.error('Error updating hackathon status:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// PUT /api/admin/hackathons/[id] - Update hackathon
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      requirements,
      categories,
      startDate,
      endDate,
      registrationDeadline,
      maxParticipants,
      status,
      prizes,
      settings
    } = body

    // Validate required fields
    if (!title || !startDate || !endDate) {
      return NextResponse.json({ error: 'الحقول المطلوبة مفقودة' }, { status: 400 })
    }

    const resolvedParams = await params

    // Check if hackathon exists
    const existingHackathon = await prisma.hackathon.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingHackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Update hackathon
    const updatedHackathon = await prisma.hackathon.update({
      where: { id: resolvedParams.id },
      data: {
        title,
        description: description || '',
        requirements: requirements || [],
        categories: categories || [],
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : existingHackathon.registrationDeadline,
        maxParticipants: maxParticipants || existingHackathon.maxParticipants,
        status: status || existingHackathon.status,
        prizes: prizes || existingHackathon.prizes,
        settings: settings || existingHackathon.settings
      },
      include: {
        _count: {
          select: {
            participants: true,
            teams: true,
            judges: true
          }
        }
      }
    })

    return NextResponse.json({
      id: updatedHackathon.id,
      title: updatedHackathon.title,
      description: updatedHackathon.description,
      startDate: updatedHackathon.startDate.toISOString(),
      endDate: updatedHackathon.endDate.toISOString(),
      participantCount: updatedHackathon._count.participants,
      teamCount: updatedHackathon._count.teams,
      judgeCount: updatedHackathon._count.judges
    })
  } catch (error) {
    console.error('Error updating hackathon:', error)
    return NextResponse.json({ error: 'خطأ في تحديث الهاكاثون' }, { status: 500 })
  }
}

// DELETE /api/admin/hackathons/[id] - Delete hackathon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params

    // Check if hackathon exists
    const existingHackathon = await prisma.hackathon.findUnique({
      where: { id: resolvedParams.id },
      include: {
        _count: {
          select: {
            participants: true,
            teams: true,
            judges: true,
            scores: true
          }
        }
      }
    })

    if (!existingHackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Delete all related data first (foreign key constraints)
    const deletedCounts = {
      participants: 0,
      teams: 0,
      judges: 0,
      scores: 0
    }

    // Delete participants
    if (existingHackathon._count.participants > 0) {
      const deletedParticipants = await prisma.participant.deleteMany({
        where: { hackathonId: resolvedParams.id }
      })
      deletedCounts.participants = deletedParticipants.count
    }

    // Delete teams if they exist
    if (existingHackathon._count.teams > 0) {
      const deletedTeams = await prisma.team.deleteMany({
        where: { hackathonId: resolvedParams.id }
      })
      deletedCounts.teams = deletedTeams.count
    }

    // Delete judges if they exist
    if (existingHackathon._count.judges > 0) {
      const deletedJudges = await prisma.judge.deleteMany({
        where: { hackathonId: resolvedParams.id }
      })
      deletedCounts.judges = deletedJudges.count
    }

    // Delete scores if they exist
    if (existingHackathon._count.scores > 0) {
      const deletedScores = await prisma.score.deleteMany({
        where: { hackathonId: resolvedParams.id }
      })
      deletedCounts.scores = deletedScores.count
    }

    // Finally delete the hackathon
    await prisma.hackathon.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      message: 'تم حذف الهاكاثون بنجاح',
      deletedData: deletedCounts
    })
  } catch (error) {
    console.error('Error deleting hackathon:', error)
    return NextResponse.json({ error: 'خطأ في حذف الهاكاثون' }, { status: 500 })
  }
}
