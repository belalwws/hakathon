import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH /api/admin/experts/[id] - Update expert status
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

    console.log('🔄 Updating expert status:', { expertId: params.id, isActive })

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'قيمة الحالة مطلوبة' }, { status: 400 })
    }

    const updated = await prisma.expert.update({
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

    console.log('✅ Expert status updated successfully')

    return NextResponse.json({
      message: `تم ${isActive ? 'تفعيل' : 'إلغاء تفعيل'} الخبير بنجاح`,
      expert: updated
    })

  } catch (error) {
    console.error('❌ Error updating expert:', error)
    return NextResponse.json({ error: 'خطأ في تحديث الخبير' }, { status: 500 })
  }
}

// DELETE /api/admin/experts/[id] - Delete expert
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    console.log('🗑️ Deleting expert:', params.id)

    // Find the expert first to get user ID
    const expert = await prisma.expert.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!expert) {
      return NextResponse.json({ error: 'الخبير غير موجود' }, { status: 404 })
    }

    // Delete expert and user in transaction
    await prisma.$transaction(async (tx) => {
      // Delete expert assignment first
      await tx.expert.delete({
        where: { id: params.id }
      })

      // Delete user account
      await tx.user.delete({
        where: { id: expert.userId }
      })
    })

    console.log('✅ Expert deleted successfully')

    return NextResponse.json({ message: 'تم حذف الخبير بنجاح' })

  } catch (error) {
    console.error('❌ Error deleting expert:', error)
    return NextResponse.json({ error: 'خطأ في حذف الخبير' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
