import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Default custom fields structure
const DEFAULT_FIELDS = [
  {
    id: 'name',
    type: 'text',
    label: 'الاسم الكامل',
    placeholder: 'أدخل اسمك الكامل',
    required: true,
    enabled: true,
    order: 1,
    isDefault: true
  },
  {
    id: 'email',
    type: 'email',
    label: 'البريد الإلكتروني',
    placeholder: 'أدخل بريدك الإلكتروني',
    required: true,
    enabled: true,
    order: 2,
    isDefault: true
  },
  {
    id: 'phone',
    type: 'tel',
    label: 'رقم الهاتف',
    placeholder: 'أدخل رقم هاتفك',
    required: true,
    enabled: true,
    order: 3,
    isDefault: true
  },
  {
    id: 'city',
    type: 'text',
    label: 'المدينة',
    placeholder: 'أدخل مدينتك',
    required: true,
    enabled: true,
    order: 4,
    isDefault: true
  },
  {
    id: 'nationality',
    type: 'text',
    label: 'الجنسية',
    placeholder: 'أدخل جنسيتك',
    required: true,
    enabled: true,
    order: 5,
    isDefault: true
  },
  {
    id: 'preferredRole',
    type: 'select',
    label: 'التخصص المفضل',
    placeholder: 'اختر تخصصك',
    required: true,
    enabled: true,
    order: 6,
    options: [
      'مطور واجهات أمامية',
      'مطور واجهات خلفية',
      'مطور تطبيقات جوال',
      'مصمم UI/UX',
      'مصمم جرافيك',
      'مطور ألعاب',
      'محلل بيانات',
      'مختص أمن سيبراني',
      'مدير مشروع',
      'أخرى'
    ],
    isDefault: true
  }
]

// GET /api/admin/hackathons/[id]/custom-fields - Get custom fields for hackathon
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params

    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { 
        id: true,
        title: true,
        customFields: true 
      }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Use custom fields if available, otherwise use defaults
    const fields = hackathon.customFields ? 
      (hackathon.customFields as any).fields || DEFAULT_FIELDS : 
      DEFAULT_FIELDS

    return NextResponse.json({
      hackathonId: hackathon.id,
      hackathonTitle: hackathon.title,
      fields: fields.sort((a: any, b: any) => a.order - b.order),
      defaultFields: DEFAULT_FIELDS
    })

  } catch (error) {
    console.error('Error fetching custom fields:', error)
    return NextResponse.json({ error: 'خطأ في جلب الحقول المخصصة' }, { status: 500 })
  }
}

// PUT /api/admin/hackathons/[id]/custom-fields - Update custom fields for hackathon
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params

    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { fields } = await request.json()

    if (!fields || !Array.isArray(fields)) {
      return NextResponse.json({ error: 'الحقول المخصصة مطلوبة' }, { status: 400 })
    }

    // Validate hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { id: true, title: true }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Validate fields structure
    for (const field of fields) {
      if (!field.id || !field.type || !field.label) {
        return NextResponse.json({ 
          error: 'كل حقل يجب أن يحتوي على id و type و label' 
        }, { status: 400 })
      }

      const validTypes = ['text', 'email', 'tel', 'number', 'select', 'textarea', 'checkbox', 'radio', 'date']
      if (!validTypes.includes(field.type)) {
        return NextResponse.json({ 
          error: `نوع الحقل غير صحيح: ${field.type}` 
        }, { status: 400 })
      }

      if ((field.type === 'select' || field.type === 'radio') && (!field.options || !Array.isArray(field.options))) {
        return NextResponse.json({ 
          error: `حقل ${field.label} من نوع ${field.type} يحتاج إلى خيارات` 
        }, { status: 400 })
      }
    }

    // Prepare custom fields object
    const customFields = {
      fields: fields.map((field: any, index: number) => ({
        ...field,
        order: field.order || index + 1
      })),
      updatedAt: new Date().toISOString(),
      updatedBy: payload.userId
    }

    // Update hackathon with new custom fields
    const updatedHackathon = await prisma.hackathon.update({
      where: { id: hackathonId },
      data: { customFields },
      select: { 
        id: true,
        title: true,
        customFields: true 
      }
    })

    console.log('✅ Custom fields updated for hackathon:', hackathonId)

    return NextResponse.json({
      message: 'تم تحديث الحقول المخصصة بنجاح',
      hackathonId: updatedHackathon.id,
      hackathonTitle: updatedHackathon.title,
      fields: (updatedHackathon.customFields as any)?.fields || []
    })

  } catch (error) {
    console.error('Error updating custom fields:', error)
    return NextResponse.json({ error: 'خطأ في تحديث الحقول المخصصة' }, { status: 500 })
  }
}

// POST /api/admin/hackathons/[id]/custom-fields/reset - Reset to default fields
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params

    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Validate hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { id: true, title: true }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Reset to default fields
    const customFields = {
      fields: DEFAULT_FIELDS,
      updatedAt: new Date().toISOString(),
      updatedBy: payload.userId,
      resetToDefault: true
    }

    // Update hackathon with default custom fields
    const updatedHackathon = await prisma.hackathon.update({
      where: { id: hackathonId },
      data: { customFields },
      select: { 
        id: true,
        title: true,
        customFields: true 
      }
    })

    console.log('✅ Custom fields reset to default for hackathon:', hackathonId)

    return NextResponse.json({
      message: 'تم إعادة تعيين الحقول للافتراضية بنجاح',
      hackathonId: updatedHackathon.id,
      hackathonTitle: updatedHackathon.title,
      fields: (updatedHackathon.customFields as any)?.fields || DEFAULT_FIELDS
    })

  } catch (error) {
    console.error('Error resetting custom fields:', error)
    return NextResponse.json({ error: 'خطأ في إعادة تعيين الحقول المخصصة' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
