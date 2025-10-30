import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// CORS headers for external API access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false',
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

// GET /api/external/countdown/[hackathonId] - Get countdown for hackathon
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
        { status: 401, headers: corsHeaders }
      )
    }

    const { hackathonId } = await params

    // Fetch hackathon
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        location: true,
        maxParticipants: true,
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
        { status: 404, headers: corsHeaders }
      )
    }

    // Calculate countdown
    const now = new Date()
    const startDate = new Date(hackathon.startDate)
    const endDate = new Date(hackathon.endDate)

    let status: 'upcoming' | 'ongoing' | 'ended'
    let targetDate: Date
    let countdownLabel: string

    if (now < startDate) {
      status = 'upcoming'
      targetDate = startDate
      countdownLabel = 'يبدأ خلال'
    } else if (now >= startDate && now <= endDate) {
      status = 'ongoing'
      targetDate = endDate
      countdownLabel = 'ينتهي خلال'
    } else {
      status = 'ended'
      targetDate = endDate
      countdownLabel = 'انتهى منذ'
    }

    const totalSeconds = Math.floor((targetDate.getTime() - now.getTime()) / 1000)
    const absTotalSeconds = Math.abs(totalSeconds)

    const days = Math.floor(absTotalSeconds / (24 * 60 * 60))
    const hours = Math.floor((absTotalSeconds % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((absTotalSeconds % (60 * 60)) / 60)
    const seconds = absTotalSeconds % 60

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
        countdown: {
          label: countdownLabel,
          days,
          hours,
          minutes,
          seconds,
          totalSeconds: status === 'ended' ? -absTotalSeconds : totalSeconds,
          formatted: `${days} يوم، ${hours} ساعة، ${minutes} دقيقة، ${seconds} ثانية`
        }
      }
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('❌ Countdown API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    )
  }
}

export const dynamic = 'force-dynamic'

