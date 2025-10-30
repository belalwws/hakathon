import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

// GET /api/hackathons/pinned - Get pinned hackathon for homepage
export async function GET() {
  try {
    const pinnedHackathon = await prisma.hackathon.findFirst({
      where: { isPinned: true },
      include: {
        _count: {
          select: {
            participants: true
          }
        }
      }
    })

    if (!pinnedHackathon) {
      return NextResponse.json({ hackathon: null })
    }

    return NextResponse.json({ 
      hackathon: {
        ...pinnedHackathon,
        participantCount: pinnedHackathon._count.participants
      }
    })

  } catch (error) {
    console.error('Error fetching pinned hackathon:', error)
    return NextResponse.json({ error: 'خطأ في جلب الهاكاثون المثبت' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
