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

// GET /api/external/v1/hackathons/[id] - Get specific hackathon details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId } = params

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
    const includeForm = url.searchParams.get('includeForm') === 'true'
    const includeStats = url.searchParams.get('includeStats') === 'true'

    // Get hackathon details
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
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
        updatedAt: true,
        ...(includeStats && {
          _count: {
            select: {
              participants: true,
              teams: true,
              judges: true
            }
          }
        })
      }
    })

    if (!hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' }, 
        { status: 404, headers: corsHeaders }
      )
    }

    // Check if registration is open
    const now = new Date()
    const registrationOpen = hackathon.status === 'open' && 
                           (!hackathon.registrationDeadline || hackathon.registrationDeadline > now)

    // Get registration form if requested
    let registrationForm = null
    if (includeForm) {
      try {
        const form = await prisma.$queryRaw`
          SELECT * FROM hackathon_forms 
          WHERE hackathonId = ${hackathonId} AND isActive = 1
          LIMIT 1
        ` as any[]
        
        if (form.length > 0) {
          registrationForm = {
            id: form[0].id,
            title: form[0].title,
            description: form[0].description,
            fields: JSON.parse(form[0].fields || '[]'),
            settings: JSON.parse(form[0].settings || '{}')
          }
        }
      } catch (error) {
        console.log('Could not fetch registration form:', error)
      }
    }

    // Transform data for external API
    const response: any = {
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
      updatedAt: hackathon.updatedAt
    }

    if (includeStats && hackathon._count) {
      response.stats = {
        participants: hackathon._count.participants,
        teams: hackathon._count.teams,
        judges: hackathon._count.judges
      }
    }

    if (includeForm && registrationForm) {
      response.registrationForm = registrationForm
    }

    return NextResponse.json(response, { headers: corsHeaders })

  } catch (error) {
    console.error('Error fetching hackathon details:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500, headers: corsHeaders }
    )
  }
}
