import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/judge-form-design/[hackathonId] - Get form design
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params

    const design = await prisma.judgeFormDesign.findUnique({
      where: { hackathonId: params.hackathonId }
    })

    if (!design) {
      // Return default design
      return NextResponse.json({
        design: {
          hackathonId: params.hackathonId,
          isEnabled: true,
          primaryColor: '#01645e',
          secondaryColor: '#3ab666',
          accentColor: '#c3e956',
          backgroundColor: '#ffffff',
          title: 'نموذج التقديم كمحكم',
          description: 'املأ النموذج للتقديم كمحكم في الهاكاثون'
        }
      })
    }

    return NextResponse.json({ design })

  } catch (error) {
    console.error('❌ Error fetching form design:', error)
    return NextResponse.json({ error: 'خطأ في جلب تصميم النموذج' }, { status: 500 })
  }
}

// POST /api/admin/judge-form-design/[hackathonId] - Create or update form design
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const formData = await request.formData()
    
    const isEnabled = formData.get('isEnabled') === 'true'
    const coverImage = formData.get('coverImage') as File | null
    const primaryColor = formData.get('primaryColor') as string
    const secondaryColor = formData.get('secondaryColor') as string
    const accentColor = formData.get('accentColor') as string
    const backgroundColor = formData.get('backgroundColor') as string
    const title = formData.get('title') as string | null
    const description = formData.get('description') as string | null
    const welcomeMessage = formData.get('welcomeMessage') as string | null
    const successMessage = formData.get('successMessage') as string | null
    const logoUrl = formData.get('logoUrl') as string | null
    const customCss = formData.get('customCss') as string | null

    console.log('🎨 Updating form design for hackathon:', params.hackathonId)

    // Handle cover image upload
    let coverImageUrl: string | null = null
    if (coverImage && coverImage.size > 0) {
      const bytes = await coverImage.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      const mimeType = coverImage.type
      coverImageUrl = `data:${mimeType};base64,${base64}`
      console.log('📸 Cover image uploaded:', coverImage.name)
    }

    // Upsert design
    const design = await prisma.judgeFormDesign.upsert({
      where: { hackathonId: params.hackathonId },
      update: {
        isEnabled,
        coverImage: coverImageUrl || undefined,
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        title,
        description,
        welcomeMessage,
        successMessage,
        logoUrl,
        customCss
      },
      create: {
        hackathonId: params.hackathonId,
        isEnabled,
        coverImage: coverImageUrl,
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        title,
        description,
        welcomeMessage,
        successMessage,
        logoUrl,
        customCss
      }
    })

    console.log('✅ Form design updated successfully')

    return NextResponse.json({
      message: 'تم تحديث تصميم النموذج بنجاح',
      design
    })

  } catch (error) {
    console.error('❌ Error updating form design:', error)
    return NextResponse.json({
      error: 'خطأ في تحديث تصميم النموذج',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

