import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Development mode bypass
    const isDevelopment = request.headers.get('x-development-mode') === 'true'
    
    if (!isDevelopment) {
      // Verify master authentication in production
      const authHeader = request.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '')
      
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const payload = await verifyToken(token)
      if (!payload || payload.role !== 'master') {
        return NextResponse.json({ error: 'Forbidden - Master role required' }, { status: 403 })
      }
    }

    // Get platform-wide statistics
    const [
      totalOrganizations,
      totalUsers,
      totalHackathons,
      totalParticipants,
      organizations,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count(),
      prisma.hackathon.count(),
      prisma.participant.count(),
      prisma.organization.findMany({
        select: { plan: true, createdAt: true },
      }),
    ])

    // Calculate plans distribution
    const activePlans = organizations.reduce((acc: Record<string, number>, org: any) => {
      acc[org.plan] = (acc[org.plan] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentOrganizations = organizations.filter(org => 
      new Date(org.createdAt) >= thirtyDaysAgo
    ).length

    const [recentUsers, recentHackathons] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      prisma.hackathon.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
    ])

    const stats = {
      totalOrganizations,
      totalUsers,
      totalHackathons,
      totalParticipants,
      activePlans,
      recentActivity: {
        organizations: recentOrganizations,
        users: recentUsers,
        hackathons: recentHackathons,
      },
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
