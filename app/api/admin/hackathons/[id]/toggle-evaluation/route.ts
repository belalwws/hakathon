import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { id: hackathonId } = await params
    const { evaluationOpen } = await request.json()

    const hackathon = await prisma.hackathon.update({
      where: { id: hackathonId },
      data: { evaluationOpen: evaluationOpen }
    })

    return NextResponse.json({
      message: evaluationOpen ? 'تم فتح التقييم بنجاح' : 'تم إغلاق التقييم بنجاح',
      hackathon
    })

  } catch (error) {
    console.error('Error toggling evaluation:', error)
    return NextResponse.json({ error: 'خطأ في تحديث حالة التقييم' }, { status: 500 })
  }
}
