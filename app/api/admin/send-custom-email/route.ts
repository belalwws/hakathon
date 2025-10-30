import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { sendMail } from '@/lib/mailer'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    console.log('📧 [custom-email] Request from:', payload.email, 'Role:', payload.role)

    // Get request body
    const body = await request.json()
    const { subject, bodyHtml, recipients, attachments } = body

    // Validate inputs
    if (!subject || !bodyHtml) {
      return NextResponse.json({ error: 'الموضوع والمحتوى مطلوبان' }, { status: 400 })
    }

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'يجب تحديد مستلم واحد على الأقل' }, { status: 400 })
    }

    console.log('📧 [custom-email] Sending to', recipients.length, 'recipients')
    console.log('📧 [custom-email] Subject:', subject)
    console.log('📧 [custom-email] Attachments:', attachments?.length || 0)

    // Send emails
    const results = {
      success: [] as string[],
      failed: [] as { email: string; error: string }[]
    }

    // Download attachments once (if any)
    let downloadedAttachments: any[] = []
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      console.log(`📎 [custom-email] Processing ${attachments.length} attachments...`)

      const attachmentPromises = attachments.map(async (att: any) => {
        try {
          console.log(`📥 [custom-email] Downloading attachment: ${att.name}`)

          if (!att.url) {
            console.error(`❌ [custom-email] Attachment ${att.name} has no URL`)
            return null
          }

          const response = await fetch(att.url)
          if (!response.ok) {
            console.error(`❌ [custom-email] Failed to download ${att.name}: ${response.status}`)
            return null
          }

          const buffer = Buffer.from(await response.arrayBuffer())
          console.log(`✅ [custom-email] Downloaded ${att.name}, size: ${buffer.length} bytes`)

          return {
            filename: att.name,
            content: buffer,
            contentType: att.type || 'application/octet-stream'
          }
        } catch (error) {
          console.error(`❌ [custom-email] Error downloading ${att.name}:`, error)
          return null
        }
      })

      downloadedAttachments = (await Promise.all(attachmentPromises)).filter(a => a !== null)
      console.log(`✅ [custom-email] Downloaded ${downloadedAttachments.length} attachments`)
    }

    for (const recipient of recipients) {
      try {
        console.log(`📧 [custom-email] Sending to: ${recipient.email}`)

        const mailOptions: any = {
          to: recipient.email,
          subject: subject,
          html: bodyHtml,
          text: bodyHtml.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        }

        // Add attachments if available
        if (downloadedAttachments.length > 0) {
          mailOptions.attachments = downloadedAttachments
        }

        await sendMail(mailOptions)

        results.success.push(recipient.email)
        console.log(`✅ [custom-email] Sent successfully to: ${recipient.email}`)
      } catch (error: any) {
        console.error(`❌ [custom-email] Failed to send to ${recipient.email}:`, error.message)
        results.failed.push({
          email: recipient.email,
          error: error.message
        })
      }
    }

    console.log('📊 [custom-email] Results:', {
      total: recipients.length,
      success: results.success.length,
      failed: results.failed.length
    })

    return NextResponse.json({
      success: true,
      results: {
        total: recipients.length,
        sent: results.success.length,
        failed: results.failed.length,
        successEmails: results.success,
        failedEmails: results.failed
      }
    })

  } catch (error: any) {
    console.error('❌ [custom-email] Error:', error)
    return NextResponse.json(
      { error: error.message || 'فشل إرسال الإيميلات' },
      { status: 500 }
    )
  }
}

