type MailOptions = {
  to: string | string[]
  subject: string
  text?: string
  html?: string
}

let cachedTransporter: any | null = null
let cachedStatus: { installed: boolean; provider: 'smtp' | 'gmail' | null; configured: boolean } | null = null
const FORCE_SEND = String(process.env.EMAIL_FORCE_SEND || '').toLowerCase() === 'true'

// Rate limiting: delay between emails to avoid Gmail spam detection
const EMAIL_DELAY_MS = 1000 // 1 second delay between emails
let lastEmailTime = 0

async function waitForRateLimit() {
  const now = Date.now()
  const timeSinceLastEmail = now - lastEmailTime
  
  if (timeSinceLastEmail < EMAIL_DELAY_MS) {
    const waitTime = EMAIL_DELAY_MS - timeSinceLastEmail
    console.log(`⏱️ [mailer] Rate limiting: waiting ${waitTime}ms before sending next email`)
    await new Promise(resolve => setTimeout(resolve, waitTime))
  }
  
  lastEmailTime = Date.now()
}

async function getMailer() {
  if (cachedTransporter) return cachedTransporter

  // Attempt to dynamically import nodemailer only if available
  let nodemailer: any
  try {
    console.log('🔧 [mailer] Attempting to import nodemailer...')
    // @ts-ignore - dynamic import at runtime; avoids build-time dependency
    nodemailer = (await import('nodemailer')).default
    console.log('✅ [mailer] Nodemailer imported successfully')
  } catch (error) {
    console.error('❌ [mailer] Failed to import nodemailer:', error)
    cachedStatus = { installed: false, provider: null, configured: false }
    if (FORCE_SEND) throw new Error('[mailer] nodemailer not installed')
    return null
  }

  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_PASS

  // Debug environment variables
  console.log('🔍 [mailer] Environment check:')
  console.log('🔍 [mailer] GMAIL_USER:', gmailUser ? 'SET' : 'NOT SET')
  console.log('🔍 [mailer] GMAIL_PASS:', gmailPass ? 'SET' : 'NOT SET')
  console.log('🔍 [mailer] SMTP_HOST:', host ? 'SET' : 'NOT SET')

  // 1) Preferred: explicit SMTP settings
  if (host && port && smtpUser && smtpPass) {
    const secure = Number(port) === 465
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user: smtpUser, pass: smtpPass },
    })
    cachedStatus = { installed: true, provider: 'smtp', configured: true }
    return cachedTransporter
  }

  // 2) Fallback: Gmail service if provided
  if (gmailUser && gmailPass) {
    console.log('🔧 [mailer] Creating Gmail transporter...')
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    })
    cachedStatus = { installed: true, provider: 'gmail', configured: true }
    console.log('✅ [mailer] Gmail transporter created successfully')
    return cachedTransporter
  }

  // 3) Not configured
  cachedStatus = { installed: true, provider: null, configured: false }
  if (FORCE_SEND) throw new Error('[mailer] SMTP not configured')
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[mailer] SMTP not configured. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS or GMAIL_USER/GMAIL_PASS')
  }
  return null

  return cachedTransporter
}

