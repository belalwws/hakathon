import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Lazy import prisma to avoid build-time errors
let prisma: any = null
async function getPrisma() {
  if (!prisma) {
    try {
      const { prisma: prismaClient } = await import('@/lib/prisma')
      prisma = prismaClient
    } catch (error) {
      console.error('Failed to import prisma:', error)
      return null
    }
  }
  return prisma
}

// GET /api/admin/users - Get all users
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || request.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || (payload.role !== 'admin' && payload.role !== 'master')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const prismaClient = await getPrisma()
    if (!prismaClient) {
      return NextResponse.json({ error: 'تعذر تهيئة قاعدة البيانات' }, { status: 500 })
    }

    const users = await prismaClient.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        nationality: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            participations: true,
            judgements: true,
            teamMemberships: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data for frontend
    const transformedUsers = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      nationality: user.nationality,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      _count: user._count
    }))

    console.log('📊 API: Returning users:', transformedUsers.length)
    return NextResponse.json({ users: transformedUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
