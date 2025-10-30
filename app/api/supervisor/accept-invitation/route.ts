import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { generateToken } from "@/lib/auth"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password, confirmPassword } = body

    if (!token || !password || !confirmPassword) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "كلمات المرور غير متطابقة" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 })
    }

    // Find and validate invitation
    const invitation = await prisma.supervisorInvitation.findUnique({
      where: { token }
    })

    if (!invitation) {
      return NextResponse.json({ error: "رابط الدعوة غير صالح" }, { status: 400 })
    }

    if (invitation.status !== "pending") {
      return NextResponse.json({ error: "تم استخدام هذه الدعوة بالفعل" }, { status: 400 })
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: "انتهت صلاحية رابط الدعوة" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    })

    // Create user and supervisor in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      let user

      if (existingUser) {
        // Update existing user to supervisor role
        user = await tx.user.update({
          where: { id: existingUser.id },
          data: {
            name: invitation.name || existingUser.name,
            password: hashedPassword,
            role: "supervisor",
            isActive: true
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        })
      } else {
        // Create new user
        user = await tx.user.create({
          data: {
            name: invitation.name || "مشرف جديد",
            email: invitation.email,
            password: hashedPassword,
            role: "supervisor",
            isActive: true
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        })
      }

      // Delete existing supervisor record if exists
      await tx.supervisor.deleteMany({
        where: { userId: user.id }
      })

      // Create supervisor record
      const supervisor = await tx.supervisor.create({
        data: {
          userId: user.id,
          hackathonId: invitation.hackathonId,
          permissions: invitation.permissions || {},
          department: invitation.department,
          isActive: true
        }
      })

      // Update invitation status
      await tx.supervisorInvitation.update({
        where: { id: invitation.id },
        data: {
          status: "accepted",
          acceptedAt: new Date()
        }
      })

      return { user, supervisor }
    })

    console.log('✅ User created/updated:', {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      name: result.user.name
    })

    // Generate JWT token
    const authToken = await generateToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role as "supervisor",
      name: result.user.name
    })

    // Set cookie and redirect
    const response = NextResponse.json({
      message: "تم قبول الدعوة بنجاح",
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role
      },
      redirect: "/supervisor/dashboard"
    })

    // Set cookie with multiple attempts for compatibility
    response.cookies.set("auth-token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".ondigitalocean.app" : undefined
    })

    // Also set a backup cookie for debugging
    response.cookies.set("user-role", result.user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    })

    console.log('🍪 Setting cookies:', {
      authToken: authToken.substring(0, 20) + '...',
      userRole: result.user.role,
      secure: process.env.NODE_ENV === "production",
      domain: process.env.NODE_ENV === "production" ? ".ondigitalocean.app" : undefined
    })

    return response

  } catch (error) {
    console.error("Error accepting supervisor invitation:", error)
    console.error("Error details:", JSON.stringify(error, null, 2))
    return NextResponse.json({ 
      error: "حدث خطأ في قبول الدعوة",
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 })
  }
}

// Get invitation details by token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "رمز الدعوة مطلوب" }, { status: 400 })
    }

    const invitation = await prisma.supervisorInvitation.findUnique({
      where: { token },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        expiresAt: true,
        createdAt: true
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: "رابط الدعوة غير صالح" }, { status: 404 })
    }

    if (invitation.status !== "pending") {
      return NextResponse.json({ error: "تم استخدام هذه الدعوة بالفعل" }, { status: 400 })
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: "انتهت صلاحية رابط الدعوة" }, { status: 400 })
    }

    return NextResponse.json({ invitation })

  } catch (error) {
    console.error("Error fetching invitation details:", error)
    return NextResponse.json({ error: "حدث خطأ في جلب تفاصيل الدعوة" }, { status: 500 })
  }
}
