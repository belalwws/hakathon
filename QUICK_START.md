# ⚡ دليل البدء السريع
## Quick Start Guide - HackPro Platform

**وقت القراءة: 5 دقائق** ⏱️

---

## 🚀 التشغيل في 3 خطوات

### 1️⃣ التثبيت والإعداد

```bash
# Clone المشروع (إذا لم يكن عندك)
git clone https://github.com/belalwws/hackpro-saas.git
cd hackpro-saas

# تثبيت الحزم
npm install

# نسخ ملف البيئة (موجود مسبقاً)
# تأكد من وجود .env مع المتغيرات الصحيحة
```

### 2️⃣ إعداد قاعدة البيانات

```bash
# تطبيق Schema
npx prisma db push

# توليد Prisma Client
npx prisma generate

# (اختياري) عرض قاعدة البيانات
npx prisma studio
```

### 3️⃣ التشغيل

```bash
# Development
npm run dev

# فتح المتصفح على http://localhost:3000
```

**تهانينا! 🎉 المشروع يعمل الآن!**

---

## 📝 إضافة API Keys (اختياري ولكن موصى به)

### Google Analytics

1. اذهب إلى https://analytics.google.com
2. أنشئ Property جديد
3. انسخ Measurement ID (يبدأ بـ `G-`)
4. أضفه في `.env`:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Google Maps

1. اذهب إلى https://console.cloud.google.com
2. فعّل Google Maps JavaScript API
3. أنشئ API Key
4. أضفه في `.env`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY
```

5. أعد تشغيل الخادم:

```bash
npm run dev
```

---

## 🗺️ استكشاف الصفحات

| الصفحة | المسار | الوصف |
|--------|--------|--------|
| 🏠 الرئيسية | `/` | صفحة الهبوط |
| ℹ️ من نحن | `/about` | معلومات الشركة |
| ✨ المميزات | `/features` | 12 ميزة رئيسية |
| 💰 الأسعار | `/pricing` | خطط التسعير |
| 📧 التواصل | `/contact` | نموذج التواصل + خريطة |
| 📝 المدونة | `/blog` | المقالات |
| 🔐 تسجيل الدخول | `/login` | تسجيل دخول |
| ✍️ التسجيل | `/register` | تسجيل مستخدم جديد |

---

## 🧪 اختبار الميزات الجديدة

### 1. الرسوم المتحركة

زر صفحة **من نحن** (`/about`) ولاحظ:
- ✨ عدادات الأرقام المتحركة (AnimatedCounter)
- 🎯 تأثيرات Parallax عند السكرول
- 🎨 بطاقات تفاعلية 3D (HoverCard)

### 2. نظام المدونة API

افتح Terminal واختبر:

```bash
# جلب قائمة المقالات
curl http://localhost:3000/api/blog/posts

# جلب الفئات
curl http://localhost:3000/api/blog/categories
```

### 3. Google Analytics

افتح Console في المتصفح (F12) ولاحظ:
```javascript
// يجب أن ترى تتبع تلقائي للصفحات
// عند الانتقال بين الصفحات
```

### 4. الصور المحسّنة

افتح Network tab وزر صفحة المدونة:
- لاحظ lazy loading للصور
- لاحظ تحميل AVIF/WebP تلقائياً

---

## 📊 إضافة محتوى للمدونة (اختياري)

### عبر Prisma Studio:

```bash
npx prisma studio
```

1. افتح جدول `BlogCategory`
2. أضف فئة جديدة
3. افتح جدول `User` واحصل على userId
4. افتح جدول `BlogPost`
5. أضف مقال جديد:
   - titleAr: "مقالي الأول"
   - titleEn: "My First Post"
   - contentAr: "محتوى المقال..."
   - contentEn: "Post content..."
   - authorId: [USER_ID من الخطوة 3]
   - categoryId: [CATEGORY_ID من الخطوة 2]
   - status: "published"

### عبر API:

```bash
curl -X POST http://localhost:3000/api/blog/posts \
  -H "Content-Type: application/json" \
  -d '{
    "titleAr": "مقالي الأول",
    "titleEn": "My First Post",
    "excerptAr": "ملخص قصير",
    "excerptEn": "Short excerpt",
    "contentAr": "محتوى المقال الكامل",
    "contentEn": "Full post content",
    "categoryId": "YOUR_CATEGORY_ID",
    "authorId": "YOUR_USER_ID",
    "status": "published",
    "featured": false
  }'
```

---

## 🎨 تخصيص المظهر

### تغيير الألوان الرئيسية:

في `app/globals.css`:

```css
@layer base {
  :root {
    --primary: 220 70% 50%;      /* اللون الأساسي */
    --secondary: 280 60% 50%;    /* اللون الثانوي */
    --accent: 340 75% 47%;       /* لون التركيز */
  }
}
```

### تغيير الخطوط:

في `app/layout.tsx`:

```tsx
import { Cairo, Inter } from 'next/font/google'

const cairo = Cairo({ subsets: ['arabic'] })
const inter = Inter({ subsets: ['latin'] })
```

---

## 🐛 حل المشاكل الشائعة

### المشكلة: الصفحة فارغة أو بيضاء

**الحل:**
```bash
# امسح cache و node_modules
rm -rf .next node_modules
npm install
npm run dev
```

### المشكلة: خطأ Prisma Client

**الحل:**
```bash
npx prisma generate
npm run dev
```

### المشكلة: خطأ في قاعدة البيانات

**الحل:**
```bash
# تأكد من DATABASE_URL في .env
# ثم
npx prisma db push
npx prisma generate
```

### المشكلة: الصور لا تظهر

**الحل:**
- تأكد من وجود `remotePatterns` في `next.config.js`
- تأكد من صلاحية URLs للصور

### المشكلة: TypeScript errors

**الحل:**
```bash
# أعد تشغيل VS Code
# أو
npm run build
```

---

## 📚 الخطوات التالية

### للتطوير:
1. 📖 اقرأ [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. ✨ راجع [FEATURES_CHECKLIST.md](./FEATURES_CHECKLIST.md)
3. 💡 استعرض [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)
4. 🚀 راجع [ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md)

### للنشر:
1. احصل على API Keys (Analytics & Maps)
2. طبّق Migration على Production Database
3. حدّث Environment Variables
4. Build:
   ```bash
   npm run build
   npm start
   ```

---

## 🎯 أهم الأوامر

```bash
# Development
npm run dev              # تشغيل المشروع للتطوير

# Production
npm run build            # Build للإنتاج
npm start               # تشغيل Production build

# Database
npx prisma studio       # عرض قاعدة البيانات
npx prisma generate     # توليد Prisma Client
npx prisma db push      # تطبيق Schema changes

# Code Quality
npm run lint            # فحص الأكواد
npm run type-check      # فحص TypeScript
```

---

## 📞 الدعم والمساعدة

### الوثائق الكاملة:
- 📖 [دليل النشر الكامل](./DEPLOYMENT_GUIDE.md)
- ✅ [قائمة الميزات](./FEATURES_CHECKLIST.md)
- 💡 [أمثلة الاستخدام](./USAGE_EXAMPLES.md)
- 🚀 [الميزات المتقدمة](./ADVANCED_FEATURES.md)
- 📝 [ملخص التنفيذ](./IMPLEMENTATION_SUMMARY.md)

### روابط مفيدة:
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)

---

## 🎉 تهانينا!

أنت الآن جاهز لاستخدام جميع ميزات HackPro Platform! 🚀

**استمتع بالتطوير!** 💻✨

---

**آخر تحديث:** 29 أكتوبر 2025  
**الإصدار:** v2.0.0
