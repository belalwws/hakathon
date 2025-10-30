// قالب إيميل الرابط السحري لرفع العرض التقديمي

interface UploadLinkEmailData {
  participantName: string
  hackathonTitle: string
  teamName: string
  uploadLink: string
  expiryDate: string
}

export function generateUploadLinkEmail(data: UploadLinkEmailData): { subject: string; html: string } {
  const subject = `🎉 مبروك! تم قبولك في ${data.hackathonTitle}`

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>رابط رفع العرض التقديمي</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                🎉 مبروك!
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 18px; opacity: 0.95;">
                تم قبولك في الهاكاثون
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 18px; line-height: 1.6;">
                مرحباً <strong>${data.participantName}</strong>،
              </p>

              <p style="margin: 0 0 20px 0; color: #555555; font-size: 16px; line-height: 1.8;">
                يسعدنا إبلاغك بأنه تم قبولك في <strong>${data.hackathonTitle}</strong>! 🎊
              </p>

              <!-- Team Info Box -->
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-right: 4px solid #01645e; padding: 20px; margin: 25px 0; border-radius: 8px;">
                <p style="margin: 0 0 10px 0; color: #01645e; font-size: 14px; font-weight: bold; text-transform: uppercase;">
                  معلومات الفريق
                </p>
                <p style="margin: 0; color: #333333; font-size: 18px; font-weight: bold;">
                  👥 ${data.teamName}
                </p>
              </div>

              <!-- Instructions -->
              <div style="background-color: #fff8e1; border-right: 4px solid #ffa726; padding: 20px; margin: 25px 0; border-radius: 8px;">
                <p style="margin: 0 0 10px 0; color: #f57c00; font-size: 16px; font-weight: bold;">
                  📋 الخطوة التالية
                </p>
                <p style="margin: 0; color: #555555; font-size: 15px; line-height: 1.6;">
                  يرجى رفع العرض التقديمي الخاص بفريقك من خلال الرابط أدناه:
                </p>
              </div>

              <!-- Upload Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${data.uploadLink}" 
                   style="display: inline-block; background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 50px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(1, 100, 94, 0.3); transition: all 0.3s ease;">
                  📤 رفع العرض التقديمي
                </a>
              </div>

              <!-- Link Info -->
              <div style="background-color: #f5f5f5; padding: 20px; margin: 25px 0; border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                  أو انسخ الرابط التالي والصقه في المتصفح:
                </p>
                <p style="margin: 0; color: #01645e; font-size: 13px; word-break: break-all; direction: ltr; text-align: center;">
                  ${data.uploadLink}
                </p>
              </div>

              <!-- Important Notes -->
              <div style="background-color: #ffebee; border-right: 4px solid #e53935; padding: 20px; margin: 25px 0; border-radius: 8px;">
                <p style="margin: 0 0 15px 0; color: #c62828; font-size: 16px; font-weight: bold;">
                  ⚠️ ملاحظات هامة
                </p>
                <ul style="margin: 0; padding: 0 20px; color: #555555; font-size: 14px; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">هذا الرابط صالح حتى <strong>${data.expiryDate}</strong></li>
                  <li style="margin-bottom: 8px;">الرابط خاص بك ولا يجب مشاركته مع الآخرين</li>
                  <li style="margin-bottom: 8px;">يمكنك رفع العرض التقديمي مرة واحدة فقط</li>
                  <li style="margin-bottom: 8px;">الملفات المقبولة: PowerPoint (.ppt, .pptx) أو PDF</li>
                  <li>الحد الأقصى لحجم الملف: 10 ميجابايت</li>
                </ul>
              </div>

              <!-- Support -->
              <div style="margin-top: 30px; padding-top: 25px; border-top: 2px solid #eeeeee;">
                <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; text-align: center;">
                  في حال واجهت أي مشكلة، لا تتردد في التواصل معنا
                </p>
                <p style="margin: 0; color: #01645e; font-size: 14px; text-align: center; font-weight: bold;">
                  نتمنى لك التوفيق! 🚀
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 25px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 8px 0; color: #999999; font-size: 13px;">
                هذا الإيميل تم إرساله تلقائياً من منصة الهاكاثون
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} جميع الحقوق محفوظة
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  return { subject, html }
}

