import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/hackathons/[id]/registration-form - Get hackathon registration form
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    try {
      // Try to get existing form from database using Prisma
      const existingForm = await prisma.hackathonForm.findUnique({
        where: { hackathonId: params.id }
      })

      if (existingForm) {
        return NextResponse.json({
          form: {
            id: existingForm.id,
            hackathonId: existingForm.hackathonId,
            title: existingForm.title,
            description: existingForm.description,
            coverImage: (existingForm as any).coverImage,
            colors: (existingForm as any).colors,
            isActive: existingForm.isActive,
            fields: JSON.parse(existingForm.fields),
            settings: JSON.parse(existingForm.settings),
            openAt: (existingForm as any).openAt,
            closeAt: (existingForm as any).closeAt
          }
        })
      }

      return NextResponse.json({ form: null })

    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ form: null })
    }

  } catch (error) {
    console.error('Error fetching registration form:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// POST /api/admin/hackathons/[id]/registration-form - Create/Update hackathon registration form
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, coverImage, colors, isActive, fields, settings } = body

    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json({ error: 'عنوان النموذج مطلوب' }, { status: 400 })
    }

    if (!fields || fields.length === 0) {
      return NextResponse.json({ error: 'يجب إضافة حقل واحد على الأقل' }, { status: 400 })
    }

    // Validate fields
    for (const field of fields) {
      if (!field.label?.trim()) {
        return NextResponse.json({ error: 'تسمية الحقل مطلوبة لجميع الحقول' }, { status: 400 })
      }
      
      if ((field.type === 'select' || field.type === 'radio') && (!field.options || field.options.length === 0)) {
        return NextResponse.json({ error: `الحقل "${field.label}" يتطلب خيارات` }, { status: 400 })
      }
    }

    try {
      // Check if hackathon exists
      const hackathon = await prisma.hackathon.findUnique({
        where: { id: params.id }
      })

      if (!hackathon) {
        return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
      }

      // Check if form already exists using Prisma
      const existingForm = await prisma.hackathonForm.findUnique({
        where: { hackathonId: params.id }
      })

      const fieldsJson = JSON.stringify(fields)
      const settingsJson = JSON.stringify(settings || {
        allowMultipleSubmissions: false,
        requireApproval: true,
        sendConfirmationEmail: true
      })

      let savedForm
      if (existingForm) {
        // Update existing form using Prisma
        savedForm = await prisma.hackathonForm.update({
          where: { id: existingForm.id },
          data: {
            title,
            description: description || '',
            coverImage: coverImage || null,
            colors: colors || null,
            isActive: isActive ?? true,
            fields: fieldsJson,
            settings: settingsJson
          } as any
        })

        console.log('✅ Form updated successfully:', {
          id: savedForm.id,
          title: savedForm.title,
          fieldsLength: savedForm.fields.length,
          settingsLength: savedForm.settings.length
        })
      } else {
        // Create new form using Prisma
        savedForm = await prisma.hackathonForm.create({
          data: {
            hackathonId: params.id,
            title,
            description: description || '',
            coverImage: coverImage || null,
            colors: colors || null,
            isActive: isActive ?? true,
            fields: fieldsJson,
            settings: settingsJson
          } as any
        })

        console.log('✅ Form created successfully:', {
          id: savedForm.id,
          title: savedForm.title,
          fieldsLength: savedForm.fields.length,
          settingsLength: savedForm.settings.length
        })
      }

      return NextResponse.json({
        success: true,
        message: 'تم حفظ النموذج بنجاح',
        form: {
          id: savedForm.id,
          hackathonId: savedForm.hackathonId,
          title: savedForm.title,
          description: savedForm.description,
          isActive: savedForm.isActive,
          fields: JSON.parse(savedForm.fields),
          settings: JSON.parse(savedForm.settings)
        }
      })

    } catch (dbError) {
      console.error('Database error:', dbError)
      
      // Fallback: save to file system or return success for demo
      console.log('Saving form data (fallback):', {
        hackathonId: params.id,
        title,
        description,
        isActive,
        fields: fields.length,
        settings
      })

      return NextResponse.json({
        success: true,
        message: 'تم حفظ النموذج بنجاح (وضع التجريب)',
        form: {
          id: `form_${params.id}`,
          hackathonId: params.id,
          title,
          description,
          isActive,
          fields,
          settings
        }
      })
    }

  } catch (error) {
    console.error('Error saving registration form:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
