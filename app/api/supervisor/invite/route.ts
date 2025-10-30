import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import crypto from "crypto"
import { sendMail } from "@/lib/mailer"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (userRole !== "admin") {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, hackathonId, permissions, department } = body

    if (!email || !name) {
      return NextResponse.json({ error: "البريد الإلكتروني والاسم مطلوبان" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true }
    })

    if (existingUser) {
      return NextResponse.json({ error: "المستخدم موجود بالفعل" }, { status: 400 })
    }

    // Check if invitation already exists and is pending
    const existingInvitation = await prisma.supervisorInvitation.findFirst({
      where: {
        email,
        status: "pending"
      }
    })

    if (existingInvitation) {
      // حذف الدعوة القديمة وإنشاء دعوة جديدة
      await prisma.supervisorInvitation.delete({
        where: { id: existingInvitation.id }
      })
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex')
    
    // Set expiration date (7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Create invitation
    const invitation = await prisma.supervisorInvitation.create({
      data: {
        email,
        name,
        hackathonId: hackathonId || null,
        token,
        invitedBy: userId!,
        permissions: permissions || {},
        department: department || null,
        expiresAt,
        status: "pending"
      }
    })

    // Send invitation email
    const invitationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/invitation/${token}`
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">دعوة للانضمام كمشرف</h1>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">مرحباً ${name}،</p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            تم دعوتك للانضمام كمشرف في نظام إدارة الهاكاثونات. للمتابعة، يرجى النقر على الرابط أدناه لإنشاء كلمة المرور الخاصة بك:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" 
               style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              قبول الدعوة وإنشاء كلمة المرور
            </a>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              <strong>ملاحظة:</strong> هذا الرابط صالح لمدة 7 أيام فقط وسينتهي في ${expiresAt.toLocaleDateString('ar-SA')}
            </p>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            إذا لم تطلب هذه الدعوة، يرجى تجاهل هذا البريد الإلكتروني.
          </p>
        </div>
      </div>
    `

    await sendMail({
      to: email,
      subject: "دعوة للانضمام كمشرف - نظام إدارة الهاكاثونات",
      html: emailContent
    })

    return NextResponse.json({
      message: "تم إرسال الدعوة بنجاح",
      invitation: {
        id: invitation.id,
        email: invitation.email,
        name: invitation.name,
        expiresAt: invitation.expiresAt
      }
    })

  } catch (error) {
    console.error("Error creating supervisor invitation:", error)
    console.error("Error details:", JSON.stringify(error, null, 2))
    return NextResponse.json({ 
      error: "حدث خطأ في إرسال الدعوة",
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 })
  }
}

// Get all pending invitations
export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role")

    if (userRole !== "admin") {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    const invitations = await prisma.supervisorInvitation.findMany({
      where: {
        status: "pending",
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({ invitations })

  } catch (error) {
    console.error("Error fetching supervisor invitations:", error)
    return NextResponse.json({ error: "حدث خطأ في جلب الدعوات" }, { status: 500 })
  }
}

// DELETE - حذف دعوة معلقة
export async function DELETE(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role")

    if (userRole !== "admin") {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const invitationId = searchParams.get('id')

    if (!invitationId) {
      return NextResponse.json({ error: "معرف الدعوة مطلوب" }, { status: 400 })
    }

    // حذف الدعوة
    const deletedInvitation = await prisma.supervisorInvitation.delete({
      where: { id: invitationId }
    })

    return NextResponse.json({
      message: "تم حذف الدعوة بنجاح",
      deletedInvitation: {
        id: deletedInvitation.id,
        email: deletedInvitation.email
      }
    })

  } catch (error) {
    console.error("Error deleting supervisor invitation:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء حذف الدعوة" }, { status: 500 })
  }
}
