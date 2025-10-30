import { type NextRequest, NextResponse } from "next/server"
import { generateToken } from "@/lib/auth"
import { comparePassword } from "@/lib/password"
import { validateRequest, loginSchema } from "@/lib/validation"
import { rateLimit } from "@/lib/rate-limit"
import { getAllParticipants } from "@/lib/participants-storage"

async function executeWithRetry<T>(fn: () => Promise<T>, retries = 1): Promise<T | null> {
  try {
    return await fn()
  } catch (error: any) {
    if (retries > 0 && error?.message?.includes('Can\'t reach database')) {
      console.warn('🔄 DB connection failed, retrying in 1.2s...')
      await new Promise(r => setTimeout(r, 1200))
      return executeWithRetry(fn, retries - 1)
    }
    console.error('DB query failed:', error?.message)
    return null
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request, 5, 300000) // 5 attempts per 5 minutes
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: "تم تجاوز عدد محاولات تسجيل الدخول المسموحة" }, { status: 429 })
  }

  try {
    const body = await request.json()
    console.log('🔍 Login attempt with data:', { email: body.email, hasPassword: !!body.password, passwordLength: body.password?.length })

    const validation = validateRequest(loginSchema, body)

    if (!validation.success) {
      console.log('❌ Validation failed:', validation.error)
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { email, password } = validation.data

    // Development admin fallback (when DB is not available)
    const DEV_ADMIN_EMAIL = process.env.DEV_ADMIN_EMAIL || 'admin@hackathon.gov.sa'
    const DEV_ADMIN_PASSWORD = process.env.DEV_ADMIN_PASSWORD || 'admin123'
    if (email.toLowerCase() === DEV_ADMIN_EMAIL.toLowerCase() && password === DEV_ADMIN_PASSWORD) {
      const token = await generateToken({
        userId: 'dev-admin',
        email: DEV_ADMIN_EMAIL,
        role: 'admin',
        name: 'Dev Admin',
      })
      const response = NextResponse.json({
        token,
        user: { id: 'dev-admin', name: 'Dev Admin', email: DEV_ADMIN_EMAIL, role: 'admin', permissions: {}, activeHackathons: [] }
      })

      const cookieOptions: any = {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days to match JWT expiration
      }

      // Don't set domain - let browser handle it automatically
      // This works better with subdomains like .onrender.com

      response.cookies.set('auth-token', token, cookieOptions)
      console.log('✅ Dev admin cookie set with options:', cookieOptions)
      return response
    }

    // Find user by email (DB first) using lazy prisma import
    let user: any = null
    try {
      const { prisma } = await import("@/lib/prisma")
      user = await executeWithRetry(async () =>
        prisma.user.findUnique({
          where: { email },
          include: {
            adminActions: { include: { hackathon: true } },
            judgeAssignments: { include: { hackathon: true } },
            participations: { include: { hackathon: true } },
            supervisorAssignments: { include: { hackathon: true } }
          }
        })
      )

      // Update lastLogin, loginCount, isOnline, and lastActivity
      if (user) {
        await executeWithRetry(async () =>
          prisma.user.update({
            where: { id: user.id },
            data: {
              lastLogin: new Date(),
              loginCount: { increment: 1 },
              isOnline: true,
              lastActivity: new Date()
            }
          })
        )
      }
    } catch (err) {
      console.error('Error loading user from DB:', err)
      user = null
    }

    // Fallback to file-based participant store if no DB user found
    let fileParticipant: Awaited<ReturnType<typeof getAllParticipants>>[number] | null = null
    if (!user) {
      try {
        const participants = await getAllParticipants()
        const found = participants.find((p: any) => p.email.toLowerCase() === email.toLowerCase())
        if (found) {
          fileParticipant = found
        }
      } catch (_) {}
    }

    if (!user && !fileParticipant) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 })
    }

    const isValidPassword = user
      ? await comparePassword(password, user.password || '')
      : false // file participant doesn't have password in ParticipantData type
    if (!isValidPassword) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 })
    }

    if (user && !user.isActive) {
      return NextResponse.json({ error: "تم تعطيل حسابك من قبل الإدارة" }, { status: 403 })
    }

    // Determine user role and permissions
    let role = (user ? user.role.toLowerCase() : 'participant')
    let permissions = {}
    let activeHackathons = []

    if (user && user.role === 'admin') {
      // Check if super admin or hackathon admin
      const isSuperAdmin = user.adminActions.some((admin: any) => admin.hackathonId === null)
      permissions = {
        isSuperAdmin,
        canManageHackathons: isSuperAdmin,
        canManageUsers: isSuperAdmin,
        hackathonIds: user.adminActions.map((admin: any) => admin.hackathonId).filter(Boolean)
      }
    } else if (user && user.role === 'judge') {
      activeHackathons = user.judgeAssignments
        .filter((judge: any) => judge.isActive && judge.hackathon.isActive)
        .map((judge: any) => ({
          id: judge.hackathon.id,
          title: judge.hackathon.title
        }))
    } else if (user && user.role === 'supervisor') {
      // Handle supervisor role - fetch supervisor data
      try {
        const { prisma } = await import("@/lib/prisma")
        const supervisorData = await executeWithRetry(async () =>
          prisma.supervisor.findFirst({
            where: { userId: user.id, isActive: true },
            include: { hackathon: true }
          })
        )
        if (supervisorData) {
          permissions = supervisorData.permissions || {}
          if (supervisorData.hackathon) {
            activeHackathons = [{
              id: supervisorData.hackathon.id,
              title: supervisorData.hackathon.title
            }]
          }
        }
      } catch (error) {
        console.error('Error fetching supervisor data:', error)
      }
    } else if (user && user.role === 'participant') {
      activeHackathons = user.participations
        .filter((participation: any) => participation.status === 'approved' && participation.hackathon.isActive)
        .map((participation: any) => ({
          id: participation.hackathon.id,
          title: participation.hackathon.title
        }))
    }

    const token = await generateToken({
      userId: user ? user.id : fileParticipant!.id,
      email: user ? user.email : fileParticipant!.email,
      role: role as "admin" | "judge" | "participant" | "supervisor",
      name: user ? user.name : fileParticipant!.name,
    })

    const response = NextResponse.json({
      token,
      user: {
        id: user ? user.id : fileParticipant!.id,
        name: user ? user.name : fileParticipant!.name,
        email: user ? user.email : fileParticipant!.email,
        role: role,
        permissions,
        activeHackathons
      },
    })
    
    // Set cookie with proper settings for production
    const cookieOptions: any = {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days to match JWT expiration
    }

    // Don't set domain - let browser handle it automatically
    // Setting explicit domain can cause issues with subdomains like .onrender.com

    response.cookies.set("auth-token", token, cookieOptions)
    console.log('✅ Cookie set with options:', JSON.stringify(cookieOptions))
    console.log('🔑 Token length:', token.length, 'User:', email, 'Role:', role)

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 })
  }
}
