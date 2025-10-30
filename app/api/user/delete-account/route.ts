import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

/**
 * DELETE /api/user/delete-account
 * Delete user's own account
 */
export async function DELETE(req: NextRequest) {
  try {
    console.log('🗑️ User account deletion request received')

    // Get token from cookie or authorization header
    const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.split(' ')[1]

    if (!token) {
      console.log('❌ No authentication token found')
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }

    // Verify token
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      console.log('❌ Invalid token')
      return NextResponse.json(
        { error: 'رمز غير صالح' },
        { status: 401 }
      )
    }

    const userId = decoded.userId

    // Get confirmation password from request body
    const body = await req.json()
    const { password, confirmText } = body

    // Validate confirmation text
    if (confirmText !== 'DELETE') {
      return NextResponse.json(
        { error: 'يجب كتابة "DELETE" للتأكيد' },
        { status: 400 }
      )
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // Prevent deletion of admin/master accounts
    if (user.role === 'admin' || user.role === 'master') {
      return NextResponse.json(
        { error: 'لا يمكن حذف حسابات الإدارة. يرجى التواصل مع الدعم الفني.' },
        { status: 403 }
      )
    }

    // Verify password (only if password exists)
    if (user.password) {
      const bcrypt = await import('bcryptjs')
      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'كلمة المرور غير صحيحة' },
          { status: 401 }
        )
      }
    }

    console.log(`🗑️ Deleting user account: ${user.email}`)

    // Delete user and all related data
    await prisma.$transaction(async (tx) => {
      // Delete participant records
      await tx.participant.deleteMany({
        where: { userId: user.id }
      })

      // Delete judge records
      await tx.judge.deleteMany({
        where: { userId: user.id }
      })

      // Delete team members
      const teamMembers = await tx.teamMember?.deleteMany?.({
        where: { userId: user.id }
      }).catch(() => null)

      // Delete evaluations if exists
      const evaluations = await tx.evaluation?.deleteMany?.({
        where: { judgeId: user.id }
      }).catch(() => null)

      // Delete supervisions if exists
      const supervisions = await tx.supervision?.deleteMany?.({
        where: { supervisorId: user.id }
      }).catch(() => null)

      // Finally, delete the user
      await tx.user.delete({
        where: { id: user.id }
      })
    })

    console.log(`✅ User account deleted successfully: ${user.email}`)

    // Clear authentication cookie
    const response = NextResponse.json({
      message: 'تم حذف حسابك بنجاح'
    })

    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    })

    return response
  } catch (error) {
    console.error('❌ Error deleting user account:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الحساب' },
      { status: 500 }
    )
  }
}
