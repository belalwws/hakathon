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

// PUT /api/admin/evaluation/criteria/[id] - Update evaluation criteria
export async function PUT(
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

    const prismaClient = await getPrisma()
    if (!prismaClient) {
      return NextResponse.json({ error: 'تعذر تهيئة قاعدة البيانات' }, { status: 500 })
    }

    const resolvedParams = await params
    const body = await request.json()
    const { name, description, weight, maxScore, category } = body

    if (!name || !weight || !maxScore) {
      return NextResponse.json({ 
        error: 'يرجى ملء جميع الحقول المطلوبة' 
      }, { status: 400 })
    }

    const criteria = await prismaClient.evaluationCriteria.update({
      where: { id: resolvedParams.id },
      data: {
        name,
        description: description || '',
        weight,
        maxScore,
        category: category || 'technical'
      }
    })

    return NextResponse.json({ 
      message: 'تم تحديث معيار التقييم بنجاح',
      criteria
    })

  } catch (error) {
    console.error('Error updating evaluation criteria:', error)
    return NextResponse.json({ error: 'خطأ في تحديث معيار التقييم' }, { status: 500 })
  }
}

// DELETE /api/admin/evaluation/criteria/[id] - Delete evaluation criteria
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const prismaClient = await getPrisma()
    if (!prismaClient) {
      return NextResponse.json({ error: 'تعذر تهيئة قاعدة البيانات' }, { status: 500 })
    }

    const resolvedParams = await params

    await prismaClient.evaluationCriteria.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ 
      message: 'تم حذف معيار التقييم بنجاح'
    })

  } catch (error) {
    console.error('Error deleting evaluation criteria:', error)
    return NextResponse.json({ error: 'خطأ في حذف معيار التقييم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
