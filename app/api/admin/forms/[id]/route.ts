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

// GET /api/admin/forms/[id] - Get specific form
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Fetching form:', params.id)

    const prismaClient = await getPrisma()
    if (!prismaClient) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    const form = await prismaClient.form.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            responses: true
          }
        }
      }
    })

    if (!form) {
      return NextResponse.json(
        { error: 'النموذج غير موجود' },
        { status: 404 }
      )
    }

    console.log('✅ Form fetched successfully:', form.title)

    return NextResponse.json({ form })

  } catch (error) {
    console.error('❌ Error fetching form:', error)
    return NextResponse.json(
      { error: 'فشل في جلب النموذج' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/forms/[id] - Update form
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Updating form:', params.id)

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

    const body = await request.json()
    const { title, description, fields, status, isPublic } = body

    const prismaClient = await getPrisma()
    if (!prismaClient) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    // Check if form exists
    const existingForm = await prismaClient.form.findUnique({
      where: { id: params.id }
    })

    if (!existingForm) {
      return NextResponse.json(
        { error: 'النموذج غير موجود' },
        { status: 404 }
      )
    }

    // Validate required fields
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'عنوان النموذج مطلوب' },
        { status: 400 }
      )
    }

    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json(
        { error: 'يجب إضافة حقل واحد على الأقل' },
        { status: 400 }
      )
    }

    // Validate fields
    for (const field of fields) {
      if (!field.label || !field.label.trim()) {
        return NextResponse.json(
          { error: 'جميع الحقول يجب أن تحتوي على تسمية' },
          { status: 400 }
        )
      }

      if (['select', 'radio', 'checkbox'].includes(field.type)) {
        if (!field.options || !Array.isArray(field.options) || field.options.length === 0) {
          return NextResponse.json(
            { error: `الحقل "${field.label}" يحتاج إلى خيارات` },
            { status: 400 }
          )
        }
      }
    }

    console.log('📝 Updating form with data:', { title, fieldsCount: fields.length, status })

    const form = await prismaClient.form.update({
      where: { id: params.id },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        fields: fields,
        status: status || existingForm.status,
        isPublic: isPublic !== undefined ? isPublic : existingForm.isPublic
      },
      include: {
        _count: {
          select: {
            responses: true
          }
        }
      }
    })

    console.log('✅ Form updated successfully:', form.id)

    return NextResponse.json({
      form,
      message: 'تم تحديث النموذج بنجاح'
    })

  } catch (error) {
    console.error('❌ Error updating form:', error)
    return NextResponse.json(
      { error: 'فشل في تحديث النموذج' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/forms/[id] - Delete form
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Deleting form:', params.id)

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

    const prismaClient = await getPrisma()
    if (!prismaClient) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    // Check if form exists
    const existingForm = await prismaClient.form.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            responses: true
          }
        }
      }
    })

    if (!existingForm) {
      return NextResponse.json(
        { error: 'النموذج غير موجود' },
        { status: 404 }
      )
    }

    console.log('🗑️ Deleting form and responses:', {
      formId: params.id,
      responsesCount: existingForm._count.responses
    })

    // Delete form (responses will be deleted automatically due to cascade)
    await prismaClient.form.delete({
      where: { id: params.id }
    })

    console.log('✅ Form deleted successfully')

    return NextResponse.json({
      message: 'تم حذف النموذج بنجاح'
    })

  } catch (error) {
    console.error('❌ Error deleting form:', error)
    return NextResponse.json(
      { error: 'فشل في حذف النموذج' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
