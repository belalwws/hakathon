import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/external/hackathon/[hackathonId] - Get hackathon info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hackathonId: string }> }
) {
  try {
    // Verify API Key
    const apiKey = request.headers.get('X-API-Key')
    const validApiKey = process.env.EXTERNAL_API_KEY || 'hackathon-api-key-2025'
    
    if (!apiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid API Key' },
        { status: 401 }
      )
    }

    const { hackathonId } = await params

    // Fetch hackathon with registration form
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        registrationForm: true,
        _count: {
          select: {
            participants: {
              where: {
                status: 'approved'
              }
            }
          }
        }
      }
    })

    if (!hackathon) {
      return NextResponse.json(
        { success: false, error: 'Hackathon not found' },
        { status: 404 }
      )
    }

    // Calculate status
    const now = new Date()
    const startDate = new Date(hackathon.startDate)
    const endDate = new Date(hackathon.endDate)

    let status: 'upcoming' | 'ongoing' | 'ended'
    if (now < startDate) {
      status = 'upcoming'
    } else if (now >= startDate && now <= endDate) {
      status = 'ongoing'
    } else {
      status = 'ended'
    }

    return NextResponse.json({
      success: true,
      hackathon: {
        id: hackathon.id,
        title: hackathon.title,
        description: hackathon.description,
        startDate: hackathon.startDate,
        endDate: hackathon.endDate,
        location: hackathon.location,
        maxParticipants: hackathon.maxParticipants,
        currentParticipants: hackathon._count.participants,
        status,
        registrationOpen: status === 'upcoming',
        registrationForm: hackathon.registrationForm ? {
          id: hackathon.registrationForm.id,
          title: hackathon.registrationForm.title,
          description: hackathon.registrationForm.description,
          fields: hackathon.registrationForm.fields
        } : null
      }
    })

  } catch (error) {
    console.error('❌ Hackathon info API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

