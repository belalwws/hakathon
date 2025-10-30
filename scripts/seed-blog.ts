import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 بدء إضافة بيانات المدونة...')

  // 1. إنشاء مستخدم للمقالات (أو استخدام موجود)
  let author = await prisma.user.findFirst({
    where: { role: 'admin' }
  })

  if (!author) {
    console.log('📝 إنشاء مستخدم Admin...')
    author = await prisma.user.create({
      data: {
        name: 'فريق HackPro',
        email: 'admin@hackpro.com',
        password: '$2b$10$xxxxxxxxxxx', // hashed password
        role: 'admin',
        isActive: true,
        emailVerified: true
      }
    })
  }

  console.log('✅ المؤلف:', author.name)

  // 2. إنشاء الفئات
  console.log('📁 إنشاء الفئات...')
  
  const categories = await Promise.all([
    prisma.blogCategory.upsert({
      where: { slug: 'tutorials' },
      update: {},
      create: {
        slug: 'tutorials',
        nameAr: 'دروس تعليمية',
        nameEn: 'Tutorials',
        descriptionAr: 'دروس تعليمية خطوة بخطوة',
        descriptionEn: 'Step-by-step tutorials',
        icon: 'Code2',
        color: '#3b82f6',
        order: 1
      }
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'tips' },
      update: {},
      create: {
        slug: 'tips',
        nameAr: 'نصائح وحيل',
        nameEn: 'Tips & Tricks',
        descriptionAr: 'نصائح سريعة لتحسين الإنتاجية',
        descriptionEn: 'Quick tips to boost productivity',
        icon: 'Lightbulb',
        color: '#f59e0b',
        order: 2
      }
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'success-stories' },
      update: {},
      create: {
        slug: 'success-stories',
        nameAr: 'قصص نجاح',
        nameEn: 'Success Stories',
        descriptionAr: 'قصص ملهمة من الهاكاثونات',
        descriptionEn: 'Inspiring stories from hackathons',
        icon: 'Trophy',
        color: '#10b981',
        order: 3
      }
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'community' },
      update: {},
      create: {
        slug: 'community',
        nameAr: 'المجتمع',
        nameEn: 'Community',
        descriptionAr: 'أخبار وفعاليات المجتمع',
        descriptionEn: 'Community news and events',
        icon: 'Users',
        color: '#8b5cf6',
        order: 4
      }
    })
  ])

  console.log('✅ تم إنشاء', categories.length, 'فئات')

  // 3. إنشاء الوسوم
  console.log('🏷️ إنشاء الوسوم...')
  
  const tags = await Promise.all([
    prisma.blogTag.upsert({
      where: { slug: 'hackathon' },
      update: {},
      create: { slug: 'hackathon', nameAr: 'هاكاثون', nameEn: 'Hackathon' }
    }),
    prisma.blogTag.upsert({
      where: { slug: 'programming' },
      update: {},
      create: { slug: 'programming', nameAr: 'برمجة', nameEn: 'Programming' }
    }),
    prisma.blogTag.upsert({
      where: { slug: 'teamwork' },
      update: {},
      create: { slug: 'teamwork', nameAr: 'عمل جماعي', nameEn: 'Teamwork' }
    }),
    prisma.blogTag.upsert({
      where: { slug: 'innovation' },
      update: {},
      create: { slug: 'innovation', nameAr: 'ابتكار', nameEn: 'Innovation' }
    }),
    prisma.blogTag.upsert({
      where: { slug: 'tips' },
      update: {},
      create: { slug: 'tips', nameAr: 'نصائح', nameEn: 'Tips' }
    }),
    prisma.blogTag.upsert({
      where: { slug: 'success' },
      update: {},
      create: { slug: 'success', nameAr: 'نجاح', nameEn: 'Success' }
    })
  ])

  console.log('✅ تم إنشاء', tags.length, 'وسوم')

  // 4. إنشاء المقالات
  console.log('📝 إنشاء المقالات...')

  const posts = [
    {
      slug: 'how-to-win-hackathon-2025',
      titleAr: 'كيف تفوز بالهاكاثون في 2025',
      titleEn: 'How to Win a Hackathon in 2025',
      excerptAr: 'دليل شامل للفوز في الهاكاثونات مع أفضل الاستراتيجيات والنصائح من الخبراء',
      excerptEn: 'Complete guide to winning hackathons with best strategies and expert tips',
      contentAr: `
# كيف تفوز بالهاكاثون في 2025

الفوز في الهاكاثون يتطلب أكثر من مجرد مهارات برمجية. إليك الدليل الكامل:

## 1. التحضير المسبق
- ابحث عن المسابقة والجوائز
- كوّن فريقًا متنوعًا
- حدد الأدوات التي ستستخدمها

## 2. الفكرة
- اختر مشكلة حقيقية
- تأكد من إمكانية التنفيذ في الوقت المحدد
- ركز على القيمة المضافة

## 3. التنفيذ
- خطط للوقت بعناية
- ابدأ بـ MVP
- اختبر باستمرار

## 4. العرض التقديمي
- قصة مقنعة
- عرض توضيحي مباشر
- أظهر التأثير

**نصيحة ذهبية:** النوم الكافي أهم من السهر! 😴
      `,
      contentEn: `
# How to Win a Hackathon in 2025

Winning a hackathon requires more than coding skills. Here's your complete guide:

## 1. Preparation
- Research the competition and prizes
- Build a diverse team
- Choose your tech stack

## 2. The Idea
- Pick a real problem
- Ensure feasibility
- Focus on value

## 3. Implementation
- Plan your time carefully
- Start with MVP
- Test continuously

## 4. Presentation
- Compelling story
- Live demo
- Show impact

**Golden tip:** Sleep is more important than pulling all-nighters! 😴
      `,
      coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
      categoryId: categories[0].id, // tutorials
      tagIds: [tags[0].id, tags[1].id, tags[4].id],
      featured: true
    },
    {
      slug: '10-tips-team-collaboration',
      titleAr: '10 نصائح لتعاون الفريق الفعال',
      titleEn: '10 Tips for Effective Team Collaboration',
      excerptAr: 'نصائح عملية لتحسين التعاون والإنتاجية داخل فريق الهاكاثون',
      excerptEn: 'Practical tips to improve collaboration and productivity in your hackathon team',
      contentAr: `
# 10 نصائح لتعاون الفريق الفعال

## 1. التواصل الواضح
استخدم أدوات مثل Slack أو Discord

## 2. تقسيم المهام
كل فرد يعرف مسؤولياته

## 3. اجتماعات يومية قصيرة
15 دقيقة فقط لمتابعة التقدم

## 4. استخدم Git بذكاء
Branches منظمة و Pull Requests

## 5. احترم الوقت
التزم بالمواعيد المحددة

وأكثر...
      `,
      contentEn: `
# 10 Tips for Effective Team Collaboration

## 1. Clear Communication
Use tools like Slack or Discord

## 2. Divide Tasks
Everyone knows their responsibilities

## 3. Daily Standups
Just 15 minutes to track progress

## 4. Use Git Smartly
Organized branches & Pull Requests

## 5. Respect Time
Stick to deadlines

And more...
      `,
      coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      categoryId: categories[1].id, // tips
      tagIds: [tags[2].id, tags[4].id],
      featured: false
    },
    {
      slug: 'success-story-first-hackathon',
      titleAr: 'قصة نجاح: من هاكاثوني الأول للفوز',
      titleEn: 'Success Story: From First Hackathon to Winning',
      excerptAr: 'تجربة ملهمة لفريق فاز في أول هاكاثون له',
      excerptEn: 'Inspiring story of a team that won their first hackathon',
      contentAr: `
# قصة نجاح: من هاكاثوني الأول للفوز

كنت خائفًا جدًا قبل الهاكاثون الأول...

## البداية
لم أكن أعرف ما أتوقع

## التحدي
48 ساعة من البرمجة المتواصلة

## النتيجة
🏆 المركز الأول!

## الدروس المستفادة
- الثقة بالنفس
- قوة الفريق
- التعلم المستمر
      `,
      contentEn: `
# Success Story: From First Hackathon to Winning

I was so scared before my first hackathon...

## The Beginning
I didn't know what to expect

## The Challenge
48 hours of continuous coding

## The Result
🏆 First place!

## Lessons Learned
- Self-confidence
- Team power
- Continuous learning
      `,
      coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
      categoryId: categories[2].id, // success-stories
      tagIds: [tags[0].id, tags[5].id],
      featured: true
    },
    {
      slug: 'hackathon-tools-2025',
      titleAr: 'أفضل الأدوات للهاكاثونات في 2025',
      titleEn: 'Best Tools for Hackathons in 2025',
      excerptAr: 'قائمة شاملة بأفضل الأدوات والتقنيات للهاكاثونات',
      excerptEn: 'Comprehensive list of best tools and technologies for hackathons',
      contentAr: `
# أفضل الأدوات للهاكاثونات في 2025

## 🚀 التطوير السريع
- Next.js 15
- Vercel
- Supabase

## 🎨 التصميم
- Figma
- Tailwind CSS
- shadcn/ui

## 📊 قواعد البيانات
- PostgreSQL (Neon)
- Prisma ORM

## 🤖 الذكاء الاصطناعي
- OpenAI API
- Claude API
- GitHub Copilot
      `,
      contentEn: `
# Best Tools for Hackathons in 2025

## 🚀 Rapid Development
- Next.js 15
- Vercel
- Supabase

## 🎨 Design
- Figma
- Tailwind CSS
- shadcn/ui

## 📊 Databases
- PostgreSQL (Neon)
- Prisma ORM

## 🤖 AI
- OpenAI API
- Claude API
- GitHub Copilot
      `,
      coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      categoryId: categories[0].id, // tutorials
      tagIds: [tags[1].id, tags[3].id],
      featured: false
    },
    {
      slug: 'community-events-march-2025',
      titleAr: 'فعاليات المجتمع - مارس 2025',
      titleEn: 'Community Events - March 2025',
      excerptAr: 'أهم الهاكاثونات والفعاليات القادمة في مارس',
      excerptEn: 'Top hackathons and events coming in March',
      contentAr: `
# فعاليات المجتمع - مارس 2025

## 🗓️ الهاكاثونات القادمة

### HackCairo 2025
📅 5-7 مارس  
📍 القاهرة، مصر  
💰 جوائز: $50,000

### Dubai Tech Challenge
📅 15-17 مارس  
📍 دبي، الإمارات  
💰 جوائز: $100,000

### Riyadh Innovation Hackathon
📅 25-27 مارس  
📍 الرياض، السعودية  
💰 جوائز: $75,000
      `,
      contentEn: `
# Community Events - March 2025

## 🗓️ Upcoming Hackathons

### HackCairo 2025
📅 March 5-7  
📍 Cairo, Egypt  
💰 Prizes: $50,000

### Dubai Tech Challenge
📅 March 15-17  
📍 Dubai, UAE  
💰 Prizes: $100,000

### Riyadh Innovation Hackathon
📅 March 25-27  
📍 Riyadh, Saudi Arabia  
💰 Prizes: $75,000
      `,
      coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      categoryId: categories[3].id, // community
      tagIds: [tags[0].id],
      featured: false
    },
    {
      slug: 'innovation-mindset',
      titleAr: 'كيف تطور عقلية الابتكار',
      titleEn: 'How to Develop an Innovation Mindset',
      excerptAr: 'استراتيجيات لتنمية التفكير الإبداعي والابتكاري',
      excerptEn: 'Strategies to develop creative and innovative thinking',
      contentAr: `
# كيف تطور عقلية الابتكار

## 💡 الفضول الدائم
اسأل "لماذا؟" و "ماذا لو؟"

## 🔄 التعلم من الفشل
كل فشل درس جديد

## 🌍 النظر للصورة الأكبر
ربط النقاط المختلفة

## 🤝 التعاون
أفضل الأفكار تأتي من التنوع
      `,
      contentEn: `
# How to Develop an Innovation Mindset

## 💡 Constant Curiosity
Ask "Why?" and "What if?"

## 🔄 Learn from Failure
Every failure is a lesson

## 🌍 See the Bigger Picture
Connect different dots

## 🤝 Collaborate
Best ideas come from diversity
      `,
      coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
      categoryId: categories[1].id, // tips
      tagIds: [tags[3].id, tags[4].id],
      featured: true
    }
  ]

  for (const postData of posts) {
    const { tagIds, ...data } = postData
    
    const post = await prisma.blogPost.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        authorId: author.id,
        status: 'published',
        publishedAt: new Date(),
        tags: {
          create: tagIds.map(tagId => ({
            tag: { connect: { id: tagId } }
          }))
        }
      }
    })

    console.log('✅ تم إنشاء مقال:', post.titleAr)
  }

  console.log('\n🎉 تم! تم إضافة جميع البيانات بنجاح!')
  console.log('\n📊 الملخص:')
  console.log('- الفئات:', categories.length)
  console.log('- الوسوم:', tags.length)
  console.log('- المقالات:', posts.length)
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
