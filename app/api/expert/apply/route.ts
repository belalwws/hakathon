import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { uploadToCloudinary } from '@/lib/cloudinary'

const prisma = new PrismaClient()

// POST /api/expert/apply - Submit expert application
export async function POST(request: NextRequest) {
  try {
    const formDataRaw = await request.formData()

    const hackathonId = formDataRaw.get('hackathonId') as string
    const formDataJson = formDataRaw.get('formData') as string

    // Parse the JSON form data
    const parsedData = formDataJson ? JSON.parse(formDataJson) : {}

    console.log('📋 Parsed expert form data:', parsedData)

    const name = parsedData.name || parsedData['الاسم الكامل'] || formDataRaw.get('name') as string
    const email = parsedData.email || parsedData['البريد الإلكتروني'] || formDataRaw.get('email') as string
    const phone = parsedData.phone || parsedData['رقم الهاتف'] || formDataRaw.get('phone') as string | null
    
    // ✅ استخدام الحقول الجديدة للخبراء
    const currentPosition = parsedData.currentPosition || parsedData['المنصب الحالي'] || null
    const company = parsedData.company || parsedData['الشركة/المؤسسة'] || null
    const yearsOfExperience = parsedData.yearsOfExperience || parsedData['سنوات الخبرة'] || null
    const bio = parsedData.bio || parsedData['نبذة عن الخبير'] || null
    const expertise = parsedData.expertise || parsedData['مجالات الخبرة'] || null
    const experience = parsedData.previousHackathons || parsedData['هل شاركت في هاكاثونات من قبل؟'] || null
    const whyJoin = parsedData.whyJoin || parsedData['لماذا تريد الانضمام كخبير؟'] || null
    
    const linkedin = parsedData.linkedIn || parsedData.linkedin || formDataRaw.get('linkedIn') as string | null
    const twitter = parsedData.twitter || formDataRaw.get('twitter') as string | null
    const website = parsedData.portfolio || parsedData.website || formDataRaw.get('portfolio') as string | null
    
    // معالجة الصورة الشخصية - البحث في كل الـ files المرسلة
    let profileImageFile: File | null = null
    let cvFile: File | null = null
    
    // جرب البحث بأسماء مختلفة
    const possibleImageKeys = ['profileImage', 'صوره شخصيه', 'صورة شخصية']
    const possibleCVKeys = ['cv', 'السيرة الذاتية', 'CV']
    
    for (const key of possibleImageKeys) {
      const file = formDataRaw.get(key)
      if (file && typeof file !== 'string') {
        profileImageFile = file as File
        break
      }
    }
    
    for (const key of possibleCVKeys) {
      const file = formDataRaw.get(key)
      if (file && typeof file !== 'string') {
        cvFile = file as File
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
    
    if (!cvFile) {
      for (const [key, value] of formDataRaw.entries()) {
        if (value instanceof File && (value.type === 'application/pdf' || value.name.endsWith('.pdf'))) {
          cvFile = value
          console.log('📄 Found CV file with key:', key)
          break
        }
      }
    }

    console.log('📝 Submitting expert application:', { 
      name, 
      email, 
      hackathonId, 
      hasImage: !!profileImageFile,
      hasCV: !!cvFile 
    })

    // Validate required fields
    if (!hackathonId || !name || !email) {
      return NextResponse.json({
        error: 'الاسم والبريد الإلكتروني والهاكاثون مطلوبة'
      }, { status: 400 })
    }

    // Check if there's already a pending application for this email and hackathon
    const existingApplication = await prisma.expertApplication.findFirst({
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
        
        const cloudinaryResult = await uploadToCloudinary(
          buffer,
          'hackathon/experts',
          `expert-${Date.now()}-${profileImageFile.name}`
        )
        
        profileImageUrl = cloudinaryResult.url
        console.log('📸 Expert profile image uploaded to Cloudinary:', cloudinaryResult.url)
      } catch (uploadError) {
        console.error('❌ Failed to upload image to Cloudinary:', uploadError)
        profileImageUrl = null
      }
    }
    
    // Handle CV upload to Cloudinary
    let cvUrl: string | null = null
    if (cvFile && cvFile.size > 0) {
      try {
        const bytes = await cvFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        const cloudinaryResult = await uploadToCloudinary(
          buffer,
          'hackathon/experts/cv',
          `cv-${Date.now()}-${cvFile.name}`
        )
        
        cvUrl = cloudinaryResult.url
        console.log('📄 Expert CV uploaded to Cloudinary:', cloudinaryResult.url)
      } catch (uploadError) {
        console.error('❌ Failed to upload CV to Cloudinary:', uploadError)
        cvUrl = null
      }
    }

    // Create application - استخدام الحقول الموجودة في ExpertApplication model
    const application = await prisma.expertApplication.create({
      data: {
        hackathonId,
        name,
        email,
        phone,
        bio,
        expertise: expertise || currentPosition || null, // استخدام expertise للمجالات
        experience: experience || yearsOfExperience?.toString() || null, // استخدام experience للسنوات/الخبرة
        linkedin,
        twitter,
        website,
        profileImage: profileImageUrl,
        nationalId: null, // يمكن إضافته لاحقاً إذا احتجنا
        workplace: company || null,
        education: null, // يمكن إضافته لاحقاً
        previousHackathons: experience || null,
        status: 'pending'
      }
    })

    console.log('✅ Expert application submitted successfully')

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
    console.error('❌ Error submitting expert application:', error)
    return NextResponse.json({
      error: 'خطأ في إرسال الطلب',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
