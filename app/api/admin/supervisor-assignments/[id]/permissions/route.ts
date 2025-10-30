import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

// PATCH /api/admin/supervisor-assignments/[id]/permissions - Update supervisor permissions
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
    const { permissions } = body

    if (!permissions) {
      return NextResponse.json({ error: 'الصلاحيات مطلوبة' }, { status: 400 })
    }

    // Update supervisor assignment permissions
    const updatedAssignment = await prisma.supervisor.update({
      where: { id: assignmentId },
      data: {
        permissions: permissions,
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
      message: 'تم تحديث الصلاحيات بنجاح',
      assignment: updatedAssignment
    })

  } catch (error) {
    console.error("Error updating supervisor permissions:", error)
    return NextResponse.json({ 
      error: "حدث خطأ في تحديث الصلاحيات" 
    }, { status: 500 })
  }
}

