import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/forms/[id]/responses - Get form responses
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Fetching responses for form:', params.id)

    // Get token from cookie or header
    let token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      token = request.cookies.get("auth-token")?.value
    }

    if (!token) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - لا يوجد رمز مصادقة' },
        { status: 401 }
      )
    }

    // Verify token
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - صلاحيات غير كافية' },
        { status: 403 }
      )
    }

    // Check if form exists
    const form = await prisma.form.findUnique({
      where: { id: params.id }
    })

    if (!form) {
      return NextResponse.json(
        { error: 'النموذج غير موجود' },
        { status: 404 }
      )
    }

    // Fetch responses
    const responses = await prisma.formResponse.findMany({
      where: { formId: params.id },
      orderBy: { submittedAt: 'desc' }
    })

    console.log('✅ Responses fetched successfully:', responses.length)

    return NextResponse.json({
      responses,
      total: responses.length
    })

  } catch (error) {
    console.error('❌ Error fetching responses:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الردود' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
