import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const gmailUser = process.env.GMAIL_USER
    const gmailPass = process.env.GMAIL_PASS

    console.log('🔧 Gmail config check:', {
      hasUser: !!gmailUser,
      hasPass: !!gmailPass,
      userLength: gmailUser?.length || 0,
      passLength: gmailPass?.length || 0
    })

    if (!gmailUser || !gmailPass) {
      return NextResponse.json({ 
        error: 'Gmail credentials not configured',
        config: {
          hasUser: !!gmailUser,
          hasPass: !!gmailPass
        }
      }, { status: 500 })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    })

    console.log('📤 Attempting to send test email to:', email)
    
    const result = await transporter.sendMail({
      from: `منصة هاكاثون الابتكار التقني <${gmailUser}>`,
      to: email,
      subject: 'اختبار إرسال الإيميل',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #01645e;">اختبار إرسال الإيميل</h2>
          <p>هذا إيميل اختبار للتأكد من أن النظام يعمل بشكل صحيح.</p>
          <p><strong>الوقت:</strong> ${new Date().toLocaleString('ar-SA')}</p>
          <p><strong>البريد المرسل إليه:</strong> ${email}</p>
          <hr>
          <p style="color: #01645e; font-weight: bold;">منصة هاكاثون الابتكار التقني</p>
        </div>
      `
    })

    console.log('✅ Test email sent successfully:', result.messageId)

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: 'تم إرسال الإيميل بنجاح'
    })

  } catch (error) {
    console.error('❌ Test email failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
}
