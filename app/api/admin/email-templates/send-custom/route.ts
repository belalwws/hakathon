import { NextRequest, NextResponse } from 'next/server'
import { sendMail } from '@/lib/mailer'

export async function POST(request: NextRequest) {
  try {
    // Allow both admin and supervisor
    const userRole = request.headers.get("x-user-role");
    if (!["admin", "supervisor"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 });
    }

    const { subject, body, recipients, hackathonId, filters } = await request.json()

    if (!subject || !body) {
      return NextResponse.json(
        { success: false, error: 'Subject and body are required' },
        { status: 400 }
      )
    }
    
    // هنا يمكنك إضافة منطق جلب المستلمين بناءً على الفلاتر
    // مثال بسيط: إرسال لإيميل تجريبي واحد
    
    const testEmail = 'admin@example.com' // يمكن تخصيصه
    
    await sendMail({
      to: testEmail,
      subject,
      html: `<div style="direction: rtl;">${body}</div>`
    })
    
    return NextResponse.json({
      success: true,
      sentCount: 1,
      message: 'Email sent successfully'
    })
  } catch (error) {
    console.error('Error sending custom email:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
