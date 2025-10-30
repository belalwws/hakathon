import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { sendMail } from '@/lib/mailer'
import { getAllParticipants } from '@/lib/participants-storage'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const body = await request.json().catch(() => ({} as any))
    const type = body?.type || 'welcome'
    const toEmail = body?.to as string | undefined

    // Choose recipients
    let recipients: string[] = []
    if (toEmail) {
      recipients = [toEmail]
    } else {
      // Fallback to file-based participants
      const participants = getAllParticipants()
      recipients = participants.map(p => p.email).filter(Boolean)
    }
    if (recipients.length === 0) {
      return NextResponse.json({ error: 'لا يوجد مستلمين' }, { status: 400 })
    }

    const subject = type === 'welcome' ? '🎉 أهلاً بك في هاكاثون الابتكار' : body?.subject || 'رسالة من منظم الهاكاثون'
    const html = body?.html || `<div style="font-family:Tahoma,Arial">
      <h2>مرحباً بك!</h2>
      <p>يسعدنا انضمامك إلى هاكاثون الابتكار الحكومي.</p>
      <p>سنوافيك بآخر المستجدات قريباً.</p>
    </div>`

    // Send sequentially to avoid provider rate limits
    const results: any[] = []
    for (const to of recipients) {
      try {
        const info = await sendMail({ to, subject, html })
        results.push({ to, messageId: info.messageId })
      } catch (e: any) {
        results.push({ to, error: e?.message || 'failed' })
      }
    }

    return NextResponse.json({ sent: results.filter(r => r.messageId).length, results })
  } catch (e) {
    console.error('send-emails error', e)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
