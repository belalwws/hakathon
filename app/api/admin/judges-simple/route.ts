import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET /api/admin/judges-simple - Get all users with judge role (simplified)
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    console.log('📋 Fetching judge users (simplified)...')

    // Get all users with judge role
    const judgeUsers = await prisma.user.findMany({
      where: { role: 'judge' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Found ${judgeUsers.length} judge users`)

    // Format as judge objects for compatibility
    const judges = judgeUsers.map(user => ({
      id: user.id,
      userId: user.id,
      hackathonId: null,
      isActive: true,
      assignedAt: user.createdAt,
      user: user,
      hackathon: null,
      _count: { scores: 0 }
    }))

    return NextResponse.json({
      judges,
      total: judges.length,
      active: judges.length,
      inactive: 0,
      simplified: true
    })

  } catch (error) {
    console.error('❌ Error fetching judge users:', error)
    return NextResponse.json({ 
      error: 'خطأ في جلب المحكمين',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/admin/judges-simple - Create new judge user (simplified)
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, password } = body

    console.log('🔨 Creating new judge user (simplified):', { name, email })

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({
        error: 'الاسم والإيميل وكلمة المرور مطلوبة'
      }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({
        error: 'هذا الإيميل مستخدم بالفعل'
      }, { status: 400 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user with judge role
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        phone: phone || null,
        role: 'judge'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    })

    console.log('✅ Judge user created successfully:', user.id)

    // Format as judge object for compatibility
    const judge = {
      id: user.id,
      userId: user.id,
      hackathonId: null,
      isActive: true,
      assignedAt: user.createdAt,
      user: user,
      hackathon: null
    }

    return NextResponse.json({
      message: 'تم إنشاء المحكم بنجاح',
      judge: judge,
      credentials: {
        email,
        password // Return for admin to share with judge
      },
      simplified: true
    })

  } catch (error) {
    console.error('❌ Error creating judge user:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
    })
    
    let errorMessage = 'خطأ في إنشاء المحكم'
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        errorMessage = 'هذا الإيميل مستخدم بالفعل'
      } else if (error.message.includes('password')) {
        errorMessage = 'خطأ في تشفير كلمة المرور'
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
