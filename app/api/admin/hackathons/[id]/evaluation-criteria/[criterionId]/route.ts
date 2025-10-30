import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

// DELETE /api/admin/hackathons/[id]/evaluation-criteria/[criterionId] - Delete evaluation criterion
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; criterionId: string }> }
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

    const { id: hackathonId, criterionId } = await params

    // Check if criterion exists and belongs to this hackathon
    const criterion = await prisma.evaluationCriterion.findFirst({
      where: {
        id: criterionId,
        hackathonId: hackathonId
      }
    })

    if (!criterion) {
      return NextResponse.json({ error: 'المعيار غير موجود' }, { status: 404 })
    }

    // Delete the criterion
    await prisma.evaluationCriterion.delete({
      where: { id: criterionId }
    })

    return NextResponse.json({ 
      message: 'تم حذف المعيار بنجاح'
    })

  } catch (error) {
    console.error('Error deleting evaluation criterion:', error)
    return NextResponse.json({ error: 'خطأ في حذف المعيار' }, { status: 500 })
  }
}
