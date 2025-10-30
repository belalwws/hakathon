import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/upload-presentation/verify?token=xxx - التحقق من صحة الـ token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'الرابط غير صحيح' }, { status: 400 })
    }

    console.log('🔍 [verify-token] Verifying token:', token)

    // البحث عن الـ token
    const uploadToken = await prisma.uploadToken.findUnique({
      where: { token },
      include: {
        participant: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        team: {
          select: {
            id: true,
            name: true,
            ideaFile: true,
            ideaTitle: true,
            ideaDescription: true
          }
        },
        hackathon: {
          select: {
            id: true,
            title: true,
            description: true
          }
        }
      }
    })

    if (!uploadToken) {
      console.log('❌ [verify-token] Token not found')
      return NextResponse.json({ error: 'الرابط غير صحيح' }, { status: 404 })
    }

    // التحقق من انتهاء صلاحية الـ token
    if (new Date() > uploadToken.expiresAt) {
      console.log('❌ [verify-token] Token expired')
      return NextResponse.json({ error: 'انتهت صلاحية الرابط' }, { status: 410 })
    }

    // التحقق من استخدام الـ token
    if (uploadToken.used) {
      console.log('⚠️ [verify-token] Token already used')
      return NextResponse.json({ 
        error: 'تم استخدام هذا الرابط من قبل',
        alreadyUploaded: true,
        team: uploadToken.team
      }, { status: 409 })
    }

    console.log('✅ [verify-token] Token is valid')

    return NextResponse.json({
      valid: true,
      participant: {
        name: uploadToken.participant.user.name,
        email: uploadToken.participant.user.email
      },
      team: {
        id: uploadToken.team.id,
        name: uploadToken.team.name,
        hasUpload: !!uploadToken.team.ideaFile
      },
      hackathon: {
        id: uploadToken.hackathon.id,
        title: uploadToken.hackathon.title,
        description: uploadToken.hackathon.description
      },
      expiresAt: uploadToken.expiresAt
    })

  } catch (error) {
    console.error('❌ [verify-token] Error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في التحقق من الرابط' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'

