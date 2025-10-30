import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get expert form configuration (PUBLIC ACCESS)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const hackathonId = params.id

    // Check if form exists
    const form = await prisma.expertFormDesign.findUnique({
      where: { hackathonId }
    })

    if (!form) {
      // Return default form if not configured
      return NextResponse.json({
        form: {
          title: 'طلب الانضمام كخبير',
          description: 'املأ النموذج للتقديم كخبير في الهاكاثون',
          welcomeMessage: '',
          successMessage: 'تم إرسال طلبك بنجاح! سيتم مراجعته والرد عليك قريباً.',
          fields: [
            { id: 'name', type: 'text', label: 'الاسم الكامل', placeholder: 'أدخل اسمك الكامل', required: true },
            { id: 'email', type: 'email', label: 'البريد الإلكتروني', placeholder: 'example@email.com', required: true },
            { id: 'phone', type: 'phone', label: 'رقم الهاتف', placeholder: '05xxxxxxxx', required: false },
            { id: 'currentPosition', type: 'text', label: 'المنصب الحالي', placeholder: 'مثال: مدير تقنية المعلومات', required: false },
            { id: 'company', type: 'text', label: 'الشركة/المؤسسة', placeholder: 'أدخل اسم الشركة أو المؤسسة', required: false },
            { id: 'yearsOfExperience', type: 'number', label: 'سنوات الخبرة', placeholder: 'عدد سنوات الخبرة', required: false },
            { id: 'expertise', type: 'textarea', label: 'مجالات الخبرة', placeholder: 'اذكر مجالات خبرتك (تطوير، تصميم، أمن سيبراني، إلخ)', required: false },
            { id: 'bio', type: 'textarea', label: 'نبذة عن الخبير', placeholder: 'اكتب نبذة مختصرة عنك وخبراتك...', required: false },
            { id: 'linkedIn', type: 'text', label: 'رابط LinkedIn', placeholder: 'https://linkedin.com/in/...', required: false },
            { id: 'portfolio', type: 'text', label: 'الموقع الشخصي أو Portfolio', placeholder: 'https://...', required: false },
            { id: 'previousHackathons', type: 'select', label: 'هل شاركت في هاكاثونات من قبل؟', required: false, options: ['نعم', 'لا'] },
            { id: 'whyJoin', type: 'textarea', label: 'لماذا تريد الانضمام كخبير؟', placeholder: 'اكتب السبب...', required: false },
            { id: 'profileImage', type: 'file', label: 'صورة شخصية', required: false, description: 'الرجاء رفع صورة شخصية واضحة' },
            { id: 'cv', type: 'file', label: 'السيرة الذاتية (CV)', required: false, description: 'ملف PDF فقط' }
          ],
          primaryColor: '#0891b2',
          secondaryColor: '#3b82f6',
          accentColor: '#06b6d4',
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
          { id: 'currentPosition', type: 'text', label: 'المنصب الحالي', placeholder: 'مثال: مدير تقنية المعلومات', required: false },
          { id: 'company', type: 'text', label: 'الشركة/المؤسسة', placeholder: 'أدخل اسم الشركة أو المؤسسة', required: false },
          { id: 'yearsOfExperience', type: 'number', label: 'سنوات الخبرة', placeholder: 'عدد سنوات الخبرة', required: false },
          { id: 'expertise', type: 'textarea', label: 'مجالات الخبرة', placeholder: 'اذكر مجالات خبرتك', required: false },
          { id: 'bio', type: 'textarea', label: 'نبذة عن الخبير', placeholder: 'اكتب نبذة مختصرة عنك وخبراتك...', required: false },
          { id: 'linkedIn', type: 'text', label: 'رابط LinkedIn', placeholder: 'https://linkedin.com/in/...', required: false },
          { id: 'portfolio', type: 'text', label: 'الموقع الشخصي أو Portfolio', placeholder: 'https://...', required: false },
          { id: 'previousHackathons', type: 'select', label: 'هل شاركت في هاكاثونات من قبل؟', required: false, options: ['نعم', 'لا'] },
          { id: 'whyJoin', type: 'textarea', label: 'لماذا تريد الانضمام كخبير؟', placeholder: 'اكتب السبب...', required: false },
          { id: 'profileImage', type: 'file', label: 'صورة شخصية', required: false, description: 'الرجاء رفع صورة شخصية واضحة' },
          { id: 'cv', type: 'file', label: 'السيرة الذاتية (CV)', required: false, description: 'ملف PDF فقط' }
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
    console.error('Error fetching expert form:', error)
    return NextResponse.json(
      { error: 'فشل في جلب بيانات الفورم' },
      { status: 500 }
    )
  }
}
