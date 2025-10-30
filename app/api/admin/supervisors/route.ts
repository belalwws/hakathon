import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/admin/supervisors - Get all supervisors
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    console.log('📋 Fetching supervisors...')

    // Get all supervisors with their user data
    const supervisors = await prisma.supervisor.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            createdAt: true,
            isActive: true
          }
        },
        hackathon: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Found ${supervisors.length} supervisors`)

    // Format the response
    const formattedSupervisors = supervisors.map(supervisor => ({
      id: supervisor.id,
      user: supervisor.user,
      hackathon: supervisor.hackathon,
      department: supervisor.department,
      permissions: supervisor.permissions,
      isActive: supervisor.isActive,
      assignedAt: supervisor.createdAt.toISOString()
    }))

    return NextResponse.json({ 
      supervisors: formattedSupervisors,
      total: supervisors.length
    })

  } catch (error) {
    console.error('❌ Error fetching supervisors:', error)
    return NextResponse.json({ 
      error: 'حدث خطأ في جلب المشرفين',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PATCH /api/admin/supervisors - Update supervisor status
export async function PATCH(request: NextRequest) {
  try {
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
    const { supervisorId, isActive } = body

    if (!supervisorId) {
      return NextResponse.json({ error: 'معرف المشرف مطلوب' }, { status: 400 })
    }

    console.log(`🔄 Updating supervisor ${supervisorId} status to ${isActive}`)

    // Update supervisor status
    const updatedSupervisor = await prisma.supervisor.update({
      where: { id: supervisorId },
      data: { isActive },
      include: {
        user: true
      }
    })

    // Also update user status if deactivating
    if (isActive === false) {
      await prisma.user.update({
        where: { id: updatedSupervisor.userId },
        data: { isActive: false }
      })
    }

    console.log(`✅ Supervisor ${supervisorId} updated successfully`)

    return NextResponse.json({
      message: 'تم تحديث حالة المشرف بنجاح',
      supervisor: updatedSupervisor
    })

  } catch (error) {
    console.error('❌ Error updating supervisor:', error)
    return NextResponse.json({ 
      error: 'حدث خطأ في تحديث المشرف',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE /api/admin/supervisors - Delete supervisor
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const supervisorId = searchParams.get('id')

    if (!supervisorId) {
      return NextResponse.json({ error: 'معرف المشرف مطلوب' }, { status: 400 })
    }

    console.log(`🗑️ Deleting supervisor ${supervisorId}`)

    // Get supervisor to find user
    const supervisor = await prisma.supervisor.findUnique({
      where: { id: supervisorId }
    })

    if (!supervisor) {
      return NextResponse.json({ error: 'المشرف غير موجود' }, { status: 404 })
    }

    // Delete supervisor record
    await prisma.supervisor.delete({
      where: { id: supervisorId }
    })

    // Optionally update user role back to participant
    await prisma.user.update({
      where: { id: supervisor.userId },
      data: { role: 'participant' }
    })

    console.log(`✅ Supervisor ${supervisorId} deleted successfully`)

    return NextResponse.json({
      message: 'تم حذف المشرف بنجاح'
    })

  } catch (error) {
    console.error('❌ Error deleting supervisor:', error)
    return NextResponse.json({ 
      error: 'حدث خطأ في حذف المشرف',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

