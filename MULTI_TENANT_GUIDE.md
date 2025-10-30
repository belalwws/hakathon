# 🏢 Multi-Tenant System Architecture

## فهم النظام

HackPro هو نظام **Multi-Tenant SaaS** يشبه منصات مثل **LearnWorlds** أو **Shopify**:

### 📋 كيف يعمل النظام؟

#### 1. **التسجيل الأول = إنشاء مؤسسة جديدة**
عندما يسجل شخص جديد في المنصة:
- يتم إنشاء **User** جديد برول `admin`
- يتم إنشاء **Organization** خاصة به تلقائياً
- يصبح **Owner** لهذه المؤسسة
- كل مؤسسة **معزولة تماماً** عن باقي المؤسسات

#### 2. **الأدوار داخل كل مؤسسة**
كل Admin (صاحب مؤسسة) يقدر يضيف:
- 🎯 **Participants** (مشاركين في الهاكاثونات)
- ⚖️ **Judges** (حكام لتقييم المشاريع)
- 👨‍💼 **Supervisors** (مشرفين)
- 🎓 **Experts** (خبراء)

#### 3. **العزل التام (Isolation)**
- كل مؤسسة لها بياناتها الخاصة
- لا يمكن لأي مستخدم رؤية بيانات مؤسسة أخرى
- كل Admin يرى فقط:
  - مستخدميه
  - هاكاثوناته
  - بياناته الخاصة

---

## 🔐 الدور الخاص: Master Admin

### ما هو Master Admin؟
- دور خاص **Super Admin** يدير المنصة بالكامل
- يقدر يشوف **جميع المؤسسات**
- يقدر يشوف **جميع المستخدمين**
- يقدر يدير الـ plans والاشتراكات
- الوصول عبر: `/master`

### الحساب الافتراضي
```
Email: master@hackpro.cloud
الدور: master
```

---

## 🗄️ Database Structure

### العلاقة بين User و Organization

```
User (المستخدم)
  ↓
OrganizationUser (الربط - Many to Many)
  ↓
Organization (المؤسسة)
```

#### Why Many-to-Many?
لأن المستخدم ممكن يكون:
- عضو في أكثر من مؤسسة
- له أدوار مختلفة في كل مؤسسة

#### Schema
```prisma
model User {
  id            String   @id
  email         String   @unique
  name          String
  role          UserRole @default(participant)
  organizations OrganizationUser[] // Many-to-Many
}

model OrganizationUser {
  userId         String
  organizationId String
  role           OrgRole  // owner, admin, member
  isOwner        Boolean
  
  user           User         @relation(...)
  organization   Organization @relation(...)
}

model Organization {
  id     String @id
  name   String
  slug   String @unique
  plan   Plan   @default(free)
  status OrgStatus
  users  OrganizationUser[]
}
```

---

## 🔧 Scripts المساعدة

### 1. فحص المستخدمين
```bash
node scripts/check-users.js
```
يعرض:
- عدد المستخدمين
- تفاصيل كل مستخدم
- المؤسسات المرتبطة

### 2. فحص المؤسسات
```bash
node scripts/check-orgs.js
```
يعرض:
- عدد المؤسسات
- المستخدمين في كل مؤسسة
- المستخدمين بدون مؤسسات

### 3. ربط المستخدمين بالمؤسسات
```bash
node scripts/link-users-orgs.js
```
يربط تلقائياً:
- Master Admin → Default Organization
- كل Admin → مؤسسة خاصة به

---

## 📊 Master Dashboard Features

### 1. إدارة المستخدمين
- عرض جميع المستخدمين من جميع المؤسسات
- البحث والفلترة حسب الدور
- إحصائيات (مشاركين، حكام، مديرين)

### 2. إدارة المؤسسات
- عرض جميع المؤسسات
- الخطة (Free, Starter, Professional, Enterprise)
- الحالة (Active, Suspended, Cancelled)

### 3. التحليلات
- نمو المنصة شهرياً
- توزيع الخطط
- توزيع الأدوار
- حالة الهاكاثونات

---

## 🚀 Workflow التسجيل

### للمستخدم الجديد:
1. يدخل على `/register`
2. يسجل بياناته
3. **النظام تلقائياً:**
   - ✅ ينشئ User جديد
   - ✅ ينشئ Organization جديدة
   - ✅ يربط User بـ Organization كـ Owner
4. يتوجه لـ Dashboard الخاص به

### للـ Master Admin:
1. يسجل دخول بـ `master@hackpro.cloud`
2. يدخل على `/master`
3. يشوف جميع المؤسسات والمستخدمين
4. يدير النظام بالكامل

---

## 🔄 API Endpoints

### Master Dashboard APIs
```
GET /api/master/users
GET /api/master/organizations
GET /api/master/stats
GET /api/master/analytics
```

### Multi-Tenancy APIs
```
GET /api/organizations
POST /api/organizations
GET /api/organizations/[slug]
```

---

## 💡 Best Practices

### عند إضافة مستخدم جديد:
1. تحديد المؤسسة (organizationId)
2. تحديد الدور (role)
3. ربطه عبر OrganizationUser

### عند الـ Query:
```typescript
// ❌ Wrong - User doesn't have direct organization relation
const user = await prisma.user.findUnique({
  include: { organization: true }
})

// ✅ Correct - Use OrganizationUser
const user = await prisma.user.findUnique({
  include: {
    organizations: {
      include: {
        organization: true
      }
    }
  }
})
```

---

## 📝 Notes

- النظام يدعم **اللغة العربية والإنجليزية** بالكامل
- كل المكونات **Responsive** وتعمل على جميع الشاشات
- الأمان مبني على **Organization Isolation**
- كل API request يحتاج Organization context

---

Created: October 30, 2025
Last Updated: October 30, 2025
