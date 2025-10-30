import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

const statusUpdateSchema = z.object({
  isActive: z.boolean()
})

// PUT /api/admin/users/[id]/status - Update user status
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const validation = statusUpdateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'بيانات غير صحيحة',
        details: validation.error.errors 
      }, { status: 400 })
    }

    const { isActive } = validation.data

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { isActive }
    })

    return NextResponse.json({
      message: `تم ${isActive ? 'تفعيل' : 'تعطيل'} المستخدم بنجاح`,
      user: {
        id: updatedUser.id,
        isActive: updatedUser.isActive
      }
    })

  } catch (error) {
    console.error('Error updating user status:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
