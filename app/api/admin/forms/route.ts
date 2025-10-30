import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/forms - Get all forms
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching forms...')

    // Get token from cookie or header
    let token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      token = request.cookies.get("auth-token")?.value
    }

    if (!token) {
      console.log('❌ No token found')
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - لا يوجد رمز مصادقة' },
        { status: 401 }
      )
    }

    // Verify token
    const payload = await verifyToken(token)
    if (!payload) {
      console.log('❌ Invalid token')
      return NextResponse.json(
        { error: 'رمز المصادقة غير صالح' },
        { status: 401 }
      )
    }

    if (payload.role !== 'admin') {
      console.log('❌ User is not admin:', payload.role)
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - صلاحيات غير كافية' },
        { status: 403 }
      )
    }

    console.log('✅ User verified for forms fetch:', payload.email)

    let forms = []
    try {
      forms = await prisma.form.findMany({
        include: {
          _count: {
            select: {
              responses: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } catch (dbError: any) {
      console.log('⚠️ Forms table might not exist yet:', dbError.message)
      if (dbError.message.includes('does not exist') || dbError.message.includes('relation') || dbError.message.includes('table')) {
        return NextResponse.json({
          forms: [],
          total: 0,
          message: 'Forms tables not yet created. Please run migration.'
        })
      }
      throw dbError
    }

    console.log('✅ Forms fetched successfully:', forms.length)

    return NextResponse.json({
      forms,
      total: forms.length
    })

  } catch (error) {
    console.error('❌ Error fetching forms:', error)
    return NextResponse.json(
      { error: 'فشل في جلب النماذج' },
      { status: 500 }
    )
  }
}

// POST /api/admin/forms - Create new form
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Creating new form...')

    // Get token from cookie or header
    let token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      token = request.cookies.get("auth-token")?.value
    }

    if (!token) {
      console.log('❌ No token found')
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - لا يوجد رمز مصادقة' },
        { status: 401 }
      )
    }

    // Verify token
    const payload = await verifyToken(token)
    if (!payload) {
      console.log('❌ Invalid token')
      return NextResponse.json(
        { error: 'رمز المصادقة غير صالح' },
        { status: 401 }
      )
    }

    if (payload.role !== 'admin') {
      console.log('❌ User is not admin:', payload.role)
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - صلاحيات غير كافية' },
        { status: 403 }
      )
    }

    console.log('✅ User verified:', payload.email, 'role:', payload.role)

    const body = await request.json()
    const { title, description, fields, status, isPublic } = body

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

    console.log('📝 Creating form with data:', { title, fieldsCount: fields.length, status })

    // Create form with error handling for missing tables
    let form
    try {
      form = await prisma.form.create({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          fields: fields,
          status: status || 'draft',
          isPublic: isPublic !== false,
          createdBy: payload.userId
        },
        include: {
          _count: {
            select: {
              responses: true
            }
          }
        }
      })
    } catch (dbError: any) {
      console.log('⚠️ Forms table might not exist yet:', dbError.message)
      if (dbError.message.includes('does not exist') || dbError.message.includes('relation') || dbError.message.includes('table')) {
        return NextResponse.json({
          error: 'Forms tables not yet created. Please run migration first.',
          details: 'Run: npm run add-forms'
        }, { status: 503 })
      }
      throw dbError
    }

    console.log('✅ Form created successfully:', form.id)

    return NextResponse.json({
      form,
      message: 'تم إنشاء النموذج بنجاح'
    })

  } catch (error) {
    console.error('❌ Error creating form:', error)

    // More specific error messages
    if (error instanceof Error) {
      console.error('Error details:', error.message)

      if (error.message.includes('Prisma')) {
        return NextResponse.json(
          { error: 'خطأ في قاعدة البيانات', details: error.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'فشل في إنشاء النموذج', details: error instanceof Error ? error.message : 'خطأ غير معروف' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
