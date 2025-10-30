import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Development mode bypass
    const isDevelopment = request.headers.get('x-development-mode') === 'true'
    
    if (!isDevelopment) {
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

    // Get last 6 months data for charts
    const now = new Date()
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    // Calculate monthly growth manually
    const monthlyGrowth = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      
      const [users, hackathons, organizations] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              gte: monthDate,
              lt: nextMonth,
            },
          },
        }),
        prisma.hackathon.count({
          where: {
            createdAt: {
              gte: monthDate,
              lt: nextMonth,
            },
          },
        }),
        prisma.organization.count({
          where: {
            createdAt: {
              gte: monthDate,
              lt: nextMonth,
            },
          },
        }),
      ])
      
      monthlyGrowth.push({
        month: monthNames[monthDate.getMonth()],
        users,
        hackathons,
        organizations,
      })
    }

    // Get plan distribution (real data from organizations)
    const planDistribution = await prisma.organization.groupBy({
      by: ['plan'],
      _count: {
        plan: true,
      },
    })

    // Get user role distribution
    const roleDistribution = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    })

    // Get hackathon status distribution
    const hackathonStatus = await prisma.hackathon.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    })

    // Calculate offboarded (inactive/cancelled organizations)
    const offboardedOrgs = await prisma.organization.count({
      where: {
        OR: [
          { status: 'suspended' },
          { status: 'cancelled' },
        ],
      },
    })

    const analytics = {
      monthlyGrowth,
      planDistribution: planDistribution.map(p => ({
        name: p.plan,
        value: p._count.plan,
      })),
      roleDistribution: roleDistribution.map(r => ({
        name: r.role,
        value: r._count.role,
      })),
      hackathonStatus: hackathonStatus.map(h => ({
        name: h.status,
        value: h._count.status,
      })),
      offboardedOrgs,
    }

    return NextResponse.json({ success: true, analytics })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
