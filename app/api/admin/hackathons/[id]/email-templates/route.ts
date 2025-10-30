import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Default email templates
const DEFAULT_TEMPLATES = {
  registration_confirmation: {
    subject: 'تأكيد التسجيل في الهاكاثون - {{hackathonTitle}}',
    body: `مرحباً {{participantName}},

تم تأكيد تسجيلك بنجاح في هاكاثون {{hackathonTitle}}.

تفاصيل التسجيل:
- اسم المشارك: {{participantName}}
- البريد الإلكتروني: {{participantEmail}}
- تاريخ التسجيل: {{registrationDate}}

سنقوم بإرسال المزيد من التفاصيل قريباً.

مع أطيب التحيات,
فريق الهاكاثون`
  },
  acceptance: {
    subject: 'مبروك! تم قبولك في {{hackathonTitle}}',
    body: `مرحباً {{participantName}},

نحن سعداء لإبلاغك بأنه تم قبولك في هاكاثون {{hackathonTitle}}.

تفاصيل الهاكاثون:
- التاريخ: {{hackathonDate}}
- المكان: {{hackathonLocation}}
- الوقت: {{hackathonTime}}

يرجى الاستعداد والحضور في الوقت المحدد.

مع أطيب التحيات,
فريق الهاكاثون`
  },
  rejection: {
    subject: 'إشعار بخصوص طلب المشاركة في {{hackathonTitle}}',
    body: `مرحباً {{participantName}},

نشكرك على اهتمامك بالمشاركة في هاكاثون {{hackathonTitle}}.

للأسف، لم نتمكن من قبول طلبك هذه المرة بسبب العدد المحدود من المقاعد المتاحة.

نتطلع لمشاركتك في الفعاليات القادمة.

مع أطيب التحيات,
فريق الهاكاثون`
  },
  team_formation: {
    subject: 'تم تكوين فريقك في {{hackathonTitle}}',
    body: `مرحباً {{participantName}},

تم تكوين فريقك بنجاح في هاكاثون {{hackathonTitle}}.

تفاصيل الفريق:
- اسم الفريق: {{teamName}}
- رقم الفريق: {{teamNumber}}
- دورك في الفريق: {{teamRole}}

أعضاء الفريق:
{{teamMembers}}

مع أطيب التحيات,
فريق الهاكاثون`
  },
  evaluation_results: {
    subject: 'نتائج التقييم - {{hackathonTitle}}',
    body: `مرحباً {{participantName}},

تم الانتهاء من تقييم المشاريع في هاكاثون {{hackathonTitle}}.

نتائج فريقك:
- اسم الفريق: {{teamName}}
- المركز: {{teamRank}}
- النتيجة الإجمالية: {{totalScore}}

{{#if isWinner}}
مبروك! فريقك من الفائزين!
{{/if}}

شكراً لمشاركتكم المميزة.

مع أطيب التحيات,
فريق الهاكاثون`
  },
  reminder: {
    subject: 'تذكير: {{hackathonTitle}} - {{reminderType}}',
    body: `مرحباً {{participantName}},

هذا تذكير بخصوص {{hackathonTitle}}.

{{reminderMessage}}

التاريخ: {{hackathonDate}}
الوقت: {{hackathonTime}}
المكان: {{hackathonLocation}}

مع أطيب التحيات,
فريق الهاكاثون`
  }
}

// GET /api/admin/hackathons/[id]/email-templates - Get email templates for hackathon
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
        emailTemplates: true 
      }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Merge default templates with custom ones
    const currentTemplates = hackathon.emailTemplates || {}
    const templates = { ...DEFAULT_TEMPLATES, ...currentTemplates }

    return NextResponse.json({
      hackathonId: hackathon.id,
      hackathonTitle: hackathon.title,
      templates,
      defaultTemplates: DEFAULT_TEMPLATES
    })

  } catch (error) {
    console.error('Error fetching email templates:', error)
    return NextResponse.json({ error: 'خطأ في جلب قوالب الإيميلات' }, { status: 500 })
  }
}

// PUT /api/admin/hackathons/[id]/email-templates - Update email templates for hackathon
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

    const { templates } = await request.json()

    if (!templates || typeof templates !== 'object') {
      return NextResponse.json({ error: 'قوالب الإيميلات مطلوبة' }, { status: 400 })
    }

    // Validate hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { id: true, title: true }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Validate template structure
    const validTemplateTypes = Object.keys(DEFAULT_TEMPLATES)
    for (const [templateType, template] of Object.entries(templates)) {
      if (!validTemplateTypes.includes(templateType)) {
        return NextResponse.json({ 
          error: `نوع القالب غير صحيح: ${templateType}` 
        }, { status: 400 })
      }

      if (!template || typeof template !== 'object') {
        return NextResponse.json({ 
          error: `قالب غير صحيح: ${templateType}` 
        }, { status: 400 })
      }

      const { subject, body } = template as any
      if (!subject || !body || typeof subject !== 'string' || typeof body !== 'string') {
        return NextResponse.json({ 
          error: `عنوان ونص القالب مطلوبان: ${templateType}` 
        }, { status: 400 })
      }
    }

    // Prepare email templates object
    const emailTemplates = {
      ...templates,
      updatedAt: new Date().toISOString(),
      updatedBy: payload.userId
    }

    // Update hackathon with new email templates
    const updatedHackathon = await prisma.hackathon.update({
      where: { id: hackathonId },
      data: { emailTemplates },
      select: { 
        id: true,
        title: true,
        emailTemplates: true 
      }
    })

    console.log('✅ Email templates updated for hackathon:', hackathonId)

    return NextResponse.json({
      message: 'تم تحديث قوالب الإيميلات بنجاح',
      hackathonId: updatedHackathon.id,
      hackathonTitle: updatedHackathon.title,
      templates: updatedHackathon.emailTemplates
    })

  } catch (error) {
    console.error('Error updating email templates:', error)
    return NextResponse.json({ error: 'خطأ في تحديث قوالب الإيميلات' }, { status: 500 })
  }
}

// POST /api/admin/hackathons/[id]/email-templates/reset - Reset to default templates
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

    // Reset to default templates
    const emailTemplates = {
      ...DEFAULT_TEMPLATES,
      updatedAt: new Date().toISOString(),
      updatedBy: payload.userId,
      resetToDefault: true
    }

    // Update hackathon with default email templates
    const updatedHackathon = await prisma.hackathon.update({
      where: { id: hackathonId },
      data: { emailTemplates },
      select: { 
        id: true,
        title: true,
        emailTemplates: true 
      }
    })

    console.log('✅ Email templates reset to default for hackathon:', hackathonId)

    return NextResponse.json({
      message: 'تم إعادة تعيين قوالب الإيميلات للافتراضية بنجاح',
      hackathonId: updatedHackathon.id,
      hackathonTitle: updatedHackathon.title,
      templates: updatedHackathon.emailTemplates
    })

  } catch (error) {
    console.error('Error resetting email templates:', error)
    return NextResponse.json({ error: 'خطأ في إعادة تعيين قوالب الإيميلات' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
