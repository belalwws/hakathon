import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import nodemailer from 'nodemailer'

// Test endpoint to verify email sending works
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 })
    }

    console.log('🧪 ========================================')
    console.log('🧪 TESTING EMAIL CONFIGURATION')
    console.log('🧪 ========================================')
    console.log('🧪 Test recipient:', email)
    console.log('🧪 GMAIL_USER:', process.env.GMAIL_USER)
    console.log('🧪 GMAIL_PASS:', process.env.GMAIL_PASS ? '***SET***' : 'NOT SET')
    console.log('🧪 EMAIL_USER:', process.env.EMAIL_USER)
    console.log('🧪 EMAIL_PASS:', process.env.EMAIL_PASS ? '***SET***' : 'NOT SET')

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || process.env.EMAIL_USER,
        pass: process.env.GMAIL_PASS || process.env.EMAIL_PASS
      }
    })

    console.log('🧪 Transporter created')

    // Verify transporter configuration
    try {
      await transporter.verify()
      console.log('✅ Transporter verified successfully!')
    } catch (verifyError) {
      console.error('❌ Transporter verification failed:', verifyError)
      return NextResponse.json({
        error: 'فشل التحقق من إعدادات الإيميل',
        details: verifyError instanceof Error ? verifyError.message : 'Unknown error'
      }, { status: 500 })
    }

    // Send test email
    const testHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 650px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
    .content { padding: 30px; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 13px; border-radius: 0 0 12px 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🧪 رسالة اختبار</h1>
    </div>
    <div class="content">
      <p style="font-size: 16px; line-height: 1.8;">مرحباً،</p>
      <p style="font-size: 16px; line-height: 1.8;">هذه رسالة اختبار من نظام إدارة الهاكاثونات.</p>
      <p style="font-size: 16px; line-height: 1.8;">إذا وصلتك هذه الرسالة، فهذا يعني أن نظام البريد الإلكتروني يعمل بشكل صحيح! ✅</p>
      <p style="font-size: 14px; color: #666; margin-top: 30px;">التاريخ: ${new Date().toLocaleString('ar-EG')}</p>
    </div>
    <div class="footer">
      <p>© 2025 نظام إدارة الهاكاثونات</p>
    </div>
  </div>
</body>
</html>
    `

    const mailOptions = {
      from: `"نظام الهاكاثونات - اختبار" <${process.env.GMAIL_USER || process.env.EMAIL_USER}>`,
      to: email,
      subject: '🧪 رسالة اختبار - نظام البريد الإلكتروني',
      html: testHtml,
      text: 'هذه رسالة اختبار من نظام إدارة الهاكاثونات. إذا وصلتك هذه الرسالة، فهذا يعني أن نظام البريد الإلكتروني يعمل بشكل صحيح!'
    }

    console.log('🧪 Sending test email...')
    console.log('🧪 From:', mailOptions.from)
    console.log('🧪 To:', mailOptions.to)
    console.log('🧪 Subject:', mailOptions.subject)

    const info = await transporter.sendMail(mailOptions)

    console.log('✅ ========================================')
    console.log('✅ TEST EMAIL SENT SUCCESSFULLY!')
    console.log('✅ ========================================')
    console.log('✅ MessageId:', info.messageId)
    console.log('✅ Response:', info.response)
    console.log('✅ Accepted:', info.accepted)
    console.log('✅ Rejected:', info.rejected)
    console.log('✅ Envelope:', info.envelope)
    console.log('✅ ========================================')

    return NextResponse.json({
      success: true,
      message: 'تم إرسال رسالة الاختبار بنجاح!',
      details: {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response
      }
    })

  } catch (error) {
    console.error('❌ ========================================')
    console.error('❌ TEST EMAIL FAILED!')
    console.error('❌ ========================================')
    console.error('❌ Error:', error)
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      responseCode: (error as any)?.responseCode,
      response: (error as any)?.response,
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    console.error('❌ ========================================')

    return NextResponse.json({
      error: 'فشل في إرسال رسالة الاختبار',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
