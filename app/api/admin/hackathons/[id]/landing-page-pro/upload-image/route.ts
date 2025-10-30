import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - رفع صورة لصفحة الهبوط
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json({ error: 'لم يتم العثور على ملف' }, { status: 400 })
    }

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'يجب أن يكون الملف صورة' }, { status: 400 })
    }

    // التحقق من حجم الملف (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'حجم الملف كبير جداً (الحد الأقصى 5MB)' }, { status: 400 })
    }

    console.log(`📤 Uploading image: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`)

    // تحويل الملف إلى base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // إنشاء معرف فريد للصورة
    const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // إنشاء URL للصورة (يمكن استخدامها في الكود)
    const imageUrl = `/api/admin/hackathons/${resolvedParams.id}/landing-page-pro/images/${imageId}`

    // حفظ الصورة في قاعدة البيانات
    try {
      // إنشاء جدول الصور إذا لم يكن موجوداً
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS landing_page_images (
          id TEXT PRIMARY KEY,
          "hackathonId" TEXT NOT NULL,
          "fileName" TEXT NOT NULL,
          "fileType" TEXT NOT NULL,
          "fileSize" INTEGER NOT NULL,
          "base64Data" TEXT NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `

      // حفظ الصورة
      await prisma.$executeRaw`
        INSERT INTO landing_page_images (id, "hackathonId", "fileName", "fileType", "fileSize", "base64Data")
        VALUES (${imageId}, ${resolvedParams.id}, ${file.name}, ${file.type}, ${file.size}, ${base64})
      `

      console.log('✅ Image saved successfully:', imageId)

      return NextResponse.json({
        success: true,
        message: 'تم رفع الصورة بنجاح',
        image: {
          id: imageId,
          name: file.name,
          type: 'image',
          url: imageUrl,
          dataUrl: dataUrl,
          size: file.size,
          uploadedAt: new Date().toISOString()
        }
      })

    } catch (dbError: any) {
      console.error('❌ Database save failed:', dbError)
      
      // إرجاع الصورة كـ base64 حتى لو فشل حفظها في قاعدة البيانات
      return NextResponse.json({
        success: true,
        message: 'تم رفع الصورة بنجاح (مؤقتاً)',
        image: {
          id: imageId,
          name: file.name,
          type: 'image',
          url: dataUrl, // استخدام base64 مباشرة
          dataUrl: dataUrl,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          temporary: true
        },
        warning: 'تم حفظ الصورة مؤقتاً، قد تحتاج لإعادة رفعها لاحقاً'
      })
    }

  } catch (error) {
    console.error('❌ Error uploading image:', error)
    return NextResponse.json({ error: 'خطأ في رفع الصورة' }, { status: 500 })
  }
}

// GET - جلب صورة محددة
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('imageId')

    if (!imageId) {
      return NextResponse.json({ error: 'معرف الصورة مطلوب' }, { status: 400 })
    }

    // جلب الصورة من قاعدة البيانات
    const images = await prisma.$queryRaw`
      SELECT * FROM landing_page_images 
      WHERE id = ${imageId} AND "hackathonId" = ${resolvedParams.id}
      LIMIT 1
    ` as any[]

    if (images.length === 0) {
      return NextResponse.json({ error: 'الصورة غير موجودة' }, { status: 404 })
    }

    const image = images[0]
    const base64Data = image.base64Data
    const buffer = Buffer.from(base64Data, 'base64')

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': image.fileType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    })

  } catch (error) {
    console.error('❌ Error fetching image:', error)
    return NextResponse.json({ error: 'خطأ في جلب الصورة' }, { status: 500 })
  }
}
