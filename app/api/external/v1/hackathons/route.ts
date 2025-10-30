import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// CORS headers for external API access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false',
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

// GET /api/external/v1/hackathons - Get list of hackathons
export async function GET(request: NextRequest) {
  try {
    // Get API key from headers
    const apiKey = request.headers.get('X-API-Key')
    if (!apiKey || apiKey !== process.env.EXTERNAL_API_KEY) {
      return NextResponse.json(
        { error: 'Invalid API key' }, 
        { status: 401, headers: corsHeaders }
      )
    }

    // Get query parameters
    const url = new URL(request.url)
    const status = url.searchParams.get('status') // open, closed, completed
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const includeStats = url.searchParams.get('includeStats') === 'true'

    // Build where clause
    const where: any = {}
    if (status) {
      where.status = status
    }

    // Get hackathons
    const hackathons = await prisma.hackathon.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        registrationDeadline: true,
        maxParticipants: true,
        requirements: true,
        categories: true,
        prizes: true,
        settings: true,
        isPinned: true,
        createdAt: true,
        ...(includeStats && {
          _count: {
            select: {
              participants: true,
              teams: true,
              judges: true
            }
          }
        })
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: offset,
      take: Math.min(limit, 50) // Max 50 items per request
    })

    // Get total count
    const totalCount = await prisma.hackathon.count({ where })

    // Transform data for external API
    const transformedHackathons = hackathons.map(hackathon => {
      const now = new Date()
      const registrationOpen = hackathon.status === 'open' && 
                             (!hackathon.registrationDeadline || hackathon.registrationDeadline > now)

      return {
        id: hackathon.id,
        title: hackathon.title,
        description: hackathon.description,
        status: hackathon.status,
        startDate: hackathon.startDate,
        endDate: hackathon.endDate,
        registrationDeadline: hackathon.registrationDeadline,
        maxParticipants: hackathon.maxParticipants,
        requirements: hackathon.requirements,
        categories: hackathon.categories,
        prizes: hackathon.prizes,
        settings: hackathon.settings,
        isPinned: hackathon.isPinned,
        registrationOpen,
        createdAt: hackathon.createdAt,
        ...(includeStats && hackathon._count && {
          stats: {
            participants: hackathon._count.participants,
            teams: hackathon._count.teams,
            judges: hackathon._count.judges
          }
        })
      }
    })

    return NextResponse.json({
      hackathons: transformedHackathons,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error fetching hackathons:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500, headers: corsHeaders }
    )
  }
}
