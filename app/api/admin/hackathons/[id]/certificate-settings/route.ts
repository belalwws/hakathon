import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/hackathons/[id]/certificate-settings - Get certificate settings for specific hackathon
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId } = params
    
    // Get certificate type from query params
    const { searchParams } = new URL(request.url)
    const certificateType = searchParams.get('type') || 'participant'

    // Check if hackathon exists and get certificate template
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: {
        id: true,
        title: true,
        certificateTemplate: true
      }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Try to get existing certificate settings for this hackathon and type
    const settingsKey = `certificate_settings_${hackathonId}_${certificateType}`
    let settingsRecord = null
    
    try {
      settingsRecord = await prisma.globalSettings.findUnique({
        where: { key: settingsKey }
      })
    } catch (dbError) {
      console.log('Certificate settings might not exist, using defaults')
    }

    if (!settingsRecord || !settingsRecord.value) {
      // Return default settings if none exist
      return NextResponse.json({
        namePositionY: 0.52,
        namePositionX: 0.50,
        nameFont: 'bold 48px Arial',
        nameColor: '#1a472a',
        hackathonId: hackathonId,
        certificateTemplate: null
      })
    }

    const parsedSettings = typeof settingsRecord.value === 'string' 
      ? JSON.parse(settingsRecord.value as string)
      : settingsRecord.value

    return NextResponse.json({
      namePositionY: parsedSettings.namePositionY || 0.52,
      namePositionX: parsedSettings.namePositionX || 0.50,
      nameFont: parsedSettings.nameFont || 'bold 48px Arial',
      nameColor: parsedSettings.nameColor || '#1a472a',
      hackathonId: hackathonId,
      certificateTemplate: parsedSettings.certificateTemplate || null
    })

  } catch (error) {
    console.error('Error loading certificate settings:', error)
    return NextResponse.json({ error: 'خطأ في تحميل إعدادات الشهادة' }, { status: 500 })
  }
}

// POST /api/admin/hackathons/[id]/certificate-settings - Save certificate settings for specific hackathon
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId } = params
    const body = await request.json()

    console.log('📦 Received certificate settings save request:', {
      hackathonId,
      body
    })

    // Check if hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    const {
      namePositionY,
      namePositionX,
      nameFont,
      nameColor,
      certificateTemplate,
      type,
      updatedBy
    } = body

    const certificateType = type || 'participant'

    console.log('🔍 Extracted data:', {
      certificateType,
      certificateTemplate,
      namePositionY,
      namePositionX
    })

    // Validate required fields
    if (namePositionY === undefined || namePositionX === undefined || !nameFont || !nameColor) {
      console.log('❌ Validation failed: missing required fields')
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
    }

    const settingsData = {
      namePositionY: parseFloat(namePositionY),
      namePositionX: parseFloat(namePositionX),
      nameFont,
      nameColor,
      certificateTemplate,
      hackathonId,
      certificateType,
      lastUpdated: new Date().toISOString(),
      updatedBy: updatedBy || 'admin'
    }

    // Save settings to database using unique key per hackathon and certificate type
    const settingsKey = `certificate_settings_${hackathonId}_${certificateType}`

    console.log('💾 Saving to database with key:', settingsKey)
    console.log('📄 Settings data:', JSON.stringify(settingsData, null, 2))

    try {
      const result = await prisma.globalSettings.upsert({
        where: { key: settingsKey },
        update: {
          value: settingsData,
          updatedAt: new Date()
        },
        create: {
          key: settingsKey,
          value: settingsData,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log('✅ Database upsert successful:', result)
    } catch (upsertError) {
      console.error('❌ Error upserting certificate settings:', upsertError)
      return NextResponse.json({ error: 'خطأ في حفظ إعدادات الشهادة' }, { status: 500 })
    }

    console.log(`✅ Certificate settings saved for hackathon: ${hackathonId}, type: ${certificateType}`)

    return NextResponse.json({
      message: 'تم حفظ إعدادات الشهادة بنجاح',
      settings: settingsData,
      key: settingsKey
    })

  } catch (error) {
    console.error('Error saving certificate settings:', error)
    return NextResponse.json({ error: 'خطأ في حفظ إعدادات الشهادة' }, { status: 500 })
  }
}
