import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { mailerStatus } from '@/lib/mailer'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const status = mailerStatus()
    const redacted = {
      ...status,
      hasFrom: !!(process.env.MAIL_FROM || process.env.SMTP_USER || process.env.GMAIL_USER),
    }
    return NextResponse.json({ status: redacted })
  } catch (e) {
    return NextResponse.json({ error: 'خطأ داخلي' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'

