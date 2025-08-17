import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateToken } from "@/lib/auth"
import { comparePassword } from "@/lib/password"
import { validateRequest, loginSchema } from "@/lib/validation"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request, 5, 300000) // 5 attempts per 5 minutes
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: "تم تجاوز عدد محاولات تسجيل الدخول المسموحة" }, { status: 429 })
  }

  try {
    const body = await request.json()

    const validation = validateRequest(loginSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { email, password } = validation.data

    if (!email || !password) {
      return NextResponse.json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" }, { status: 400 })
    }

    // Check if user is admin
    const admin = await prisma.admin.findUnique({
      where: { email },
    })

    if (admin) {
      const isValidPassword = await comparePassword(password, admin.password_hash)
      if (!isValidPassword) {
        return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 })
      }

      const token = await generateToken({
        userId: admin.id,
        email: admin.email,
        role: "admin",
        name: admin.name,
      })

      const response = NextResponse.json({
        token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: "admin",
        },
      })
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24,
      })
      return response
    }

    // Check if user is judge
    const judge = await prisma.judge.findUnique({
      where: { email },
    })

    if (judge) {
      const isValidPassword = await comparePassword(password, judge.password_hash)
      if (!isValidPassword) {
        return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 })
      }

      if (!judge.is_active) {
        return NextResponse.json({ error: "تم تعطيل حسابك من قبل الإدارة" }, { status: 403 })
      }

      const token = await generateToken({
        userId: judge.id,
        email: judge.email,
        role: "judge",
        name: judge.name,
      })

      const response = NextResponse.json({
        token,
        user: {
          id: judge.id,
          name: judge.name,
          email: judge.email,
          role: "judge",
        },
      })
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24,
      })
      return response
    }

    return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}
