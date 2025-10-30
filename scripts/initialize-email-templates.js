/**
 * Script to initialize default email templates in the database
 * Run with: node scripts/initialize-email-templates.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Starting email templates initialization...\n')

  const DEFAULT_TEMPLATES = [
    {
      templateKey: 'registration_confirmation',
      nameAr: 'تأكيد التسجيل',
      nameEn: 'Registration Confirmation',
      category: 'participant',
      subject: 'تأكيد التسجيل في الهاكاثون - {{hackathonTitle}}',
      description: 'يُرسل تلقائياً عند تسجيل مشارك جديد في هاكاثون',
      bodyHtml: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl; background: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <div style="font-size: 60px; margin-bottom: 10px;">✅</div>
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">تم تأكيد تسجيلك!</h1>
    <p style="color: #dbeafe; margin: 10px 0 0 0; font-size: 16px;">نشكرك على انضمامك إلينا</p>
  </div>
  <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px;">
    <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">مرحباً <strong>{{participantName}}</strong> 👋</p>
    <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">تم تأكيد تسجيلك بنجاح في هاكاثون <strong style="color: #2563eb;">{{hackathonTitle}}</strong></p>
    <div style="background: #f0f9ff; border-right: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">📋 تفاصيل التسجيل:</h3>
      <p style="color: #1e40af; margin: 5px 0;">📧 البريد الإلكتروني: {{participantEmail}}</p>
      <p style="color: #1e40af; margin: 5px 0;">📅 تاريخ التسجيل: {{registrationDate}}</p>
    </div>
    <p style="font-size: 14px; color: #6b7280; margin: 30px 0 0 0;">مع أطيب التحيات،<br/><strong>فريق إدارة الهاكاثونات</strong></p>
  </div>
</div>`,
      variables: { 
        participantName: 'اسم المشارك', 
        participantEmail: 'البريد الإلكتروني', 
        hackathonTitle: 'عنوان الهاكاثون', 
        registrationDate: 'تاريخ التسجيل' 
      },
      isSystem: true,
      isActive: true
    },
    {
      templateKey: 'acceptance',
      nameAr: 'قبول المشاركة',
      nameEn: 'Application Acceptance',
      category: 'participant',
      subject: 'مبروك! تم قبولك في {{hackathonTitle}}',
      description: 'يُرسل تلقائياً عند قبول طلب مشارك',
      bodyHtml: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl; background: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <div style="font-size: 60px; margin-bottom: 10px;">🎉</div>
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">مبروك!</h1>
    <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">تم قبول طلبك بنجاح</p>
  </div>
  <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px;">
    <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">عزيزي <strong>{{participantName}}</strong>،</p>
    <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">يسعدنا إبلاغك بأنه تم قبول طلبك للمشاركة في هاكاثون <strong style="color: #059669;">{{hackathonTitle}}</strong></p>
    <p style="font-size: 14px; color: #6b7280; margin: 30px 0 0 0;">نتمنى لك تجربة رائعة ومثمرة! 🚀</p>
  </div>
</div>`,
      variables: { 
        participantName: 'اسم المشارك', 
        hackathonTitle: 'عنوان الهاكاثون'
      },
      isSystem: true,
      isActive: true
    },
    {
      templateKey: 'rejection',
      nameAr: 'رفض المشاركة',
      nameEn: 'Application Rejection',
      category: 'participant',
      subject: 'شكراً لاهتمامك بـ {{hackathonTitle}}',
      description: 'يُرسل تلقائياً عند رفض طلب مشارك',
      bodyHtml: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl; background: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <div style="font-size: 50px; margin-bottom: 10px;">💙</div>
    <h1 style="color: white; margin: 0; font-size: 26px; font-weight: bold;">شكراً لاهتمامك</h1>
  </div>
  <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px;">
    <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">عزيزي <strong>{{participantName}}</strong>،</p>
    <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">نشكرك على اهتمامك بالمشاركة في هاكاثون <strong style="color: #4f46e5;">{{hackathonTitle}}</strong></p>
    <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">للأسف، لم نتمكن من قبول طلبك هذه المرة نظراً لمحدودية الأماكن المتاحة.</p>
    <p style="font-size: 14px; color: #6b7280; margin: 30px 0 0 0;">نتمنى لك كل التوفيق في مسيرتك! 🌟</p>
  </div>
</div>`,
      variables: { 
        participantName: 'اسم المشارك', 
        hackathonTitle: 'عنوان الهاكاثون'
      },
      isSystem: true,
      isActive: true
    },
    {
      templateKey: 'team_formation',
      nameAr: 'تشكيل الفريق',
      nameEn: 'Team Formation',
      category: 'team',
      subject: 'تم تشكيل فريقك - {{hackathonTitle}}',
      description: 'يُرسل عند إنشاء الفريق وتوزيع الأعضاء',
      bodyHtml: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;"><h2>مرحباً {{participantName}}</h2><p>تم تشكيل فريقك بنجاح!</p><div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;"><h3>تفاصيل الفريق:</h3><p><strong>اسم الفريق:</strong> {{teamName}}</p></div></div>',
      variables: { 
        participantName: 'اسم المشارك', 
        hackathonTitle: 'عنوان الهاكاثون', 
        teamName: 'اسم الفريق'
      },
      isSystem: true,
      isActive: true
    },
    {
      templateKey: 'welcome',
      nameAr: 'ترحيب في الهاكاثون',
      nameEn: 'Welcome to Hackathon',
      category: 'participant',
      subject: 'أهلاً بك في {{hackathonTitle}}',
      description: 'رسالة ترحيب عامة',
      bodyHtml: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;"><h2>مرحباً {{participantName}}</h2><p>أهلاً بك في {{hackathonTitle}}!</p></div>',
      variables: { 
        participantName: 'اسم المشارك', 
        hackathonTitle: 'عنوان الهاكاثون'
      },
      isSystem: true,
      isActive: true
    },
    {
      templateKey: 'reminder',
      nameAr: 'تذكير عام',
      nameEn: 'General Reminder',
      category: 'general',
      subject: 'تذكير: {{hackathonTitle}}',
      description: 'تذكير عام للمشاركين',
      bodyHtml: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;"><h2>تذكير</h2><p>{{reminderMessage}}</p></div>',
      variables: { 
        hackathonTitle: 'عنوان الهاكاثون', 
        reminderMessage: 'رسالة التذكير'
      },
      isSystem: true,
      isActive: true
    },
    {
      templateKey: 'evaluation_results',
      nameAr: 'نتائج التقييم',
      nameEn: 'Evaluation Results',
      category: 'team',
      subject: 'نتائج التقييم - {{hackathonTitle}}',
      description: 'يُرسل مع نتائج التقييم للفرق',
      bodyHtml: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;"><h2>مرحباً فريق {{teamName}}</h2><p>تم الانتهاء من التقييم!</p><p><strong>النتيجة:</strong> {{totalScore}}</p></div>',
      variables: { 
        teamName: 'اسم الفريق', 
        hackathonTitle: 'عنوان الهاكاثون', 
        totalScore: 'النتيجة الإجمالية'
      },
      isSystem: true,
      isActive: true
    },
    {
      templateKey: 'certificate_ready',
      nameAr: 'الشهادة جاهزة',
      nameEn: 'Certificate Ready',
      category: 'certificate',
      subject: 'شهادتك جاهزة - {{hackathonTitle}}',
      description: 'يُرسل عند جاهزية شهادة المشارك',
      bodyHtml: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;"><h2>مرحباً {{participantName}}</h2><p>شهادتك جاهزة! يمكنك تحميلها من الرابط التالي:</p><p><a href="{{certificateUrl}}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">تحميل الشهادة</a></p></div>',
      variables: { 
        participantName: 'اسم المشارك', 
        hackathonTitle: 'عنوان الهاكاثون', 
        certificateUrl: 'رابط الشهادة'
      },
      isSystem: true,
      isActive: true
    }
  ]

  let created = 0
  let existing = 0
  let errors = 0

  for (const template of DEFAULT_TEMPLATES) {
    try {
      const existingTemplate = await prisma.emailTemplate.findUnique({
        where: { templateKey: template.templateKey }
      })

      if (!existingTemplate) {
        await prisma.emailTemplate.create({
          data: template
        })
        console.log(`✅ Created: ${template.nameAr} (${template.templateKey})`)
        created++
      } else {
        console.log(`ℹ️  Already exists: ${template.nameAr} (${template.templateKey})`)
        existing++
      }
    } catch (error) {
      console.error(`❌ Error creating ${template.templateKey}:`, error.message)
      errors++
    }
  }

  console.log('\n📊 Summary:')
  console.log(`   ✅ Created: ${created}`)
  console.log(`   ℹ️  Already existed: ${existing}`)
  console.log(`   ❌ Errors: ${errors}`)
  console.log(`   📝 Total templates: ${DEFAULT_TEMPLATES.length}`)
  console.log('\n✨ Email templates initialization complete!\n')
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

