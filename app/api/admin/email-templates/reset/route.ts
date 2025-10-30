import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// إعادة تعيين قالب واحد للوضع الافتراضي
export async function POST(request: NextRequest) {
  try {
    // التحقق من الصلاحيات
    const userRole = request.headers.get('x-user-role')
    if (!userRole || !['admin', 'supervisor'].includes(userRole)) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - صلاحيات غير كافية' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { templateKey } = body

    if (!templateKey) {
      return NextResponse.json(
        { error: 'templateKey مطلوب' },
        { status: 400 }
      )
    }

    // القوالب الافتراضية
    const defaultTemplates: Record<string, any> = {
      registration_confirmation: {
        templateKey: 'registration_confirmation',
        nameAr: 'تأكيد التسجيل',
        nameEn: 'Registration Confirmation',
        subject: 'تأكيد التسجيل في {{hackathonTitle}}',
        category: 'participant',
        isSystem: true,
        isActive: true,
        description: 'يُرسل تلقائياً عند تسجيل مشارك جديد',
        variables: {
          participantName: 'اسم المشارك',
          participantEmail: 'البريد الإلكتروني للمشارك',
          hackathonTitle: 'عنوان الهاكاثون',
          registrationDate: 'تاريخ التسجيل'
        },
        bodyHtml: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">✅ تم تأكيد تسجيلك!</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">مرحباً <strong>{{participantName}}</strong>،</p>
              <p style="color: #4b5563; line-height: 1.8; margin-bottom: 20px;">
                نشكرك على تسجيلك في <strong style="color: #667eea;">{{hackathonTitle}}</strong>!
              </p>
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-right: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin-top: 0;">📋 تفاصيل التسجيل:</h3>
                <p style="margin: 10px 0; color: #1e3a8a;"><strong>البريد الإلكتروني:</strong> {{participantEmail}}</p>
                <p style="margin: 10px 0; color: #1e3a8a;"><strong>تاريخ التسجيل:</strong> {{registrationDate}}</p>
              </div>
              <p style="color: #4b5563; line-height: 1.8; margin: 20px 0;">
                سيتم مراجعة طلبك وإبلاغك بالقرار قريباً.
              </p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
                <p>مع أطيب التحيات،<br><strong style="color: #667eea;">فريق المنصة</strong></p>
              </div>
            </div>
          </div>
        `
      },
      acceptance: {
        templateKey: 'acceptance',
        nameAr: 'قبول المشاركة',
        nameEn: 'Acceptance',
        subject: '🎉 مبروك! تم قبولك في {{hackathonTitle}}',
        category: 'participant',
        isSystem: true,
        isActive: true,
        description: 'يُرسل تلقائياً عند قبول طلب مشارك',
        variables: {
          participantName: 'اسم المشارك',
          hackathonTitle: 'عنوان الهاكاثون',
          feedback: 'ملاحظات إضافية'
        },
        bodyHtml: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 مبروك!</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">عزيزي <strong>{{participantName}}</strong>،</p>
              <p style="color: #4b5563; line-height: 1.8; margin-bottom: 20px;">
                يسعدنا إبلاغك بأنه تم <strong style="color: #10b981;">قبول طلبك</strong> للمشاركة في <strong style="color: #667eea;">{{hackathonTitle}}</strong>!
              </p>
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-right: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #065f46; margin-top: 0;">📝 ملاحظات:</h3>
                <p style="color: #064e3b; line-height: 1.6;">{{feedback}}</p>
              </div>
              <p style="color: #4b5563; line-height: 1.8; margin: 20px 0;">
                نتطلع لرؤيتك ومشاركتك معنا!
              </p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
                <p>مع أطيب التحيات،<br><strong style="color: #10b981;">فريق المنصة</strong></p>
              </div>
            </div>
          </div>
        `
      },
      rejection: {
        templateKey: 'rejection',
        nameAr: 'رفض المشاركة',
        nameEn: 'Rejection',
        subject: 'بخصوص طلب المشاركة في {{hackathonTitle}}',
        category: 'participant',
        isSystem: true,
        isActive: true,
        description: 'يُرسل تلقائياً عند رفض طلب مشارك',
        variables: {
          participantName: 'اسم المشارك',
          hackathonTitle: 'عنوان الهاكاثون',
          feedback: 'ملاحظات إضافية'
        },
        bodyHtml: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">شكراً لاهتمامك</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">عزيزي <strong>{{participantName}}</strong>،</p>
              <p style="color: #4b5563; line-height: 1.8; margin-bottom: 20px;">
                نشكرك على اهتمامك بالمشاركة في <strong style="color: #667eea;">{{hackathonTitle}}</strong>.
              </p>
              <p style="color: #4b5563; line-height: 1.8; margin-bottom: 20px;">
                للأسف، لم يتم قبول طلبك في هذه المرة بسبب العدد المحدود من المقاعد المتاحة والمنافسة القوية.
              </p>
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-right: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #92400e; margin-top: 0;">💡 لا تيأس!</h3>
                <p style="color: #78350f; line-height: 1.6;">{{feedback}}</p>
                <p style="color: #78350f; line-height: 1.6; margin-top: 10px;">
                  نشجعك على المحاولة مرة أخرى في الفعاليات القادمة.
                </p>
              </div>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
                <p>نتمنى لك التوفيق،<br><strong style="color: #6366f1;">فريق المنصة</strong></p>
              </div>
            </div>
          </div>
        `
      },
      team_formation: {
        templateKey: 'team_formation',
        nameAr: 'تكوين الفريق',
        nameEn: 'Team Formation',
        subject: '🏆 تم تشكيل فريقك في {{hackathonTitle}}',
        category: 'team',
        isSystem: true,
        isActive: true,
        description: 'يُرسل عند تشكيل الفرق',
        variables: {
          participantName: 'اسم المشارك',
          hackathonTitle: 'عنوان الهاكاثون',
          teamName: 'اسم الفريق',
          teamNumber: 'رقم الفريق'
        },
        bodyHtml: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🏆 فريقك جاهز!</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">مرحباً <strong>{{participantName}}</strong>،</p>
              <p style="color: #4b5563; line-height: 1.8; margin-bottom: 20px;">
                تم تشكيل فريقك في <strong style="color: #667eea;">{{hackathonTitle}}</strong>!
              </p>
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-right: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #92400e; margin-top: 0;">📋 تفاصيل الفريق:</h3>
                <p style="margin: 10px 0; color: #78350f;"><strong>اسم الفريق:</strong> {{teamName}}</p>
                <p style="margin: 10px 0; color: #78350f;"><strong>رقم الفريق:</strong> {{teamNumber}}</p>
              </div>
              <p style="color: #4b5563; line-height: 1.8; margin: 20px 0;">
                نتمنى لك ولفريقك التوفيق والنجاح!
              </p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
                <p>مع أطيب التحيات،<br><strong style="color: #f59e0b;">فريق المنصة</strong></p>
              </div>
            </div>
          </div>
        `
      },
      welcome: {
        templateKey: 'welcome',
        nameAr: 'ترحيب',
        nameEn: 'Welcome',
        subject: 'مرحباً بك في {{hackathonTitle}}',
        category: 'participant',
        isSystem: false,
        isActive: true,
        description: 'رسالة ترحيب عامة',
        variables: {
          participantName: 'اسم المشارك',
          hackathonTitle: 'عنوان الهاكاثون'
        },
        bodyHtml: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">مرحباً بك!</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">عزيزي <strong>{{participantName}}</strong>،</p>
              <p style="color: #4b5563; line-height: 1.8; margin-bottom: 20px;">
                نرحب بك في <strong style="color: #667eea;">{{hackathonTitle}}</strong>!
              </p>
              <p style="color: #4b5563; line-height: 1.8; margin: 20px 0;">
                نتمنى لك تجربة رائعة ومثمرة.
              </p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
                <p>مع أطيب التحيات،<br><strong style="color: #667eea;">فريق المنصة</strong></p>
              </div>
            </div>
          </div>
        `
      },
      reminder: {
        templateKey: 'reminder',
        nameAr: 'تذكير عام',
        nameEn: 'General Reminder',
        subject: 'تذكير: {{hackathonTitle}}',
        category: 'general',
        isSystem: false,
        isActive: true,
        description: 'تذكير عام للمشاركين',
        variables: {
          hackathonTitle: 'عنوان الهاكاثون',
          reminderMessage: 'رسالة التذكير'
        },
        bodyHtml: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔔 تذكير</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="color: #4b5563; line-height: 1.8; margin-bottom: 20px;">
                {{reminderMessage}}
              </p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
                <p>مع أطيب التحيات،<br><strong style="color: #3b82f6;">فريق المنصة</strong></p>
              </div>
            </div>
          </div>
        `
      },
      evaluation_results: {
        templateKey: 'evaluation_results',
        nameAr: 'نتائج التقييم',
        nameEn: 'Evaluation Results',
        subject: 'نتائج التقييم - {{hackathonTitle}}',
        category: 'team',
        isSystem: true,
        isActive: true,
        description: 'يُرسل مع نتائج التقييم',
        variables: {
          teamName: 'اسم الفريق',
          hackathonTitle: 'عنوان الهاكاثون',
          totalScore: 'النتيجة الإجمالية'
        },
        bodyHtml: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">📊 نتائج التقييم</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">فريق <strong>{{teamName}}</strong>،</p>
              <p style="color: #4b5563; line-height: 1.8; margin-bottom: 20px;">
                تم الانتهاء من تقييم مشروعكم في <strong style="color: #667eea;">{{hackathonTitle}}</strong>.
              </p>
              <div style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-right: 4px solid #8b5cf6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <h3 style="color: #6b21a8; margin-top: 0;">النتيجة الإجمالية</h3>
                <p style="font-size: 36px; font-weight: bold; color: #7c3aed; margin: 10px 0;">{{totalScore}}</p>
              </div>
              <p style="color: #4b5563; line-height: 1.8; margin: 20px 0;">
                نشكركم على مشاركتكم ونتمنى لكم التوفيق!
              </p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
                <p>مع أطيب التحيات،<br><strong style="color: #8b5cf6;">فريق المنصة</strong></p>
              </div>
            </div>
          </div>
        `
      },
      certificate_ready: {
        templateKey: 'certificate_ready',
        nameAr: 'الشهادة جاهزة',
        nameEn: 'Certificate Ready',
        subject: '📜 شهادتك جاهزة - {{hackathonTitle}}',
        category: 'certificate',
        isSystem: true,
        isActive: true,
        description: 'يُرسل عند جاهزية الشهادة',
        variables: {
          participantName: 'اسم المشارك',
          hackathonTitle: 'عنوان الهاكاثون',
          certificateUrl: 'رابط الشهادة'
        },
        bodyHtml: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">📜 شهادتك جاهزة!</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">عزيزي <strong>{{participantName}}</strong>،</p>
              <p style="color: #4b5563; line-height: 1.8; margin-bottom: 20px;">
                شهادة مشاركتك في <strong style="color: #667eea;">{{hackathonTitle}}</strong> جاهزة الآن!
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{certificateUrl}}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  تحميل الشهادة
                </a>
              </div>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
                <p>مع أطيب التحيات،<br><strong style="color: #ec4899;">فريق المنصة</strong></p>
              </div>
            </div>
          </div>
        `
      }
    }

    // التحقق من وجود القالب الافتراضي
    const defaultTemplate = defaultTemplates[templateKey]
    if (!defaultTemplate) {
      return NextResponse.json(
        { error: 'القالب المطلوب غير موجود في القوالب الافتراضية' },
        { status: 404 }
      )
    }

    // حذف القالب القديم وإنشاء واحد جديد بالقيم الافتراضية
    await prisma.emailTemplate.deleteMany({
      where: { templateKey }
    })

    const template = await prisma.emailTemplate.create({
      data: defaultTemplate
    })

    return NextResponse.json({
      success: true,
      message: 'تم إعادة تعيين القالب بنجاح',
      template
    })

  } catch (error) {
    console.error('Error resetting template:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إعادة تعيين القالب' },
      { status: 500 }
    )
  }
}

