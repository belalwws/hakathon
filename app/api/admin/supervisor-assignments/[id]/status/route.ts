import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

// PATCH /api/admin/supervisor-assignments/[id]/status - Toggle supervisor active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assignmentId } = await params
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { isActive } = body

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'حالة التفعيل مطلوبة' }, { status: 400 })
    }

    // Update supervisor assignment status
    const updatedAssignment = await prisma.supervisor.update({
      where: { id: assignmentId },
      data: {
        isActive: isActive,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
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

    return NextResponse.json({
      message: `تم ${isActive ? 'تفعيل' : 'تعطيل'} المشرف بنجاح`,
      assignment: updatedAssignment
    })

  } catch (error) {
    console.error("Error updating supervisor status:", error)
    return NextResponse.json({ 
      error: "حدث خطأ في تحديث حالة المشرف" 
    }, { status: 500 })
  }
}

