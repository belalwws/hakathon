import { NextRequest, NextResponse } from 'next/server'
import { HackathonStatus } from '@prisma/client'

// GET /api/hackathons/active - Get all active hackathons
export async function GET(request: NextRequest) {
  try {
    // Try to query DB; if prisma is unavailable, return empty list gracefully
    let activeHackathons: any[] = []
    try {
      const { prisma } = await import('@/lib/prisma')
      activeHackathons = await prisma.hackathon.findMany({
        where: {
          status: HackathonStatus.open,
          endDate: {
            gte: new Date()
          }
        },
        orderBy: { startDate: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          status: true,
          requirements: true,
          settings: true
        }
      })
    } catch (e) {
      // Prisma not generated or DB not ready
      activeHackathons = []
    }

    // Transform data for frontend
    const transformedHackathons = activeHackathons.map(hackathon => ({
      id: hackathon.id,
      title: hackathon.title,
      description: hackathon.description,
      startDate: hackathon.startDate.toISOString(),
      endDate: hackathon.endDate.toISOString(),
      status: hackathon.status,
      requirements: hackathon.requirements,
      settings: hackathon.settings
    }))

    return NextResponse.json(transformedHackathons)
  } catch (error) {
    console.error('Error fetching active hackathons:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
