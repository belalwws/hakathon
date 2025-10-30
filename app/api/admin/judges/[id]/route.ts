import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH /api/admin/judges/[id] - Update judge status
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { isActive } = body

    console.log('🔄 Updating judge status:', { judgeId: params.id, isActive })

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'قيمة الحالة مطلوبة' }, { status: 400 })
    }

    const updated = await prisma.judge.update({
      where: { id: params.id },
      data: { isActive },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true
          }
        },
        hackathon: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    console.log('✅ Judge status updated successfully')

    return NextResponse.json({
      message: `تم ${isActive ? 'تفعيل' : 'إلغاء تفعيل'} المحكم بنجاح`,
      judge: updated
    })

  } catch (error) {
    console.error('❌ Error updating judge:', error)
    return NextResponse.json({ error: 'خطأ في تحديث المحكم' }, { status: 500 })
  }
}

// DELETE /api/admin/judges/[id] - Delete judge
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    console.log('🗑️ Deleting judge:', params.id)

    // Find the judge first to get user ID
    const judge = await prisma.judge.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!judge) {
      return NextResponse.json({ error: 'المحكم غير موجود' }, { status: 404 })
    }

    // Delete judge and user in transaction
    await prisma.$transaction(async (tx) => {
      // Delete judge assignment first
      await tx.judge.delete({
        where: { id: params.id }
      })

      // Delete user account
      await tx.user.delete({
        where: { id: judge.userId }
      })
    })

    console.log('✅ Judge deleted successfully')

    return NextResponse.json({ message: 'تم حذف المحكم بنجاح' })

  } catch (error) {
    console.error('❌ Error deleting judge:', error)
    return NextResponse.json({ error: 'خطأ في حذف المحكم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'