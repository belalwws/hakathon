import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Load existing form for hackathon
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId } = params

    console.log('📋 Loading form for hackathon:', hackathonId)

    // Check if hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Get existing form
    const form = await prisma.registrationForm.findUnique({
      where: { hackathonId }
    })

    console.log('✅ Form loaded:', form ? 'exists' : 'not found')

    return NextResponse.json({
      success: true,
      form: form || null
    })

  } catch (error) {
    console.error('❌ Error loading form:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحميل النموذج' },
      { status: 500 }
    )
  }
}

// POST - Save/Update form for hackathon
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId } = params
    const body = await request.json()
    const { formData, updatedBy } = body

    console.log('💾 Saving form for hackathon:', hackathonId)

    // Check if hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Validate form data
    if (!formData) {
      return NextResponse.json({ error: 'بيانات النموذج مطلوبة' }, { status: 400 })
    }

    // Save or update form
    const form = await prisma.registrationForm.upsert({
      where: { hackathonId },
      update: {
        formData,
        updatedBy: updatedBy || 'admin',
        updatedAt: new Date()
      },
      create: {
        hackathonId,
        formData,
        createdBy: updatedBy || 'admin',
        updatedBy: updatedBy || 'admin'
      }
    })

    console.log('✅ Form saved successfully:', form.id)

    return NextResponse.json({
      success: true,
      message: 'تم حفظ النموذج بنجاح',
      form
    })

  } catch (error) {
    console.error('❌ Error saving form:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في حفظ النموذج' },
      { status: 500 }
    )
  }
}

// DELETE - Delete form for hackathon
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId } = params

    console.log('🗑️ Deleting form for hackathon:', hackathonId)

    // Check if form exists
    const form = await prisma.registrationForm.findUnique({
      where: { hackathonId }
    })

    if (!form) {
      return NextResponse.json({ error: 'النموذج غير موجود' }, { status: 404 })
    }

    // Delete form
    await prisma.registrationForm.delete({
      where: { hackathonId }
    })

    console.log('✅ Form deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'تم حذف النموذج بنجاح'
    })

  } catch (error) {
    console.error('❌ Error deleting form:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في حذف النموذج' },
      { status: 500 }
    )
  }
}
