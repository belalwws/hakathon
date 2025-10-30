import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { sendMail } from '@/lib/mailer'

// POST /api/admin/emails/test-send - Test email sending
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { to, subject, message } = await request.json()

    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'البيانات المطلوبة مفقودة' }, { status: 400 })
    }

    console.log('🧪 [TEST-EMAIL] Testing email send to:', to)

    const result = await sendMail({
      to,
      subject,
      html: message.replace(/\n/g, '<br>'),
      text: message
    })

    return NextResponse.json({
      success: true,
      message: 'تم إرسال الإيميل التجريبي بنجاح',
      result: {
        messageId: result.messageId,
        mocked: result.mocked,
        actuallyMailed: result.actuallyMailed
      }
    })

  } catch (error) {
    console.error('Error testing email send:', error)
    return NextResponse.json({ 
      error: 'خطأ في إرسال الإيميل التجريبي',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
