import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/admin/hackathons/[id]/evaluation-criteria - Get evaluation criteria
export async function GET(
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

    const criteria = await prisma.evaluationCriterion.findMany({
      where: { hackathonId },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ criteria })

  } catch (error) {
    console.error('Error fetching evaluation criteria:', error)
    return NextResponse.json({ error: 'خطأ في جلب معايير التقييم' }, { status: 500 })
  }
}

// POST /api/admin/hackathons/[id]/evaluation-criteria - Add evaluation criterion
export async function POST(
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
    const { name, description, maxScore } = await request.json()

    if (!name || !maxScore) {
      return NextResponse.json({ error: 'اسم المعيار والدرجة القصوى مطلوبان' }, { status: 400 })
    }

    if (maxScore < 1 || maxScore > 100) {
      return NextResponse.json({ error: 'الدرجة القصوى يجب أن تكون بين 1 و 100' }, { status: 400 })
    }

    const criterion = await prisma.evaluationCriterion.create({
      data: {
        name,
        description: description || '',
        maxScore: parseInt(maxScore),
        hackathonId
      }
    })

    return NextResponse.json({ 
      message: 'تم إضافة المعيار بنجاح',
      criterion 
    })

  } catch (error) {
    console.error('Error adding evaluation criterion:', error)
    return NextResponse.json({ error: 'خطأ في إضافة المعيار' }, { status: 500 })
  }
}
