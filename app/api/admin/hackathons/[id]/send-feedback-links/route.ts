import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hackathonId = params.id

    // Verify admin
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch hackathon
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        participants: true,
        feedbackForm: true
      }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 })
    }

    // Check if feedback form is enabled
    if (!hackathon.feedbackForm || !hackathon.feedbackForm.isEnabled) {
      return NextResponse.json({ 
        error: 'Feedback form is not enabled. Please enable it first.' 
      }, { status: 400 })
    }

    // Get all participants
    const participants = hackathon.participants

    if (participants.length === 0) {
      return NextResponse.json({ error: 'No participants found' }, { status: 400 })
    }

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    // Generate feedback form link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const feedbackLink = `${baseUrl}/feedback/${hackathonId}`

    let successCount = 0
    let failureCount = 0

    // Send emails to all participants
    for (const participant of participants) {
      try {
        const emailHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header {
      background: linear-gradient(135deg, ${hackathon.feedbackForm.primaryColor}, ${hackathon.feedbackForm.secondaryColor});
      padding: 40px 20px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .greeting {
      font-size: 24px;
      color: #333;
      margin-bottom: 20px;
      font-weight: bold;
    }
    .message {
      font-size: 18px;
      color: #666;
      line-height: 1.8;
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, ${hackathon.feedbackForm.primaryColor}, ${hackathon.feedbackForm.secondaryColor});
      color: white;
      padding: 18px 40px;
      text-decoration: none;
      border-radius: 50px;
      font-size: 20px;
      font-weight: bold;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      transition: transform 0.3s;
    }
    .button:hover {
      transform: translateY(-3px);
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .emoji {
      font-size: 48px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⭐ قيّم تجربتك معنا</h1>
    </div>
    
    <div class="content">
      <div class="emoji">🎯</div>
      
      <div class="greeting">
        مرحباً ${participant.name}! 👋
      </div>
      
      <div class="message">
        شكراً لمشاركتك في <strong>${hackathon.title}</strong>!
        <br><br>
        نود معرفة رأيك وتقييمك للهاكاثون لمساعدتنا على تحسين تجربتك في الفعاليات القادمة.
        <br><br>
        رأيك مهم جداً لنا! 💚
      </div>
      
      <a href="${feedbackLink}" class="button">
        ⭐ قيّم الهاكاثون الآن
      </a>
      
      <div style="margin-top: 30px; font-size: 14px; color: #999;">
        أو انسخ الرابط التالي في المتصفح:
        <br>
        <a href="${feedbackLink}" style="color: ${hackathon.feedbackForm.primaryColor}; word-break: break-all;">
          ${feedbackLink}
        </a>
      </div>
    </div>
    
    <div class="footer">
      <p>
        <strong>${hackathon.title}</strong>
        <br>
        شكراً لك على وقتك! 🙏
      </p>
    </div>
  </div>
</body>
</html>
        `

        await transporter.sendMail({
          from: `"${hackathon.title}" <${process.env.SMTP_USER}>`,
          to: participant.email,
          subject: `⭐ قيّم تجربتك في ${hackathon.title}`,
          html: emailHtml
        })

        successCount++
      } catch (error) {
        console.error(`Failed to send feedback link to ${participant.email}:`, error)
        failureCount++
      }
    }

    return NextResponse.json({
      success: true,
      successCount,
      failureCount,
      totalCount: participants.length,
      message: `Sent feedback links to ${successCount} participants`
    })

  } catch (error) {
    console.error('Error sending feedback links:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

