import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// POST /api/admin/notify-test - Test notification API
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      targetAudience, 
      filters = {},   
      subject,
      message,
      includeHackathonDetails = true
    } = body

    // Simulate successful email sending
    let sentCount = 0
    
    switch (targetAudience) {
      case 'all':
        sentCount = 25 // Simulate 25 users
        break
      case 'approved':
        sentCount = 5 // Simulate 5 approved participants
        break
      case 'city':
        sentCount = 10 // Simulate 10 users in selected city
        break
      case 'nationality':
        sentCount = 15 // Simulate 15 users of selected nationality
        break
      default:
        sentCount = 1
    }

    return NextResponse.json({ 
      message: `تم إرسال ${sentCount} إيميل بنجاح!`,
      sentCount,
      targetAudience,
      subject: subject || 'عنوان افتراضي',
      messagePreview: message?.substring(0, 100) + '...'
    })

  } catch (error) {
    console.error('Error in test notify API:', error)
    return NextResponse.json({ 
      error: 'خطأ في إرسال الإشعارات',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
