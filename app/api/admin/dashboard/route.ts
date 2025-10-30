import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// GET /api/admin/dashboard - Get dashboard statistics
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

    // Lazy import prisma; if unavailable, return zeros
    let prisma: any
    try {
      prisma = (await import('@/lib/prisma')).prisma
    } catch (_) {
      prisma = null
    }

    if (!prisma) {
      return NextResponse.json({
        totalHackathons: 0,
        activeHackathons: 0,
        totalParticipants: 0,
        totalUsers: 0,
        totalTeams: 0,
        totalJudges: 0,
        recentHackathons: []
      })
    }

    try {
      // 🔒 MULTI-TENANT: Get admin's organization
      const adminUser = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          organizations: {
            include: {
              organization: true
            }
          }
        }
      })

      if (!adminUser || adminUser.organizations.length === 0) {
        return NextResponse.json({ error: 'لا توجد مؤسسة مرتبطة بهذا الحساب' }, { status: 400 })
      }

      const organizationId = adminUser.organizations[0].organization.id

      // 🔒 Get hackathons for THIS organization only
      const totalHackathons = await prisma.hackathon.count({
        where: { organizationId }
      })

      const activeHackathons = await prisma.hackathon.count({
        where: { 
          organizationId,
          status: 'open' as any 
        }
      })

      // 🔒 Get participants for THIS organization's hackathons only
      const totalParticipants = await prisma.participant.count({
        where: {
          hackathon: {
            organizationId
          }
        }
      })
      
      const pendingParticipants = await prisma.participant.count({
        where: { 
          status: 'pending' as any,
          hackathon: {
            organizationId
          }
        }
      })
      
      const approvedParticipants = await prisma.participant.count({
        where: { 
          status: 'approved' as any,
          hackathon: {
            organizationId
          }
        }
      })
      
      const rejectedParticipants = await prisma.participant.count({
        where: { 
          status: 'rejected' as any,
          hackathon: {
            organizationId
          }
        }
      })

      // 🔒 Get users in THIS organization only
      const totalUsers = await prisma.organizationUser.count({
        where: { organizationId }
      })

      // 🔒 Get teams for THIS organization's hackathons only
      const totalTeams = await prisma.team.count({
        where: {
          hackathon: {
            organizationId
          }
        }
      })

      // 🔒 Get judges for THIS organization's hackathons only
      const totalJudges = await prisma.judge.count({
        where: {
          hackathon: {
            organizationId
          }
        }
      })

      // 🔒 Get recent hackathons for THIS organization only (last 5)
      const recentHackathons = await prisma.hackathon.findMany({
        where: { organizationId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { participants: true, teams: true } } }
      })

    // Transform recent hackathons data
      const transformedRecentHackathons = recentHackathons.map((hackathon: any) => ({
      id: hackathon.id,
      title: hackathon.title,
      status: hackathon.status,
      participantCount: hackathon._count.participants,
      startDate: hackathon.startDate.toISOString()
      }))

      return NextResponse.json({
        totalHackathons,
        activeHackathons,
        totalParticipants,
        pendingParticipants,
        approvedParticipants,
        rejectedParticipants,
        totalUsers,
        totalTeams,
        totalJudges,
        recentHackathons: transformedRecentHackathons
      })
    } catch (e) {
      // On DB init/connection error, return zeros to keep dashboard usable
      console.error('Dashboard stats DB error (fallback to zeros):', e)
      return NextResponse.json({
        totalHackathons: 0,
        activeHackathons: 0,
        totalParticipants: 0,
        pendingParticipants: 0,
        approvedParticipants: 0,
        rejectedParticipants: 0,
        totalUsers: 0,
        totalTeams: 0,
        totalJudges: 0,
        recentHackathons: []
      })
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
