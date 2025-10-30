# دليل إعداد إرسال الإيميلات - Email Setup Guide

## نظرة عامة
المنصة تدعم إرسال إيميلات تلقائية للمستخدمين عند التسجيل والإشعارات المختلفة. يمكنك استخدام Gmail أو أي SMTP server آخر.

## ✅ الإيميلات التلقائية المتاحة

### 1. **إيميل الترحيب** (Welcome Email)
- يُرسل تلقائياً عند تسجيل مستخدم جديد
- يحتوي على:
  - اسم المستخدم
  - اسم المؤسسة
  - تاريخ التسجيل
  - معلومات الاتصال

### 2. **إيميلات الهاكاثونات** (Hackathon Emails)
- قبول/رفض المشاركة
- تحديثات الهاكاثون
- إشعارات النتائج

### 3. **إيميلات التقييم** (Evaluation Emails)
- إخطار الحكام بالمهام
- تحديثات التقييم

---

## 📧 إعداد Gmail (الطريقة الموصى بها للتطوير)

### الخطوة 1: إنشاء App Password

1. **اذهب إلى إعدادات حساب Google:**
   - افتح [https://myaccount.google.com/](https://myaccount.google.com/)
   - اذهب إلى **Security** (الأمان)

2. **تفعيل 2-Step Verification:**
   - ابحث عن **2-Step Verification**
   - فعّلها إذا لم تكن مفعلة (مطلوب لإنشاء App Passwords)

3. **إنشاء App Password:**
   - بعد تفعيل 2-Step Verification
   - ابحث عن **App passwords** في صفحة Security
   - اختر **Mail** كـ App
   - اختر **Other** كـ Device وسمّها "HackPro SaaS"
   - انقر **Generate**
   - **احفظ الكود المكون من 16 حرف** (سيظهر مرة واحدة فقط!)

### الخطوة 2: إضافة إعدادات Gmail للمشروع

1. **أنشئ ملف `.env.local` في جذر المشروع:**
   ```bash
   # في المجلد الرئيسي للمشروع
   copy .env.example .env.local
   ```

2. **أضف إعدادات Gmail:**
   ```env
   # Email Configuration - Gmail
   GMAIL_USER="your-email@gmail.com"
   GMAIL_PASS="xxxx xxxx xxxx xxxx"  # App Password الذي أنشأته
   MAIL_FROM="HackPro SaaS <noreply@hackpro.com>"
   ```

3. **مثال واقعي:**
   ```env
   GMAIL_USER="admin@hackpro.com"
   GMAIL_PASS="abcd efgh ijkl mnop"
   MAIL_FROM="HackPro SaaS <noreply@hackpro.com>"
   ```

### الخطوة 3: إعادة تشغيل السيرفر
```bash
# أوقف السيرفر (Ctrl+C)
# شغّل السيرفر من جديد
npm run dev
```

---

## 🔧 إعداد SMTP Server مخصص (للإنتاج)

إذا كنت تريد استخدام SMTP server آخر (SendGrid، Mailgun، AWS SES، إلخ):

### 1. SendGrid
```env
# في .env.local
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
MAIL_FROM="HackPro SaaS <noreply@hackpro.com>"
```

### 2. AWS SES
```env
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_USER="your-aws-smtp-username"
SMTP_PASS="your-aws-smtp-password"
MAIL_FROM="HackPro SaaS <verified-email@yourdomain.com>"
```

### 3. Mailgun
```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_USER="postmaster@your-domain.mailgun.org"
SMTP_PASS="your-mailgun-password"
MAIL_FROM="HackPro SaaS <noreply@yourdomain.com>"
```

---

## 🧪 اختبار إرسال الإيميلات

### 1. تسجيل مستخدم جديد
```bash
# افتح صفحة التسجيل
http://localhost:3001/register

# سجّل مستخدم جديد
# سيتم إرسال إيميل ترحيبي تلقائياً
```

### 2. فحص Console Logs
عند نجاح الإرسال، ستشاهد:
```
📧 [mailer] Attempting to send email to: user@example.com
✅ [mailer] Email sent successfully: <message-id>
✅ Welcome email sent successfully to: user@example.com
```

عند فشل الإرسال (SMTP غير مُعد):
```
❌ [mailer] No transporter available! SMTP not configured properly.
⚠️ Registration successful but email failed to send
```

### 3. سكريبت اختبار يدوي
أنشئ ملف `scripts/test-email.js`:
```javascript
const { sendMail } = require('../lib/mailer')

async function testEmail() {
  try {
    const result = await sendMail({
      to: 'test@example.com',
      subject: 'Test Email من HackPro SaaS',
      html: '<h1>مرحباً!</h1><p>هذا إيميل تجريبي للتأكد من إعدادات SMTP.</p>',
      text: 'مرحباً! هذا إيميل تجريبي.'
    })
    
    console.log('✅ Email sent successfully!')
    console.log('Message ID:', result.messageId)
    console.log('Actually mailed:', result.actuallyMailed)
  } catch (error) {
    console.error('❌ Failed to send email:', error)
  }
}

testEmail()
```

شغّله:
```bash
node scripts/test-email.js
```

---

## 📋 قوالب الإيميلات المتاحة

القوالب موجودة في: `lib/email-templates.ts`

### 1. Welcome Email
```typescript
{
  participantName: "أحمد محمد",
  participantEmail: "ahmad@example.com",
  organizationName: "وزارة الاتصالات",
  registrationDate: "2025/10/30",
  organizerName: "فريق HackPro",
  organizerEmail: "support@hackpro.com"
}
```

### 2. Team Assignment
```typescript
{
  participantName: "فاطمة علي",
  hackathonTitle: "هاكاثون الابتكار",
  teamNumber: "5",
  teamName: "فريق النجاح",
  teamMembers: "أحمد، محمد، سارة",
  organizerName: "منظم الهاكاثون",
  organizerEmail: "organizer@example.com"
}
```

### 3. Approval/Rejection
```typescript
{
  participantName: "سارة خالد",
  hackathonTitle: "هاكاثون AI",
  status: "approved" // or "rejected",
  message: "مبروك! تم قبولك...",
  organizerName: "فريق التنظيم",
  organizerEmail: "team@hackathon.com"
}
```

---

## 🚨 حل المشاكل الشائعة

### المشكلة 1: "No transporter available"
**السبب:** إعدادات SMTP غير موجودة أو خاطئة

**الحل:**
1. تأكد من وجود ملف `.env.local`
2. تأكد من صحة `GMAIL_USER` و `GMAIL_PASS`
3. أعد تشغيل السيرفر

### المشكلة 2: "Invalid login: 535 Authentication failed"
**السبب:** App Password خاطئ أو 2-Step Verification غير مفعّل

**الحل:**
1. تأكد من تفعيل 2-Step Verification
2. أنشئ App Password جديد
3. تأكد من نسخ الـ 16 حرف بدون مسافات (أو مع مسافات كما ظهرت)

### المشكلة 3: "Email sent but not received"
**السبب:** قد يكون الإيميل في Spam أو الإرسال بطيء

**الحل:**
1. تحقق من مجلد Spam/Junk
2. انتظر بضع دقائق
3. تحقق من Gmail Sent folder

### المشكلة 4: Rate limiting (421 error)
**السبب:** إرسال إيميلات كثيرة بسرعة

**الحل:**
- الكود يحتوي على retry logic تلقائي
- Rate limiting: 1 ثانية بين كل إيميل
- Batch sending: 5 إيميلات كل 3 ثواني

---

## 📊 مراقبة الإيميلات

### في Development
```javascript
// في terminal ستشاهد:
📧 [mailer] Attempting to send email to: user@example.com
🔧 [mailer] Getting transporter...
✅ [mailer] Transporter ready, sending real email...
📧 [mailer] From: HackPro SaaS <noreply@hackpro.com>
📧 [mailer] To: user@example.com
📧 [mailer] Subject: مرحباً بك في HackPro SaaS
✅ [mailer] Email sent successfully: <1234567890.abc@smtp.gmail.com>
```

### في Production
- استخدم logging service (Sentry، LogRocket)
- راقب email bounce rate
- تابع delivery reports من SMTP provider

---

## 🔐 أمان الإيميلات

### ✅ Best Practices
1. **لا تشارك App Password أبداً**
2. **لا تضع `.env.local` في Git**
   ```bash
   # تأكد من وجود هذا في .gitignore
   .env.local
   .env*.local
   ```
3. **استخدم SMTP providers موثوقين للإنتاج**
4. **فعّل SPF و DKIM و DMARC للدومين** (إذا كنت تستخدم custom domain)

### 🔒 تشفير الاتصال
الكود يستخدم:
- **TLS/SSL** للاتصالات الآمنة
- **Port 587** (STARTTLS) أو **465** (SSL)
- **Authentication** مطلوبة

---

## 📞 الدعم

إذا واجهت مشاكل:
1. تحقق من Console logs
2. راجع هذا الدليل
3. تحقق من إعدادات Gmail/SMTP
4. اختبر باستخدام سكريبت `test-email.js`

---

## 🎯 الخلاصة

### للتطوير (Development)
```env
GMAIL_USER="your-email@gmail.com"
GMAIL_PASS="app-password-16-chars"
MAIL_FROM="HackPro <noreply@hackpro.com>"
```

### للإنتاج (Production)
```env
# استخدم SMTP service محترف
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-api-key"
MAIL_FROM="HackPro <noreply@yourdomain.com>"
```

**🎉 بعد إعداد الإيميلات، كل مستخدم جديد سيحصل على إيميل ترحيبي تلقائياً!**
