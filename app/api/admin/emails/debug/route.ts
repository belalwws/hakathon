import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { sendMail, mailerStatus } from '@/lib/mailer'

// GET /api/admin/emails/debug - Debug email configuration
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
      success: true,
      mailerStatus: status,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        GMAIL_USER: process.env.GMAIL_USER ? 'SET' : 'NOT SET',
        GMAIL_PASS: process.env.GMAIL_PASS ? 'SET' : 'NOT SET',
        SMTP_HOST: process.env.SMTP_HOST ? 'SET' : 'NOT SET',
        SMTP_PORT: process.env.SMTP_PORT ? 'SET' : 'NOT SET',
        SMTP_USER: process.env.SMTP_USER ? 'SET' : 'NOT SET',
        SMTP_PASS: process.env.SMTP_PASS ? 'SET' : 'NOT SET',
        EMAIL_FORCE_SEND: process.env.EMAIL_FORCE_SEND || 'NOT SET'
      }
    })
  } catch (error) {
    console.error('Debug email error:', error)
    return NextResponse.json({ 
      error: 'خطأ في فحص إعدادات البريد',
      details: error.message 
    }, { status: 500 })
  }
}

// POST /api/admin/emails/debug - Test send email
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { to, subject, message } = body

    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'البيانات المطلوبة مفقودة' }, { status: 400 })
    }

    console.log('🧪 [debug] Testing email send to:', to)
    
    const result = await sendMail({
      to,
      subject,
      html: message.replace(/\n/g, '<br>')
    })

    return NextResponse.json({
      success: true,
      result,
      message: 'تم إرسال البريد بنجاح'
    })
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ 
      error: 'خطأ في إرسال البريد',
      details: error.message 
    }, { status: 500 })
  }
}
