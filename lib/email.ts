// Lazy load nodemailer to avoid build-time errors
export async function getEmailTransporter() {
  const nodemailer = await import('nodemailer')
  
  const gmailUser = process.env.GMAIL_USER || 'racein668@gmail.com'
  const gmailPass = process.env.GMAIL_PASS || 'gpbyxbbvrzfyluqt'
  
  return nodemailer.default.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass
    }
  })
}

// Alternative transporter with custom config
export async function getCustomEmailTransporter(config?: {
  host?: string
  port?: number
  secure?: boolean
  user?: string
  pass?: string
}) {
  const nodemailer = await import('nodemailer')
  
  const host = config?.host || process.env.MAIL_HOST || 'smtp.gmail.com'
  const port = config?.port || parseInt(process.env.MAIL_PORT || '587')
  const secure = config?.secure ?? false
  const user = config?.user || process.env.MAIL_USER || process.env.GMAIL_USER
  const pass = config?.pass || process.env.MAIL_PASS || process.env.GMAIL_PASS
  
  return nodemailer.default.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  })
}

