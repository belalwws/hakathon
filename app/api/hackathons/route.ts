import { NextRequest, NextResponse } from 'next/server'

// Lazy import prisma to avoid build-time errors
let prisma: any = null
async function getPrisma() {
  if (!prisma) {
    try {
      const { prisma: prismaClient } = await import('@/lib/prisma')
      prisma = prismaClient
    } catch (error) {
      console.error('Failed to import prisma:', error)
      return null
    }
  }
  return prisma
}

// GET /api/hackathons - Get hackathons for public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeAll = searchParams.get('all') === 'true'

    const prismaClient = await getPrisma()
    if (!prismaClient) {
      return NextResponse.json({ error: 'قاعدة البيانات غير متاحة' }, { status: 500 })
    }

    // Get hackathons based on filter
    const whereClause = includeAll ? {} : {
      status: {
        in: ['open', 'closed', 'completed']
      }
    }

    const hackathons = await prismaClient.hackathon.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        registrationDeadline: true,
        maxParticipants: true,
        status: true,
        prizes: true,
        requirements: true,
        categories: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform dates to ISO strings
    const publicHackathons = hackathons.map((hackathon: any) => ({
      ...hackathon,
      startDate: hackathon.startDate.toISOString(),
      endDate: hackathon.endDate.toISOString(),
      registrationDeadline: hackathon.registrationDeadline.toISOString(),
      createdAt: hackathon.createdAt.toISOString()
    }))

    return NextResponse.json({ hackathons: publicHackathons })

  } catch (error) {
    console.error('Error fetching hackathons:', error)
    return NextResponse.json({ error: 'خطأ في جلب الهاكاثونات' }, { status: 500 })
  }
}
