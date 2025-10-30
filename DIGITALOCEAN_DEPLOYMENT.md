# 🚀 دليل النشر على DigitalOcean
## HackPro SaaS - DigitalOcean Deployment Guide

---

## 📋 المتطلبات

- حساب على GitHub (المشروع مرفوع هنا)
- حساب على DigitalOcean
- حساب على Neon (قاعدة البيانات)
- حساب على Cloudinary (رفع الملفات)
- حساب Gmail (للإيميلات) أو SendGrid

---

## 🔧 الخطوة 1: إعداد قاعدة البيانات (Neon)

### 1.1 إنشاء مشروع على Neon

1. اذهب إلى https://neon.tech/
2. سجل دخول أو أنشئ حساب جديد
3. أنشئ مشروع جديد:
   - اختر PostgreSQL
   - اختر region قريب منك
   - أنشئ قاعدة بيانات `hackpro`

### 1.2 نسخ Connection String

```
postgresql://user:password@ep-xxx.neon.tech/hackpro?sslmode=require
```

احفظ هذا الـ URL - سيكون مهم جداً!

---

## 🔐 الخطوة 2: إعداد Secrets والمتغيرات البيئية

### المتغيرات المطلوبة:

| المتغير | الوصف | مثال |
|---------|-------|--------|
| `DATABASE_URL` | قاعدة البيانات من Neon | `postgresql://...` |
| `JWT_SECRET` | مفتاح سري عشوائي | استخدم `openssl rand -base64 32` |
| `NEXTAUTH_SECRET` | مفتاح NextAuth | استخدم `openssl rand -base64 32` |
| `NEXTAUTH_URL` | رابط التطبيق | `https://your-app.ondigitalocean.app` |
| `NEXT_PUBLIC_BASE_URL` | رابط عام | نفس الـ URL أعلاه |
| `NEXT_PUBLIC_APP_URL` | رابط التطبيق | نفس الـ URL أعلاه |
| `CLOUDINARY_CLOUD_NAME` | Cloud name من Cloudinary | `your-cloud` |
| `CLOUDINARY_API_KEY` | API key من Cloudinary | `123456789` |
| `CLOUDINARY_API_SECRET` | API secret من Cloudinary | `secret-key` |
| `GMAIL_USER` | بريد Gmail | `your-email@gmail.com` |
| `GMAIL_PASS` | App Password من Gmail | انظر أدناه |

### الحصول على Gmail App Password:

1. فعّل Two-Factor Authentication على حسابك
2. اذهب إلى https://myaccount.google.com/apppasswords
3. اختر Mail و Windows Computer
4. نسخ الـ 16 حرف password

---

## 🚀 الخطوة 3: النشر على DigitalOcean

### الطريقة 1: استخدام UI (الأسهل)

1. اذهب إلى https://cloud.digitalocean.com/apps
2. انقر "Create App"
3. اختر GitHub repository: `belalwws/hackpro-saas`
4. انقر "Next"
5. اختر:
   - **Source Branch**: `main`
   - **Auto Deploy**: ON
   - **Build Command**: `npm ci && npm run build:production`
   - **Run Command**: `npm start`
   - **HTTP Port**: `3000`

### إضافة البيانات والمتغيرات:

6. في قسم "Environment Variables":
   - أضف جميع المتغيرات من الجدول أعلاه

7. في قسم "Resources":
   - اختر "Add Database"
   - Database Type: PostgreSQL
   - Version: 14
   - اسم قاعدة البيانات: `hackpro_db`
   - Save CONNECTION STRING

8. غيّر `DATABASE_URL` ليشير إلى قاعدة البيانات الجديدة

### الطريقة 2: استخدام CLI

```bash
# 1. تثبيت doctl CLI
# من هنا: https://docs.digitalocean.com/reference/doctl/how-to/install/

# 2. المصادقة
doctl auth init

# 3. النشر
doctl apps create --spec app.yaml
```

---

## ⚙️ الخطوة 4: تشغيل Migrations

بعد النشر الأول، تحتاج لتشغيل database migrations:

### في Console DigitalOcean:

1. اذهب إلى Your App → Runtime
2. اختر Web Service
3. في "Console":

```bash
npm ci
npx prisma db push
npx prisma generate
```

أو استخدم الـ postdeploy script المدمج:

```bash
npm ci && npm run build:production && npx prisma db push
```

---

## 🔍 الخطوة 5: التحقق من الصحة

### 1. افتح التطبيق:
```
https://your-app-name.ondigitalocean.app
```

### 2. افحص Logs:
```bash
doctl apps logs YOUR_APP_ID web
```

أو من DigitalOcean Dashboard:
- Apps → Your App → Logs

### 3. اختبر الاتصال بقاعدة البيانات:
```bash
# من Terminal المحلي أو App Console
curl https://your-app-name.ondigitalocean.app/api/health
```

### 4. اختبر الإيميلات:
```bash
# في الـ App Console
node scripts/test-email.js
```

---

## 📊 المراقبة والصيانة

### عرض Logs:
```bash
doctl apps logs APP_ID web
```

### تحديث البيانات:
```bash
# في App Console
npx prisma db push
npx prisma generate
```

### عمل Backup:
```bash
# من GitHub CLI أو local machine
DATABASE_URL="..." npx prisma db seed
```

---

## 🐛 حل المشاكل الشائعة

### المشكلة: "Build Failed"
**الحل:**
```bash
# تأكد من package.json صحيح
# تأكد من postinstall script
npm ci
npm run build:production
```

### المشكلة: Database Connection Error
**الحل:**
1. تحقق من `DATABASE_URL` في Environment Variables
2. تأكد من SSL mode: `?sslmode=require`
3. أعد تشغيل التطبيق

### المشكلة: Emails لا تُرسل
**الحل:**
1. تحقق من `GMAIL_USER` و `GMAIL_PASS`
2. استخدم **App Password** ليس رقم PIN
3. فعّل Gmail Less Secure Apps إذا لزم

### المشكلة: Cloudinary Upload خطأ
**الحل:**
1. تحقق من جميع CLOUDINARY variables
2. تأكد من API Secret صحيح

### المشكلة: 502 Bad Gateway
**الحل:**
```bash
# إعادة تشغيل التطبيق
doctl apps restart APP_ID
```

---

## 📈 الخطوات التالية

### تحسين الأداء:
- [ ] فعّل Caching مع Redis
- [ ] استخدم CDN لـ Cloudinary
- [ ] قلل حجم Images

### الأمان:
- [ ] فعّل HTTPS (افتراضي على DO)
- [ ] قلل صلاحيات Database
- [ ] استخدم Secrets Manager

### المراقبة:
- [ ] فعّل Google Analytics
- [ ] اعدل Sentry للأخطاء
- [ ] راقب Logs بشكل دوري

---

## 📚 روابط مفيدة

- [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [Neon Database Docs](https://neon.tech/docs)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Next.js Deployment](https://nextjs.org/docs/deployment/digital-ocean)

---

## 💡 نصائح مهمة

✅ احفظ المتغيرات البيئية في مكان آمن  
✅ عمل Backup لقاعدة البيانات بانتظام  
✅ راقب الـ Logs أول أسبوع بعد النشر  
✅ استخدم الـ Staging environment قبل Production  
✅ وثق أي تغييرات تقوم بها  

---

**صُنع بـ ❤️ بواسطة فريق HackPro**

🔗 [GitHub](https://github.com/belalwws/hackpro-saas)  
📧 [البريد](mailto:support@hackpro.com)  
🌐 [الموقع](https://hackpro.io)
