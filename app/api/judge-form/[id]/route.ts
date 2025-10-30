import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get judge form configuration (PUBLIC ACCESS)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const hackathonId = params.id

    // Check if form exists
    const form = await prisma.judgeFormDesign.findUnique({
      where: { hackathonId }
    })

    if (!form) {
      // Return default form if not configured
      return NextResponse.json({
        form: {
          title: 'طلب الانضمام كمحكم',
          description: 'املأ النموذج للتقديم كمحكم في الهاكاثون',
          welcomeMessage: '',
          successMessage: 'تم إرسال طلبك بنجاح! سيتم مراجعته والرد عليك قريباً.',
          fields: [
            { id: 'name', type: 'text', label: 'الاسم الكامل', placeholder: 'أدخل اسمك الكامل', required: true },
            { id: 'email', type: 'email', label: 'البريد الإلكتروني', placeholder: 'example@email.com', required: true },
            { id: 'phone', type: 'phone', label: 'رقم الهاتف', placeholder: '05xxxxxxxx', required: false },
            { id: 'nationalId', type: 'text', label: 'رقم الهوية', placeholder: 'أدخل رقم الهوية', required: false },
            { id: 'workplace', type: 'text', label: 'جهة العمل', placeholder: 'أدخل جهة العمل', required: false },
            { id: 'education', type: 'text', label: 'المؤهل العلمي', placeholder: 'مثال: بكالوريوس علوم حاسب', required: false },
            { id: 'previousHackathons', type: 'select', label: 'هل شاركت في هاكاثونات افتراضية من قبل؟', required: false, options: ['نعم', 'لا'] },
            { id: 'bio', type: 'textarea', label: 'نبذة عن المحكم المشارك', placeholder: 'اكتب نبذة مختصرة عنك...', required: false },
            { id: 'profileImage', type: 'file', label: 'صورة شخصية', required: false, description: 'الرجاء رفع صورة شخصية واضحة' }
          ],
          primaryColor: '#01645e',
          secondaryColor: '#3ab666',
          accentColor: '#c3e956',
          backgroundColor: '#ffffff',
          coverImage: null,
          logoUrl: null,
          customCss: null
        }
      })
    }

    // Parse settings JSON
    const settings = form.settings ? JSON.parse(form.settings as string) : {}

    return NextResponse.json({
      form: {
        title: form.title,
        description: form.description,
        welcomeMessage: form.welcomeMessage,
        successMessage: form.successMessage,
        fields: settings.fields || [
          { id: 'name', type: 'text', label: 'الاسم الكامل', placeholder: 'أدخل اسمك الكامل', required: true },
          { id: 'email', type: 'email', label: 'البريد الإلكتروني', placeholder: 'example@email.com', required: true },
          { id: 'phone', type: 'phone', label: 'رقم الهاتف', placeholder: '05xxxxxxxx', required: false },
          { id: 'nationalId', type: 'text', label: 'رقم الهوية', placeholder: 'أدخل رقم الهوية', required: false },
          { id: 'workplace', type: 'text', label: 'جهة العمل', placeholder: 'أدخل جهة العمل', required: false },
          { id: 'education', type: 'text', label: 'المؤهل العلمي', placeholder: 'مثال: بكالوريوس علوم حاسب', required: false },
          { id: 'previousHackathons', type: 'select', label: 'هل شاركت في هاكاثونات افتراضية من قبل؟', required: false, options: ['نعم', 'لا'] },
          { id: 'bio', type: 'textarea', label: 'نبذة عن المحكم المشارك', placeholder: 'اكتب نبذة مختصرة عنك...', required: false },
          { id: 'profileImage', type: 'file', label: 'صورة شخصية', required: false, description: 'الرجاء رفع صورة شخصية واضحة' }
        ],
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        accentColor: form.accentColor,
        backgroundColor: form.backgroundColor,
        coverImage: form.coverImage,
        logoUrl: form.logoUrl,
        customCss: form.customCss
      }
    })
  } catch (error) {
    console.error('Error fetching judge form:', error)
    return NextResponse.json(
      { error: 'فشل في جلب بيانات الفورم' },
      { status: 500 }
    )
  }
}
