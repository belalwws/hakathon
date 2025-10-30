import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { generateToken } from "@/lib/auth"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        supervisor: true,
        participant: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 })
    }

    console.log('🔐 Force login for user:', {
      id: user.id,
      email: user.email,
      role: user.role,
      hasSupervisor: !!user.supervisor,
      hasParticipant: !!user.participant
    })

    // Generate token
    const authToken = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name
    })

    // Determine redirect based on role
    let redirectUrl = "/dashboard"
    switch (user.role) {
      case 'admin':
        redirectUrl = "/admin/dashboard"
        break
      case 'supervisor':
        redirectUrl = "/supervisor/dashboard"
        break
      case 'judge':
        redirectUrl = "/judge/dashboard"
        break
      case 'participant':
        redirectUrl = "/participant/dashboard"
        break
    }

    const response = NextResponse.json({
      message: "تم تسجيل الدخول بنجاح",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      redirect: redirectUrl
    })

    // Set cookie with all possible configurations
    response.cookies.set("auth-token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    })

    // Set backup cookie for debugging
    response.cookies.set("user-info", JSON.stringify({
      role: user.role,
      name: user.name,
      email: user.email
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    })

    console.log('🍪 Force login cookies set:', {
      authToken: authToken.substring(0, 20) + '...',
      userRole: user.role,
      redirect: redirectUrl
    })

    return response

  } catch (error) {
    console.error("Force login error:", error)
    return NextResponse.json({ error: "حدث خطأ في تسجيل الدخول" }, { status: 500 })
  }
}
