# Multi-Tenant Registration System

## Overview
تم تحويل نظام التسجيل من نظام تسجيل المشاركين (Participants) إلى نظام تسجيل المسؤولين مع إنشاء مؤسساتهم (Admin + Organization).

## Changes Made

### 1. Register Page (`app/register/page.tsx`)
**القديم (Backup: `page-old-participant.tsx`):**
- تسجيل مشاركين في الهاكاثونات
- حقول: الاسم، الإيميل، الهاتف، المدينة، الجنسية، نوع الفريق، الدور المفضل
- Role: `participant`

**الجديد:**
- تسجيل مسؤولين وإنشاء مؤسسات جديدة
- حقول: الاسم، الإيميل، كلمة المرور، اسم المؤسسة، معرّف المؤسسة (slug)
- Role: `admin`
- تصميم حديث يطابق Master/Admin Dashboard
- Two-column layout مع branding على اليسار
- Auto-generate slug من اسم المؤسسة
- Validation للإيميل وكلمة المرور والـ slug

### 2. Register API (`app/api/auth/register/route.ts`)
**التحديثات:**
```typescript
// القديم
- Create User only
- Role: 'participant'
- Fields: name, email, password, phone, city, nationality, skills, experience, preferredRole

// الجديد
- Create Organization + User + OrganizationUser في transaction واحدة
- Role: 'admin'
- Fields: name, email, password, organizationName, organizationSlug
- Validate slug format (URL-safe: a-z, 0-9, hyphens only)
- Check slug uniqueness
- Link user to organization with isOwner=true
```

**Transaction Flow:**
```javascript
1. Create Organization (name, slug, plan='free', isActive=true)
2. Create User (name, email, hashedPassword, role='admin')
3. Create OrganizationUser (userId, organizationId, isOwner=true)
```

**JWT Token:**
الآن يتضمن `organizationId` في الـ payload:
```javascript
{
  userId: user.id,
  email: user.email,
  role: user.role,
  organizationId: organization.id  // NEW
}
```

### 3. Validation Rules

**Organization Slug:**
- Format: `^[a-z0-9-]+$` (lowercase letters, numbers, hyphens only)
- Must be unique across all organizations
- Auto-generated from organization name
- Example: "وزارة الاتصالات" → "ministry-of-communications"

**Password:**
- Minimum 8 characters
- Must match confirmation field

**Email:**
- Valid email format
- Must be unique across all users

## Testing Scripts

### 1. Verify Registration
تحقق من نجاح التسجيل ومعلومات المستخدم والمؤسسة:
```bash
node scripts/verify-registration.js admin@example.com
```

**Output:**
- User details (ID, name, email, role)
- Organization details (name, slug, plan, isActive)
- OrganizationUser link (isOwner status)
- Statistics (hackathon count)

### 2. Delete Test User
حذف مستخدم تجريبي مع مؤسسته:
```bash
node scripts/delete-test-user.js test@example.com
```

**يحذف:**
- OrganizationUser links
- Hackathons created by the organization
- Organization record
- User record

## Registration Flow

### Frontend (`/register`)
```
1. User fills form:
   - Personal: name, email, password, confirmPassword
   - Organization: organizationName, organizationSlug

2. Form validation:
   ✓ All fields required
   ✓ Passwords match
   ✓ Password length >= 8
   ✓ Slug auto-generated from org name

3. Submit to API:
   POST /api/auth/register
   Body: { name, email, password, organizationName, organizationSlug }

4. On success:
   - Redirect to /admin/dashboard
   - Auto-login with JWT cookie
```

### Backend (`/api/auth/register`)
```
1. Validate input:
   ✓ All required fields present
   ✓ Slug format (URL-safe)

2. Check duplicates:
   ✓ Email unique
   ✓ Organization slug unique

3. Hash password (bcrypt, 12 rounds)

4. Transaction:
   a. Create Organization
   b. Create User (role='admin')
   c. Create OrganizationUser (isOwner=true)

5. Generate JWT token (with organizationId)

6. Send welcome email (optional, non-blocking)

7. Set auth-token cookie

8. Return response:
   {
     message: "تم إنشاء المؤسسة والحساب بنجاح",
     user: { id, name, email, role },
     organization: { id, name, slug },
     autoLogin: true
   }
```

## Database Schema

### User
```prisma
model User {
  id           String             @id @default(cuid())
  email        String             @unique
  name         String
  password     String
  role         UserRole           @default(participant)
  organizations OrganizationUser[]
}
```

### Organization
```prisma
model Organization {
  id         String             @id @default(cuid())
  name       String
  slug       String             @unique
  plan       String             @default("free")
  isActive   Boolean            @default(true)
  users      OrganizationUser[]
  hackathons Hackathon[]
}
```

### OrganizationUser (Join Table)
```prisma
model OrganizationUser {
  userId         String
  organizationId String
  isOwner        Boolean        @default(false)
  user           User           @relation(...)
  organization   Organization   @relation(...)
  
  @@id([userId, organizationId])
}
```

## Migration Path

### من النظام القديم للجديد:

**Existing Participants:**
- لا يتأثرون - يبقون بـ role='participant'
- ليس لديهم organizations
- يمكنهم تسجيل الدخول والمشاركة كالمعتاد

**New Admins:**
- يُنشأون بـ role='admin'
- لديهم organization واحدة على الأقل
- يملكون (isOwner=true) مؤسستهم
- يرون فقط بيانات مؤسستهم (data isolation)

**Master Users:**
- role='master'
- يرون جميع المؤسسات
- لوحة التحكم: `/master/dashboard`

## URLs

- **Register:** `http://localhost:3001/register`
- **Login:** `http://localhost:3001/login`
- **Admin Dashboard:** `http://localhost:3001/admin/dashboard`
- **Master Dashboard:** `http://localhost:3001/master/dashboard`

## Security Features

✅ **Data Isolation:** Admin sees only their organization's data
✅ **Password Hashing:** bcrypt with 12 rounds
✅ **JWT Authentication:** 7-day expiry with organizationId
✅ **HTTP-Only Cookies:** Prevents XSS attacks
✅ **Unique Constraints:** Email and slug must be unique
✅ **Transaction Safety:** All-or-nothing registration
✅ **Slug Validation:** URL-safe characters only

## Testing Checklist

- [ ] Register new admin with valid data
- [ ] Verify organization created
- [ ] Verify OrganizationUser link created
- [ ] Verify auto-login works
- [ ] Access admin dashboard
- [ ] Verify data isolation (only org's data visible)
- [ ] Test duplicate email rejection
- [ ] Test duplicate slug rejection
- [ ] Test invalid slug format rejection
- [ ] Test password mismatch rejection
- [ ] Test password too short rejection

## Next Steps

1. **Email Verification:** Add email confirmation before activation
2. **Organization Settings:** Allow admins to update organization details
3. **Team Management:** Add ability to invite other users to organization
4. **Plan Upgrades:** Implement paid plans (pro, enterprise)
5. **Subdomain Support:** org.hackpro.com routing
