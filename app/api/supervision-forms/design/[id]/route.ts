import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'

const prisma = new PrismaClient()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// GET - جلب تصميم فورم الإشراف
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hackathonId = params.id

    let design = await prisma.supervisionFormDesign.findUnique({
      where: { hackathonId },
    })

    // إذا لم يكن موجود، إنشاء تصميم افتراضي
    if (!design) {
      design = await prisma.supervisionFormDesign.create({
        data: {
          hackathonId,
          isEnabled: true,
          title: 'فورم الإشراف',
          description: 'نموذج طلب الانضمام لفريق الإشراف',
          welcomeMessage: 'مرحباً بك في فورم الإشراف',
          successMessage: 'تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً.',
          formFields: JSON.stringify([
            { id: 'name', label: 'الاسم الكامل', type: 'text', required: true },
            { id: 'email', label: 'البريد الإلكتروني', type: 'email', required: true },
            { id: 'phone', label: 'رقم الهاتف', type: 'tel', required: false },
          ]),
        },
      })
    }

    return NextResponse.json(design)
  } catch (error) {
    console.error('Error fetching supervision form design:', error)
    return NextResponse.json(
      { error: 'Failed to fetch form design' },
      { status: 500 }
    )
  }
}

// PUT - تحديث تصميم فورم الإشراف
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hackathonId = params.id
    const body = await request.json()

    // Handle cover image upload to Cloudinary
    if (body.coverImage && body.coverImage.startsWith('data:')) {
      try {
        const uploadResult = await cloudinary.uploader.upload(body.coverImage, {
          folder: `hackathons/${hackathonId}/supervision-forms`,
          transformation: [
            { width: 1200, height: 400, crop: 'fill' },
            { quality: 'auto' },
          ],
        })
        body.coverImage = uploadResult.secure_url
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError)
        // Continue without cover image if upload fails
        delete body.coverImage
      }
    }

    // Handle logo upload to Cloudinary
    if (body.logoUrl && body.logoUrl.startsWith('data:')) {
      try {
        const uploadResult = await cloudinary.uploader.upload(body.logoUrl, {
          folder: `hackathons/${hackathonId}/supervision-forms/logo`,
          transformation: [
            { width: 300, height: 300, crop: 'fit' },
            { quality: 'auto' },
          ],
        })
        body.logoUrl = uploadResult.secure_url
      } catch (uploadError) {
        console.error('Cloudinary logo upload error:', uploadError)
        delete body.logoUrl
      }
    }

    const design = await prisma.supervisionFormDesign.upsert({
      where: { hackathonId },
      update: body,
      create: {
        hackathonId,
        ...body,
      },
    })

    return NextResponse.json(design)
  } catch (error) {
    console.error('Error updating supervision form design:', error)
    return NextResponse.json(
      { error: 'Failed to update form design' },
      { status: 500 }
    )
  }
}

// DELETE - حذف تصميم فورم الإشراف
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hackathonId = params.id

    await prisma.supervisionFormDesign.delete({
      where: { hackathonId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting supervision form design:', error)
    return NextResponse.json(
      { error: 'Failed to delete form design' },
      { status: 500 }
    )
  }
}
