import { NextRequest, NextResponse } from 'next/server'
import { getAllParticipants, updateParticipantStatus } from '@/lib/participants-storage'

// GET /api/admin/participants-temp - Get all participants from temporary storage
export async function GET(request: NextRequest) {
  try {
    const participants = getAllParticipants()
    
    // Transform data for frontend
    const transformedParticipants = participants.map(participant => ({
      id: participant.id,
      user: {
        name: participant.name,
        email: participant.email,
        phone: participant.phone,
        city: participant.city,
        nationality: participant.nationality
      },
      hackathon: {
        title: 'هاكاثون الابتكار التقني'
      },
      teamType: participant.teamType,
      teamRole: participant.preferredRole,
      status: participant.status,
      registeredAt: participant.registeredAt,
      team: null,
      additionalInfo: {
        teamPreference: participant.teamPreference,
        experience: participant.experience,
        motivation: participant.motivation,
        skills: participant.skills
      }
    }))

    return NextResponse.json(transformedParticipants)
  } catch (error) {
    console.error('Error fetching participants:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// PUT /api/admin/participants-temp - Update participant status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { participantId, status } = body

    if (!participantId || !status) {
      return NextResponse.json({ error: 'بيانات غير مكتملة' }, { status: 400 })
    }

    const success = updateParticipantStatus(participantId, status)
    
    if (!success) {
      return NextResponse.json({ error: 'المشارك غير موجود' }, { status: 404 })
    }

    return NextResponse.json({
      message: `تم ${status === 'approved' ? 'قبول' : status === 'rejected' ? 'رفض' : 'تحديث'} المشارك بنجاح`
    })

  } catch (error) {
    console.error('Error updating participant status:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