export async function sendMail(options: MailOptions) {
  // Apply rate limiting before sending
  await waitForRateLimit()
  
  console.log('📧 [mailer] Attempting to send email to:', options.to)
  console.log('🔍 [mailer] Environment check:')
  console.log('🔍 [mailer] GMAIL_USER:', process.env.GMAIL_USER ? 'SET' : 'NOT SET')
  console.log('🔍 [mailer] GMAIL_PASS:', process.env.GMAIL_PASS ? 'SET' : 'NOT SET')
  console.log('🔍 [mailer] NODE_ENV:', process.env.NODE_ENV)

  console.log('🔧 [mailer] Getting transporter...')
  const transporter = await getMailer()
  console.log('🔍 [mailer] Transporter result:', transporter ? 'AVAILABLE' : 'NOT AVAILABLE')
  
  const from = process.env.MAIL_FROM || `Hackathon <${process.env.SMTP_USER || process.env.GMAIL_USER || 'no-reply@example.com'}>`
  console.log('📧 [mailer] From address:', from)

  // If mailer not available (no nodemailer or env), log and noop so build/dev works
  if (!transporter) {
    console.warn('❌ [mailer] No transporter available! SMTP not configured properly.')
    console.warn('❌ [mailer] GMAIL_USER:', process.env.GMAIL_USER ? 'SET' : 'NOT SET')
    console.warn('❌ [mailer] GMAIL_PASS:', process.env.GMAIL_PASS ? 'SET' : 'NOT SET')

    if (process.env.NODE_ENV !== 'production') {
      console.warn('[mailer] Logging email instead of sending:')
      console.info('[mailer] To:', options.to)
      console.info('[mailer] Subject:', options.subject)
      if (options.text) console.info('[mailer] Text:', options.text?.substring(0, 100) + '...')
    }
    if (FORCE_SEND) throw new Error('[mailer] Mailer not configured and EMAIL_FORCE_SEND=true')
    return { messageId: `dev-${Date.now()}`, mocked: true, actuallyMailed: false }
  }

  console.log('✅ [mailer] Transporter ready, sending real email...')
  console.log('📧 [mailer] From:', from)
  console.log('📧 [mailer] To:', options.to)
  console.log('📧 [mailer] Subject:', options.subject)
  
  // Retry logic for Gmail rate limiting
  const MAX_RETRIES = 3
  let lastError: any = null
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await transporter.sendMail({ from, ...options })
      console.log('✅ [mailer] Email sent successfully:', result.messageId)
      return Object.assign(result || {}, { actuallyMailed: true })
    } catch (error: any) {
      lastError = error
      console.error(`❌ [mailer] Attempt ${attempt}/${MAX_RETRIES} failed:`, error.message)
      
      // Check if it's a rate limit error
      if (error.responseCode === 421 || error.code === 'EENVELOPE') {
        if (attempt < MAX_RETRIES) {
          const retryDelay = 2000 * attempt // 2s, 4s, 6s
          console.log(`⏱️ [mailer] Rate limit detected. Retrying in ${retryDelay}ms...`)
          await new Promise(resolve => setTimeout(resolve, retryDelay))
          continue
        }
      }
      
      // For other errors, throw immediately
      throw error
    }
  }
  
  // If all retries failed, throw the last error
  console.error('❌ [mailer] All retry attempts exhausted')
  throw lastError
}

/**
 * Send email using template system with attachments support
 */
