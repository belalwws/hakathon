import { NextRequest, NextResponse } from 'next/server'
import { getAllParticipants } from '@/lib/participants-storage'

// GET /api/admin/dashboard-stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const participants = getAllParticipants()
    
    // Calculate statistics
    const totalParticipants = participants.length
    const pendingParticipants = participants.filter(p => p.status === 'pending').length
    const approvedParticipants = participants.filter(p => p.status === 'approved').length
    const rejectedParticipants = participants.filter(p => p.status === 'rejected').length
    
    // Get recent participants (last 5)
    const recentParticipants = participants
      .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
      .slice(0, 5)
      .map(participant => ({
        id: participant.id,
        name: participant.name,
        email: participant.email,
        status: participant.status,
        registeredAt: participant.registeredAt,
        preferredRole: participant.preferredRole
      }))

    const stats = {
      totalParticipants,
      pendingParticipants,
      approvedParticipants,
      rejectedParticipants,
      recentParticipants
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
