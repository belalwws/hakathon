import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { uploadToCloudinary } from '@/lib/cloudinary'

const prisma = new PrismaClient()

// POST /api/judge/apply - Submit judge application
export async function POST(request: NextRequest) {
  try {
    const formDataRaw = await request.formData()

    const hackathonId = formDataRaw.get('hackathonId') as string
    const formDataJson = formDataRaw.get('formData') as string

    // Parse the JSON form data
    const parsedData = formDataJson ? JSON.parse(formDataJson) : {}

    console.log('📋 Parsed form data:', parsedData)

    const name = parsedData.name || parsedData['الاسم الكامل'] || formDataRaw.get('name') as string
    const email = parsedData.email || parsedData['البريد الإلكتروني'] || formDataRaw.get('email') as string
    const phone = parsedData.phone || parsedData['رقم الهاتف'] || formDataRaw.get('phone') as string | null
    
    // ✅ استخدام الحقول الجديدة مباشرة
    const bio = parsedData.bio || parsedData['نبذه عن المحكم المشارك'] || null
    const nationalId = parsedData.nationalId || parsedData['رقم الهويه'] || parsedData['رقم الهوية'] || null
    const workplace = parsedData.workplace || parsedData['جهه العمل'] || parsedData['جهة العمل'] || null
    const education = parsedData.education || parsedData['المؤهل العلمي'] || null
    const previousHackathons = parsedData.previousHackathons || parsedData['هل شاركت في هاكثونات افتراضيه عبر الانترنت من قبب'] || parsedData['هل شاركت في هاكاثونات افتراضية من قبل؟'] || null
    
    console.log('📝 Extracted data:', { 
      name, email, phone, bio, nationalId, workplace, education, previousHackathons 
    })
    
    // للتوافق مع الحقول القديمة
    const expertise = education || parsedData.expertise || null
    const experience = previousHackathons || parsedData.experience || null
    
    const linkedin = parsedData.linkedin || formDataRaw.get('linkedin') as string | null
    const twitter = parsedData.twitter || formDataRaw.get('twitter') as string | null
    const website = parsedData.website || formDataRaw.get('website') as string | null
    
    // معالجة الصورة الشخصية - البحث في كل الـ files المرسلة
    let profileImageFile: File | null = null
    
    // جرب البحث بأسماء مختلفة
    const possibleImageKeys = ['profileImage', 'صوره شخصيه', 'صورة شخصية']
    for (const key of possibleImageKeys) {
      const file = formDataRaw.get(key)
      if (file && typeof file !== 'string') {
        profileImageFile = file as File
        break
      }
    }
    
    // إذا لم يتم العثور، جرب البحث في جميع المفاتيح
    if (!profileImageFile) {
      for (const [key, value] of formDataRaw.entries()) {
        if (value instanceof File && value.type.startsWith('image/')) {
          profileImageFile = value
          console.log('📸 Found image file with key:', key)
          break
        }
      }
    }

    console.log('📝 Submitting judge application:', { name, email, hackathonId, hasImage: !!profileImageFile })

    // Validate required fields
    if (!hackathonId || !name || !email) {
      return NextResponse.json({
        error: 'الاسم والبريد الإلكتروني والهاكاثون مطلوبة'
      }, { status: 400 })
    }

    // ✅ السماح بالتسجيل حتى لو الإيميل موجود في النظام
    // فقط تحقق من عدم وجود طلب معلق لنفس الإيميل في نفس الهاكاثون
    
    // Check if there's already a pending application for this email and hackathon
    const existingApplication = await prisma.judgeApplication.findFirst({
      where: {
        email,
        hackathonId,
        status: 'pending'
      }
    })

    if (existingApplication) {
      return NextResponse.json({
        error: 'لديك طلب معلق بالفعل لهذا الهاكاثون'
      }, { status: 400 })
    }

    // Handle profile image upload to Cloudinary
    let profileImageUrl: string | null = null
    if (profileImageFile && profileImageFile.size > 0) {
      try {
        const bytes = await profileImageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Upload to Cloudinary instead of base64
        const cloudinaryResult = await uploadToCloudinary(
          buffer,
          'hackathon/judges',
          `judge-${Date.now()}-${profileImageFile.name}`
        )
        
        profileImageUrl = cloudinaryResult.url
        console.log('📸 Profile image uploaded to Cloudinary:', cloudinaryResult.url)
      } catch (uploadError) {
        console.error('❌ Failed to upload image to Cloudinary:', uploadError)
        // Continue without image rather than failing the whole application
        profileImageUrl = null
      }
    }

    // Create application
    const application = await prisma.judgeApplication.create({
      data: {
        hackathonId,
        name,
        email,
        phone,
        bio,
        expertise,
        experience,
        linkedin,
        twitter,
        website,
        profileImage: profileImageUrl,
        nationalId,
        workplace,
        education,
        previousHackathons,
        status: 'pending'
      }
    })

    console.log('✅ Judge application submitted successfully')

    return NextResponse.json({
      message: 'تم إرسال طلبك بنجاح! سيتم مراجعته قريباً',
      application: {
        id: application.id,
        name: application.name,
        email: application.email,
        status: application.status
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error submitting application:', error)
    return NextResponse.json({
      error: 'خطأ في إرسال الطلب',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

