import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { generateToken } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/judge/register-invitation?token=xxx - Verify invitation token
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'رمز الدعوة مطلوب' }, { status: 400 })
    }

    console.log('🔍 Verifying invitation token...')

    // Find invitation
    const invitation = await prisma.judgeInvitation.findUnique({
      where: { token }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'دعوة غير صالحة' }, { status: 404 })
    }

    // Check if invitation is already accepted
    if (invitation.status === 'accepted') {
      return NextResponse.json({ error: 'تم قبول هذه الدعوة بالفعل' }, { status: 400 })
    }

    // Check if invitation is cancelled
    if (invitation.status === 'cancelled') {
      return NextResponse.json({ error: 'تم إلغاء هذه الدعوة' }, { status: 400 })
    }

    // Check if invitation is expired
    if (new Date() > invitation.expiresAt) {
      // Update status to expired
      await prisma.judgeInvitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' }
      })
      return NextResponse.json({ error: 'انتهت صلاحية هذه الدعوة' }, { status: 400 })
    }

    // Get hackathon details
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: invitation.hackathonId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true
      }
    })

    console.log('✅ Invitation verified successfully')

    return NextResponse.json({
      invitation: {
        email: invitation.email,
        name: invitation.name,
        hackathonId: invitation.hackathonId
      },
      hackathon
    })

  } catch (error) {
    console.error('❌ Error verifying invitation:', error)
    return NextResponse.json({ error: 'خطأ في التحقق من الدعوة' }, { status: 500 })
  }
}

// POST /api/judge/register-invitation - Register judge using invitation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, name, phone, password } = body

    console.log('📝 Registering judge with invitation...')

    // Validate required fields
    if (!token || !name || !password) {
      return NextResponse.json({
        error: 'جميع الحقول مطلوبة'
      }, { status: 400 })
    }

    // Find invitation
    const invitation = await prisma.judgeInvitation.findUnique({
      where: { token }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'دعوة غير صالحة' }, { status: 404 })
    }

    // Check invitation status
    if (invitation.status === 'accepted') {
      return NextResponse.json({ error: 'تم قبول هذه الدعوة بالفعل' }, { status: 400 })
    }

    if (invitation.status === 'cancelled') {
      return NextResponse.json({ error: 'تم إلغاء هذه الدعوة' }, { status: 400 })
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.judgeInvitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' }
      })
      return NextResponse.json({ error: 'انتهت صلاحية هذه الدعوة' }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email }
    })

    if (existingUser) {
      return NextResponse.json({
        error: 'هذا البريد الإلكتروني مسجل بالفعل'
      }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and judge in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email: invitation.email,
          phone: phone || null,
          password: hashedPassword,
          role: 'judge'
        }
      })

      // Create judge record
      const judge = await tx.judge.create({
        data: {
          userId: user.id,
          hackathonId: invitation.hackathonId,
          isActive: true
        }
      })

      // Update invitation status
      await tx.judgeInvitation.update({
        where: { id: invitation.id },
        data: {
          status: 'accepted',
          acceptedAt: new Date()
        }
      })

      return { user, judge }
    })

    // Generate JWT token
    const authToken = await generateToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role
    })

    console.log('✅ Judge registered successfully')

    // Create response with cookie
    const response = NextResponse.json({
      message: 'تم التسجيل بنجاح',
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role
      }
    }, { status: 201 })

    // Set auth cookie
    response.cookies.set('auth-token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response

  } catch (error) {
    console.error('❌ Error registering judge:', error)
    return NextResponse.json({
      error: 'خطأ في التسجيل',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

