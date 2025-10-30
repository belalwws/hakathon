import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH /api/admin/judges/[id]/toggle - Toggle judge active status
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { isActive } = body

    console.log('🔄 Toggling judge status:', { judgeId: params.id, newStatus: isActive })

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'قيمة الحالة مطلوبة' }, { status: 400 })
    }

    // Check if judge exists
    const existingJudge = await prisma.judge.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!existingJudge) {
      return NextResponse.json({ error: 'المحكم غير موجود' }, { status: 404 })
    }

    // Update judge status
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

    console.log('✅ Judge status toggled successfully')

    return NextResponse.json({ 
      message: `تم ${isActive ? 'تفعيل' : 'إلغاء تفعيل'} المحكم "${existingJudge.user.name}" بنجاح`,
      judge: updated 
    })

  } catch (error) {
    console.error('❌ Error toggling judge status:', error)
    return NextResponse.json({ error: 'خطأ في تحديث حالة المحكم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
