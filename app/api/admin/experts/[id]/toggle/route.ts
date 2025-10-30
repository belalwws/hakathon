import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH /api/admin/experts/[id]/toggle - Toggle expert active status
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

    console.log('🔄 Toggling expert status:', { expertId: params.id, newStatus: isActive })

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'قيمة الحالة مطلوبة' }, { status: 400 })
    }

    // Check if expert exists
    const existingExpert = await prisma.expert.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!existingExpert) {
      return NextResponse.json({ error: 'الخبير غير موجود' }, { status: 404 })
    }

    // Update expert status
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

    console.log('✅ Expert status toggled successfully')

    return NextResponse.json({ 
      message: `تم ${isActive ? 'تفعيل' : 'إلغاء تفعيل'} الخبير "${existingExpert.user.name}" بنجاح`,
      expert: updated 
    })

  } catch (error) {
    console.error('❌ Error toggling expert status:', error)
    return NextResponse.json({ error: 'خطأ في تحديث حالة الخبير' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