export async function sendTemplatedEmail(
  templateType: keyof import('./email-templates').EmailTemplates,
  to: string,
  variables: Record<string, any>,
  hackathonId?: string
) {
  try {
    const { processEmailTemplate } = await import('./email-templates')
    const { subject, body, attachments } = await processEmailTemplate(templateType, variables, hackathonId)

    console.log(`📧 [mailer] Sending templated email (${templateType}) to:`, to)
    console.log(`📎 [mailer] Attachments found:`, attachments?.length || 0)
    console.log(`📎 [mailer] Attachments data:`, JSON.stringify(attachments, null, 2))

    // Fetch hackathon name for dynamic sender if hackathonId is provided
    let fromAddress: string | undefined = undefined
    if (hackathonId) {
      try {
        const { prisma } = await import('./prisma')
        const hackathon = await prisma.hackathon.findUnique({
          where: { id: hackathonId },
          select: { title: true }
        })
        if (hackathon) {
          fromAddress = `"${hackathon.title}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`
          console.log(`📧 [mailer] Using hackathon-specific sender: ${fromAddress}`)
        }
      } catch (error) {
        console.warn(`⚠️ [mailer] Failed to fetch hackathon for sender name:`, error)
      }
    }

    // Check if body is already HTML (contains HTML tags)
    const isHtml = /<[a-z][\s\S]*>/i.test(body)

    // Prepare mail options
    const mailOptions: any = {
      to,
      subject,
      html: isHtml ? body : body.replace(/\n/g, '<br>'),
      text: body.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
      ...(fromAddress && { from: fromAddress })
    }

    // ✅ Add attachments if available
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      console.log(`📎 [mailer] Processing ${attachments.length} attachments...`)

      // Download attachments from URLs and prepare for nodemailer
      const attachmentPromises = attachments.map(async (att: any) => {
        try {
          console.log(`📥 [mailer] Downloading attachment:`, {
            name: att.name,
            url: att.url,
            type: att.type,
            size: att.size
          })

          if (!att.url) {
            console.error(`❌ [mailer] Attachment ${att.name} has no URL`)
            return null
          }

          const response = await fetch(att.url)
          if (!response.ok) {
            console.error(`❌ [mailer] Failed to download attachment ${att.name}: ${response.status} ${response.statusText}`)
            return null
          }

          const buffer = Buffer.from(await response.arrayBuffer())
          console.log(`✅ [mailer] Downloaded ${att.name}, size: ${buffer.length} bytes`)

          return {
            filename: att.name,
            content: buffer,
            contentType: att.type || 'application/octet-stream'
          }
        } catch (error) {
          console.error(`❌ [mailer] Error downloading attachment ${att.name}:`, error)
          return null
        }
      })

      const downloadedAttachments = (await Promise.all(attachmentPromises)).filter(a => a !== null)

      if (downloadedAttachments.length > 0) {
        mailOptions.attachments = downloadedAttachments
        console.log(`✅ [mailer] Added ${downloadedAttachments.length} attachments to email`)
        console.log(`📎 [mailer] Attachment details:`, downloadedAttachments.map(a => ({
          filename: a.filename,
          size: a.content.length,
          type: a.contentType
        })))
      } else {
        console.warn(`⚠️ [mailer] No attachments were successfully downloaded`)
      }
    } else {
      console.log(`ℹ️ [mailer] No attachments to process (attachments:`, attachments, `)`)
    }

    console.log(`📧 [mailer] Final mail options:`, {
      to: mailOptions.to,
      subject: mailOptions.subject,
      hasHtml: !!mailOptions.html,
      attachmentCount: mailOptions.attachments?.length || 0
    })

    return await sendMail(mailOptions)
  } catch (error) {
    console.error(`❌ [mailer] Failed to send templated email (${templateType}):`, error)
    throw error
  }
}

export function mailerStatus() {
  const status = cachedStatus || { installed: !!cachedTransporter, provider: null as any, configured: !!cachedTransporter }
  const mode = FORCE_SEND ? 'force' : (process.env.NODE_ENV === 'production' ? 'prod' : 'dev')
  return { ...status, mode }
}

/**
 * Send multiple emails in batches with rate limiting
 * Useful for team assignments or bulk notifications
 */
export async function sendBulkEmails(
  emails: Array<{ to: string; subject: string; html?: string; text?: string }>,
  options?: { batchSize?: number; delayBetweenBatches?: number }
) {
  const batchSize = options?.batchSize || 5 // Send 5 emails at a time
  const delayBetweenBatches = options?.delayBetweenBatches || 3000 // 3 seconds between batches
  
  const results = {
    total: emails.length,
    sent: 0,
    failed: 0,
    errors: [] as Array<{ email: string; error: string }>
  }
  
  console.log(`📧 [mailer] Starting bulk send: ${emails.length} emails in batches of ${batchSize}`)
  
  // Process emails in batches
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize)
    const batchNumber = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(emails.length / batchSize)
    
    console.log(`📦 [mailer] Processing batch ${batchNumber}/${totalBatches} (${batch.length} emails)`)
    
    // Send all emails in current batch in parallel (with individual rate limiting)
    const batchPromises = batch.map(async (email) => {
      try {
        await sendMail(email)
        results.sent++
        return { success: true }
      } catch (error: any) {
        results.failed++
        results.errors.push({ 
          email: email.to, 
          error: error.message || 'Unknown error' 
        })
        console.error(`❌ [mailer] Failed to send to ${email.to}:`, error.message)
        return { success: false, error }
      }
    })
    
    await Promise.all(batchPromises)
    
    // Wait between batches (except for the last batch)
    if (i + batchSize < emails.length) {
      console.log(`⏱️ [mailer] Waiting ${delayBetweenBatches}ms before next batch...`)
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
    }
  }
  
  console.log(`✅ [mailer] Bulk send complete: ${results.sent} sent, ${results.failed} failed`)
  return results
}
