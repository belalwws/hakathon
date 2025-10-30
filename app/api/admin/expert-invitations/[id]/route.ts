import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// DELETE /api/admin/expert-invitations/[id] - Cancel invitation
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    console.log('🗑️ Cancelling invitation:', params.id)

    // Update invitation status to cancelled
    const invitation = await prisma.expertInvitation.update({
      where: { id: params.id },
      data: { status: 'cancelled' }
    })

    console.log('✅ Invitation cancelled successfully')

    return NextResponse.json({
      message: 'تم إلغاء الدعوة بنجاح',
      invitation
    })

  } catch (error) {
    console.error('❌ Error cancelling invitation:', error)
    return NextResponse.json({ error: 'خطأ في إلغاء الدعوة' }, { status: 500 })
  }
}

// PATCH /api/admin/expert-invitations/[id] - Resend invitation
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { action, expiresInDays = 7 } = body

    if (action === 'resend') {
      console.log('🔄 Resending invitation:', params.id)

      // Get current invitation
      const currentInvitation = await prisma.expertInvitation.findUnique({
        where: { id: params.id }
      })

      if (!currentInvitation) {
        return NextResponse.json({ error: 'الدعوة غير موجودة' }, { status: 404 })
      }

      // Update expiration date
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresInDays)

      const invitation = await prisma.expertInvitation.update({
        where: { id: params.id },
        data: {
          status: 'pending',
          expiresAt,
          updatedAt: new Date()
        }
      })

      // Generate invitation link
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      const invitationLink = `${baseUrl}/expert/register?token=${invitation.token}`

      console.log('✅ Invitation resent successfully')

      return NextResponse.json({
        message: 'تم إعادة إرسال الدعوة بنجاح',
        invitation,
        invitationLink
      })
    }

    return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 })

  } catch (error) {
    console.error('❌ Error updating invitation:', error)
    return NextResponse.json({ error: 'خطأ في تحديث الدعوة' }, { status: 500 })
  }
}
