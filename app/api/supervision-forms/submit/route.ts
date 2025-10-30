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

// POST - إرسال نموذج الإشراف
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hackathonId, formId, name, email, phone, formData, attachments } = body

    // التحقق من البيانات المطلوبة
    if (!hackathonId || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // معالجة المرفقات (رفع على Cloudinary)
    let uploadedAttachments: any[] = []
    if (attachments && Array.isArray(attachments)) {
      for (const attachment of attachments) {
        if (attachment.data && attachment.data.startsWith('data:')) {
          try {
            const uploadResult = await cloudinary.uploader.upload(attachment.data, {
              folder: `hackathons/${hackathonId}/supervision-submissions`,
              resource_type: 'auto',
              transformation: attachment.type?.startsWith('image/')
                ? [{ quality: 'auto' }, { fetch_format: 'auto' }]
                : undefined,
            })

            uploadedAttachments.push({
              name: attachment.name,
              type: attachment.type,
              url: uploadResult.secure_url,
              publicId: uploadResult.public_id,
            })
          } catch (uploadError) {
            console.error('Cloudinary upload error:', uploadError)
          }
        }
      }
    }

    // إنشاء الطلب
    const submission = await prisma.supervisionFormSubmission.create({
      data: {
        hackathonId,
        formId: formId || hackathonId,
        name,
        email,
        phone,
        formData: JSON.stringify(formData),
        attachments: JSON.stringify(uploadedAttachments),
        status: 'pending',
      },
    })

    return NextResponse.json({
      success: true,
      submission,
      message: 'تم إرسال طلبك بنجاح!',
    })
  } catch (error) {
    console.error('Error submitting supervision form:', error)
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    )
  }
}

// GET - جلب جميع الطلبات (للإدارة)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hackathonId = searchParams.get('hackathonId')
    const status = searchParams.get('status')

    const where: any = {}
    if (hackathonId) where.hackathonId = hackathonId
    if (status) where.status = status

    const submissions = await prisma.supervisionFormSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(submissions)
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}
