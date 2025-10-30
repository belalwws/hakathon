import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { sendMail } from "@/lib/mailer"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (userRole !== "supervisor") {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Get message templates (simulated - in real app, store in database)
    const templates = [
      {
        id: "welcome",
        title: "رسالة ترحيب",
        content: "مرحباً {name}، نرحب بك في هاكاثون الابتكار التقني. نتطلع لمشاركتك المميزة!"
      },
      {
        id: "reminder",
        title: "تذكير بالموعد",
        content: "عزيزي {name}، نذكرك بأن الهاكاثون سيبدأ في {date}. تأكد من حضورك في الوقت المحدد."
      },
      {
        id: "submission",
        title: "تذكير بتسليم المشروع",
        content: "مرحباً {name}، لا تنس تسليم مشروعك قبل انتهاء الموعد المحدد."
      },
      {
        id: "evaluation",
        title: "إشعار بدء التقييم",
        content: "عزيزي {name}، تم بدء مرحلة التقييم. ستتلقى النتائج قريباً."
      }
    ]

    return NextResponse.json({ templates })

  } catch (error) {
    console.error("Error fetching message templates:", error)
    return NextResponse.json({ error: "حدث خطأ في جلب القوالب" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (userRole !== "supervisor") {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    const body = await request.json()
    const { action, recipients, subject, message, templateId, customData } = body

    if (action === "send") {
      // Validate required fields
      if (!recipients || recipients.length === 0) {
        return NextResponse.json({ error: "يجب تحديد المستلمين" }, { status: 400 })
      }

      if (!subject || !message) {
        return NextResponse.json({ error: "الموضوع والرسالة مطلوبان" }, { status: 400 })
      }

      // Get recipients data
      let participantEmails = []

      if (recipients.includes("all")) {
        // Send to all approved participants
        const participants = await prisma.participant.findMany({
          where: { status: "approved" },
          include: {
            user: {
              select: {
                email: true,
                name: true
              }
            }
          }
        })
        participantEmails = participants.map(p => ({
          email: p.user.email,
          name: p.user.name
        }))
      } else if (recipients.includes("pending")) {
        // Send to pending participants
        const participants = await prisma.participant.findMany({
          where: { status: "pending" },
          include: {
            user: {
              select: {
                email: true,
                name: true
              }
            }
          }
        })
        participantEmails = participants.map(p => ({
          email: p.user.email,
          name: p.user.name
        }))
      } else {
        // Send to specific participants
        const participants = await prisma.participant.findMany({
          where: {
            userId: { in: recipients }
          },
          include: {
            user: {
              select: {
                email: true,
                name: true
              }
            }
          }
        })
        participantEmails = participants.map(p => ({
          email: p.user.email,
          name: p.user.name
        }))
      }

      if (participantEmails.length === 0) {
        return NextResponse.json({ error: "لم يتم العثور على مستلمين" }, { status: 400 })
      }

      // Send emails
      const emailPromises = participantEmails.map(async (participant) => {
        try {
          // Replace placeholders in message
          let personalizedMessage = message
          personalizedMessage = personalizedMessage.replace(/{name}/g, participant.name)
          personalizedMessage = personalizedMessage.replace(/{email}/g, participant.email)
          
          // Add custom data replacements if provided
          if (customData) {
            Object.keys(customData).forEach(key => {
              const placeholder = `{${key}}`
              personalizedMessage = personalizedMessage.replace(new RegExp(placeholder, 'g'), customData[key])
            })
          }

          await sendMail({
            to: participant.email,
            subject: subject,
            html: `
              <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
                <h2 style="color: #01645e;">${subject}</h2>
                <div style="white-space: pre-line; line-height: 1.6;">
                  ${personalizedMessage}
                </div>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">
                  هذه رسالة من منصة هاكاثون الابتكار التقني
                </p>
              </div>
            `
          })

          return { success: true, email: participant.email }
        } catch (error) {
          console.error(`Failed to send email to ${participant.email}:`, error)
          return { success: false, email: participant.email, error: error.message }
        }
      })

      const results = await Promise.all(emailPromises)
      const successful = results.filter(r => r.success).length
      const failed = results.filter(r => !r.success).length

      return NextResponse.json({
        message: `تم إرسال ${successful} رسالة بنجاح${failed > 0 ? ` وفشل في إرسال ${failed} رسالة` : ""}`,
        successful,
        failed,
        results
      })

    } else if (action === "preview") {
      // Preview message with sample data
      let previewMessage = message
      const sampleData = {
        name: "أحمد محمد",
        email: "ahmed@example.com",
        date: new Date().toLocaleDateString('ar-SA'),
        ...customData
      }

      Object.keys(sampleData).forEach(key => {
        const placeholder = `{${key}}`
        previewMessage = previewMessage.replace(new RegExp(placeholder, 'g'), sampleData[key])
      })

      return NextResponse.json({
        preview: previewMessage,
        sampleData
      })

    } else {
      return NextResponse.json({ error: "إجراء غير صالح" }, { status: 400 })
    }

  } catch (error) {
    console.error("Error processing message request:", error)
    return NextResponse.json({ error: "حدث خطأ في معالجة الطلب" }, { status: 500 })
  }
}

// Get participants for recipient selection
export async function PATCH(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role")

    if (userRole !== "supervisor") {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "all"

    let whereClause = {}
    if (status !== "all") {
      whereClause = { status }
    }

    const participants = await prisma.participant.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            city: true
          }
        },
        team: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        user: {
          name: "asc"
        }
      }
    })

    const formattedParticipants = participants.map(p => ({
      id: p.user.id,
      name: p.user.name,
      email: p.user.email,
      city: p.user.city,
      status: p.status,
      team: p.team?.name || "لا يوجد فريق"
    }))

    return NextResponse.json({ participants: formattedParticipants })

  } catch (error) {
    console.error("Error fetching participants:", error)
    return NextResponse.json({ error: "حدث خطأ في جلب المشاركين" }, { status: 500 })
  }
}
