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

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value || request.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    
    const payload = await verifyToken(token)
    // Only master can delete users
    if (!payload || payload.role !== 'master') {
      return NextResponse.json({ error: 'غير مصرح. يجب أن تكون Master Admin' }, { status: 403 })
    }

    const prismaClient = await getPrisma()
    if (!prismaClient) {
      return NextResponse.json({ error: 'تعذر تهيئة قاعدة البيانات' }, { status: 500 })
    }

    const resolvedParams = await params
    const userId = resolvedParams.id

    // Check if user exists
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    // Prevent deleting yourself
    if (user.id === payload.userId) {
      return NextResponse.json({ error: 'لا يمكنك حذف حسابك الخاص من هنا' }, { status: 400 })
    }

    console.log(`🗑️ Master admin deleting user: ${user.email}`)

    // Delete user and all related data in transaction
    await prismaClient.$transaction(async (tx: any) => {
      // Delete participant records
      await tx.participant.deleteMany({
        where: { userId: user.id }
      })

      // Delete judge records
      await tx.judge.deleteMany({
        where: { userId: user.id }
      })

      // Delete team memberships
      await tx.teamMember.deleteMany({
        where: { userId: user.id }
      })

      // Delete evaluations
      await tx.evaluation.deleteMany({
        where: { judgeId: user.id }
      })

      // Delete supervisions
      await tx.supervision.deleteMany({
        where: { supervisorId: user.id }
      })

      // If user is an admin, handle organization
      if (user.role === 'admin' && user.organizationId) {
        // Check if this is the only admin
        const otherAdmins = await tx.user.count({
          where: {
            organizationId: user.organizationId,
            role: 'admin',
            id: { not: user.id }
          }
        })

        if (otherAdmins === 0) {
          console.log('🗑️ Last admin - deleting organization as well')
          await tx.organization.delete({
            where: { id: user.organizationId }
          })
        }
      }

      // Finally, delete the user
      await tx.user.delete({
        where: { id: user.id }
      })
    })

    console.log(`✅ User deleted successfully: ${user.email}`)

    return NextResponse.json({ 
      message: `تم حذف المستخدم ${user.name} بنجاح`,
      deletedUser: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'خطأ في حذف المستخدم' }, { status: 500 })
  }
}

// GET /api/admin/users/[id] - Get user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value || request.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload || (payload.role !== 'admin' && payload.role !== 'master')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const prismaClient = await getPrisma()
    if (!prismaClient) {
      return NextResponse.json({ error: 'تعذر تهيئة قاعدة البيانات' }, { status: 500 })
    }

    const resolvedParams = await params
    const userId = resolvedParams.id

    // Get user with related data
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        city: true,
        nationality: true,
        role: true,
        createdAt: true,
        organizationId: true,
        _count: {
          select: {
            participations: true,
            judgements: true,
            teamMemberships: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    return NextResponse.json(user)

  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'خطأ في جلب بيانات المستخدم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
