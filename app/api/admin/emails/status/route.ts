import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { mailerStatus } from '@/lib/mailer'

// GET /api/admin/emails/status - Check email configuration status
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const status = mailerStatus()
    
    return NextResponse.json({
      status,
      configured: status.configured,
      provider: status.provider,
      mode: status.mode,
      message: status.configured 
        ? `البريد مُعد بشكل صحيح (${status.provider})`
        : 'البريد غير مُعد - يرجى إعداد SMTP أو Gmail'
    })

  } catch (error) {
    console.error('Error checking email status:', error)
    return NextResponse.json({ 
      error: 'خطأ في التحقق من حالة البريد',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
