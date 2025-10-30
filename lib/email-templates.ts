import { prisma } from './prisma'

// Default global email templates
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

يسعدنا إبلاغك بأنه تم قبولك للمشاركة في هاكاثون {{hackathonTitle}}.

تفاصيل المشاركة:
- اسم المشارك: {{participantName}}
- الدور المفضل: {{teamRole}}
- تاريخ بداية الهاكاثون: {{hackathonDate}}
- الموقع: {{hackathonLocation}}

سنقوم بإرسال تفاصيل الفريق قريباً.

مبروك مرة أخرى!

مع أطيب التحيات,
فريق الهاكاثون`
  },
  rejection: {
    subject: 'شكراً لاهتمامك بـ {{hackathonTitle}}',
    body: `مرحباً {{participantName}},

شكراً لك على اهتمامك بالمشاركة في هاكاثون {{hackathonTitle}}.

للأسف، لم نتمكن من قبول طلبك هذه المرة نظراً لمحدودية الأماكن المتاحة.

نشجعك على المشاركة في الفعاليات القادمة.

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
  team_details: {
    subject: '📋 تفاصيل فريقك - {{hackathonTitle}}',
    body: `مرحباً {{participantName}},

نود إعلامك بتفاصيل فريقك في {{hackathonTitle}}

اسم الفريق: {{teamName}}

👥 أعضاء الفريق:

{{teamMembers}}

💡 نصيحة: تواصل مع أعضاء فريقك لتنسيق العمل على المشروع!

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

{{#if deadlineDate}}
الموعد النهائي: {{deadlineDate}}
{{/if}}

مع أطيب التحيات,
فريق الهاكاثون`
  },
  welcome: {
    subject: '🎉 مرحباً بك في منصة الهاكاثونات - حسابك جاهز!',
    body: `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مرحباً بك</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); direction: rtl;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <div style="background: white; width: 80px; height: 80px; margin: 0 auto 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                                <span style="font-size: 40px;">🚀</span>
                            </div>
                            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">مرحباً بك في منصتنا!</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">حسابك جاهز للاستخدام الآن</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #667eea; margin: 0 0 20px; font-size: 22px;">مرحباً {{participantName}} 👋</h2>
                            
                            <p style="color: #4a5568; line-height: 1.8; margin: 0 0 25px; font-size: 16px;">
                                يسعدنا انضمامك إلى منصة الهاكاثونات! تم إنشاء حسابك بنجاح ويمكنك الآن الاستفادة من جميع المزايا المتاحة.
                            </p>
                            
                            <!-- Account Details Card -->
                            <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px; border-right: 4px solid #667eea;">
                                <h3 style="color: #2d3748; margin: 0 0 15px; font-size: 18px; display: flex; align-items: center;">
                                    <span style="margin-left: 8px;">📋</span> تفاصيل حسابك
                                </h3>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px 0; color: #718096; font-size: 14px;">الاسم:</td>
                                        <td style="padding: 8px 0; color: #2d3748; font-weight: 600; font-size: 14px; text-align: left;">{{participantName}}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #718096; font-size: 14px;">البريد الإلكتروني:</td>
                                        <td style="padding: 8px 0; color: #2d3748; font-weight: 600; font-size: 14px; text-align: left;">{{participantEmail}}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #718096; font-size: 14px;">تاريخ التسجيل:</td>
                                        <td style="padding: 8px 0; color: #2d3748; font-weight: 600; font-size: 14px; text-align: left;">{{registrationDate}}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #718096; font-size: 14px;">نوع الحساب:</td>
                                        <td style="padding: 8px 0; text-align: left;">
                                            <span style="background: #48bb78; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">نشط</span>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- What's Next -->
                            <div style="background: #f7fafc; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                                <h3 style="color: #2d3748; margin: 0 0 15px; font-size: 18px;">
                                    <span style="margin-left: 8px;">✨</span> ما التالي؟
                                </h3>
                                <ul style="margin: 0; padding: 0 0 0 20px; color: #4a5568; line-height: 2;">
                                    <li>تصفح الهاكاثونات المتاحة وسجل في الذي يناسبك</li>
                                    <li>أكمل معلومات ملفك الشخصي</li>
                                    <li>انضم إلى فريق أو كوّن فريقك الخاص</li>
                                    <li>شارك في التحديات وابدأ رحلتك</li>
                                </ul>
                            </div>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; margin-bottom: 30px;">
                                <tr>
                                    <td align="center">
                                        <a href="{{loginUrl}}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 30px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s;">
                                            🎯 ابدأ الآن
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Help Section -->
                            <div style="background: #fff5f5; border-right: 4px solid #f56565; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                                <p style="color: #742a2a; margin: 0; font-size: 14px; line-height: 1.6;">
                                    <strong>💡 نصيحة:</strong> احفظ هذا البريد الإلكتروني للرجوع إليه لاحقاً. إذا واجهت أي مشكلة، لا تتردد في التواصل معنا.
                                </p>
                            </div>
                            
                            <p style="color: #718096; font-size: 14px; margin: 0; text-align: center;">
                                هل لديك أسئلة؟ نحن هنا للمساعدة! تواصل معنا في أي وقت.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #4a5568; margin: 0 0 15px; font-size: 16px; font-weight: 600;">مع أطيب التحيات،</p>
                            <p style="color: #667eea; margin: 0 0 20px; font-size: 18px; font-weight: bold;">فريق منصة الهاكاثونات 🚀</p>
                            
                            <div style="margin: 20px 0; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                                <p style="color: #a0aec0; font-size: 12px; margin: 0 0 10px;">
                                    هذا البريد تم إرساله تلقائياً، يرجى عدم الرد عليه.
                                </p>
                                <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                                    © 2025 منصة الهاكاثونات. جميع الحقوق محفوظة.
                                </p>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
  },
  custom: {
    subject: '{{subject}}',
    body: `{{content}}`
  },
  certificate_ready: {
    subject: 'شهادتك جاهزة للتحميل - {{hackathonTitle}}',
    body: `مرحباً {{participantName}},

يسعدنا إبلاغك بأن شهادة المشاركة في {{hackathonTitle}} جاهزة للتحميل.

تفاصيل الشهادة:
- اسم المشارك: {{participantName}}
- اسم الفريق: {{teamName}}
- المركز: {{teamRank}}

يمكنك تحميل الشهادة من الرابط التالي:
{{certificateUrl}}

مبروك على إنجازك!

مع أطيب التحيات,
فريق الهاكاثون`
  },
  upload_link: {
    subject: '🎉 رابط رفع العرض التقديمي - {{hackathonTitle}}',
    body: `مرحباً {{participantName}},

يسعدنا إبلاغك بأنه تم قبولك في {{hackathonTitle}}! 🎊

تم تعيينك في فريق: {{teamName}}

يمكنك الآن رفع العرض التقديمي الخاص بفريقك من خلال الرابط التالي:
{{uploadLink}}

⚠️ ملاحظات هامة:
- هذا الرابط صالح حتى {{expiryDate}}
- الرابط خاص بك ولا يجب مشاركته مع الآخرين
- يمكنك رفع العرض التقديمي مرة واحدة فقط
- الملفات المقبولة: PowerPoint (.ppt, .pptx) أو PDF
- الحد الأقصى لحجم الملف: 10 ميجابايت

نتمنى لك التوفيق! 🚀

مع أطيب التحيات,
فريق الهاكاثون`
  }
}

export interface EmailTemplate {
  subject: string
  body: string
}

export interface EmailTemplates {
  registration_confirmation: EmailTemplate
  acceptance: EmailTemplate
  rejection: EmailTemplate
  team_formation: EmailTemplate
  team_details: EmailTemplate
  evaluation_results: EmailTemplate
  reminder: EmailTemplate
  welcome: EmailTemplate
  certificate_ready: EmailTemplate
  upload_link: EmailTemplate
}

/**
 * Get email templates with priority:
 * 1. Database EmailTemplate table (by templateKey) - ACTIVE OR INACTIVE
 * 2. Default hardcoded templates
 */
export async function getEmailTemplates(hackathonId?: string): Promise<EmailTemplates> {
  try {
    let templates = { ...DEFAULT_TEMPLATES }

    // Get templates from EmailTemplate table - GET ALL TEMPLATES (not just active ones)
    try {
      const dbTemplates = await prisma.emailTemplate.findMany({
        // ✅ REMOVED isActive filter - get ALL templates even if inactive
        orderBy: { updatedAt: 'desc' }
      })
      
      if (dbTemplates && dbTemplates.length > 0) {
        console.log(`✅ Loaded ${dbTemplates.length} email templates from database`)
        
        // Map database templates to our template structure
        dbTemplates.forEach(dbTemplate => {
          const templateKey = dbTemplate.templateKey as keyof EmailTemplates
          if (DEFAULT_TEMPLATES[templateKey]) {
            templates[templateKey] = {
              subject: dbTemplate.subject,
              body: dbTemplate.bodyHtml || dbTemplate.bodyText || DEFAULT_TEMPLATES[templateKey].body
            }
            console.log(`  ✓ Template loaded: ${templateKey} - "${dbTemplate.nameAr}" (active: ${dbTemplate.isActive})`)
          }
        })
      } else {
        console.log('⚠️ No templates in database, using defaults')
      }
    } catch (error: any) {
      console.log('⚠️ Error loading templates from database:', error?.message || 'Unknown error')
      console.log('📋 Falling back to default templates')
    }

    return templates
  } catch (error) {
    console.error('Error getting email templates:', error)
    return DEFAULT_TEMPLATES
  }
}

/**
 * Get a specific email template
 */
export async function getEmailTemplate(
  templateType: keyof EmailTemplates,
  hackathonId?: string
): Promise<EmailTemplate> {
  const templates = await getEmailTemplates(hackathonId)
  return templates[templateType] || DEFAULT_TEMPLATES[templateType]
}

/**
 * Replace template variables with actual values
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, any>
): string {
  let result = template

  // Replace simple variables like {{variableName}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, String(value || ''))
  })

  // Handle conditional blocks like {{#if condition}}...{{/if}}
  result = result.replace(/{{#if\s+(\w+)}}(.*?){{\/if}}/g, (match, condition, content) => {
    return variables[condition] ? content : ''
  })

  return result
}

/**
 * Process email template with variables and attachments
 */
export async function processEmailTemplate(
  templateType: keyof EmailTemplates,
  variables: Record<string, any>,
  hackathonId?: string
): Promise<{ subject: string; body: string; attachments?: any[] }> {
  console.log(`📧 [email-templates] Processing template: ${templateType}`)
  console.log(`📧 [email-templates] Variables:`, Object.keys(variables))

  const template = await getEmailTemplate(templateType, hackathonId)

  console.log(`📧 [email-templates] Template loaded:`)
  console.log(`📧 [email-templates] Subject: ${template.subject}`)
  console.log(`📧 [email-templates] Body preview: ${template.body.substring(0, 150)}...`)

  // ✅ Get attachments from database if template is from DB
  let attachments: any[] = []
  try {
    const dbTemplate = await prisma.emailTemplate.findFirst({
      where: { templateKey: templateType as string }
    })

    console.log(`📎 [email-templates] DB Template found:`, !!dbTemplate)
    console.log(`📎 [email-templates] Attachments field:`, (dbTemplate as any)?.attachments)

    if (dbTemplate && (dbTemplate as any).attachments) {
      const attachmentsField = (dbTemplate as any).attachments

      // Check if it's a valid JSON string
      if (typeof attachmentsField === 'string' && attachmentsField.trim().length > 0) {
        try {
          attachments = JSON.parse(attachmentsField)
          console.log(`📎 [email-templates] Found ${attachments.length} attachments in template`)
          console.log(`📎 [email-templates] Attachments:`, JSON.stringify(attachments, null, 2))
        } catch (parseError) {
          console.error(`❌ [email-templates] Failed to parse attachments JSON:`, parseError)
        }
      } else {
        console.log(`⚠️ [email-templates] Attachments field is empty or not a string`)
      }
    } else {
      console.log(`⚠️ [email-templates] No attachments field in template`)
    }
  } catch (error) {
    console.error(`❌ [email-templates] Error fetching attachments for template ${templateType}:`, error)
  }

  const result = {
    subject: replaceTemplateVariables(template.subject, variables),
    body: replaceTemplateVariables(template.body, variables),
    attachments: attachments.length > 0 ? attachments : undefined
  }

  console.log(`📧 [email-templates] After variable replacement:`)
  console.log(`📧 [email-templates] Subject: ${result.subject}`)
  console.log(`📧 [email-templates] Body preview: ${result.body.substring(0, 150)}...`)
  console.log(`📎 [email-templates] Attachments: ${result.attachments?.length || 0}`)

  return result
}
