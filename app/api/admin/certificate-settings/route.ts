import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CertificateSettings {
  namePositionY: number  // موضع عمودي (أعلى/أسفل)
  namePositionX: number  // موضع أفقي (يمين/شمال)
  nameFont: string
  nameColor: string
  certificateTemplate?: string  // مسار قالب الشهادة المخصص
  lastUpdated: string
  updatedBy: string
}

const defaultSettings: CertificateSettings = {
  namePositionY: 0.52,   // 52% من الارتفاع
  namePositionX: 0.50,   // 50% من العرض (وسط)
  nameFont: 'bold 48px Arial',
  nameColor: '#1a472a',
  lastUpdated: new Date().toISOString(),
  updatedBy: 'system'
}

// GET - جلب الإعدادات الحالية
export async function GET() {
  try {
    console.log('🔍 Fetching certificate settings...')
    
    // Try to get settings from database
    const settings = await prisma.$queryRaw`
      SELECT * FROM certificate_settings 
      WHERE id = 'global'
      LIMIT 1
    ` as any[]
    
    if (settings.length > 0) {
      const settingsData = JSON.parse(settings[0].settings || '{}')
      console.log('✅ Certificate settings loaded from database')
      return NextResponse.json({
        ...defaultSettings,
        ...settingsData,
        lastUpdated: settings[0].updatedAt?.toISOString() || new Date().toISOString()
      })
    }
    
    console.log('⚠️ No certificate settings found, returning defaults')
    return NextResponse.json(defaultSettings)
  } catch (error) {
    console.error('❌ Error fetching certificate settings:', error)
    // Return defaults if database fails
    return NextResponse.json(defaultSettings)
  }
}

// POST - حفظ إعدادات جديدة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { namePositionY, namePositionX, nameFont, nameColor, certificateTemplate, updatedBy } = body

    // التحقق من صحة البيانات
    if (typeof namePositionY !== 'number' || namePositionY < 0 || namePositionY > 1) {
      return NextResponse.json(
        { error: 'الموضع العمودي يجب أن يكون رقم بين 0 و 1' },
        { status: 400 }
      )
    }

    if (typeof namePositionX !== 'number' || namePositionX < 0 || namePositionX > 1) {
      return NextResponse.json(
        { error: 'الموضع الأفقي يجب أن يكون رقم بين 0 و 1' },
        { status: 400 }
      )
    }

    const newSettings: CertificateSettings = {
      namePositionY,
      namePositionX,
      nameFont: nameFont || defaultSettings.nameFont,
      nameColor: nameColor || defaultSettings.nameColor,
      certificateTemplate: certificateTemplate || undefined,
      lastUpdated: new Date().toISOString(),
      updatedBy: updatedBy || 'admin'
    }

    // حفظ الإعدادات في قاعدة البيانات
    try {
      // Create table if it doesn't exist (using TEXT instead of JSONB for better compatibility)
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS certificate_settings (
          id TEXT PRIMARY KEY,
          settings TEXT NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      
      // Save settings
      await prisma.$executeRaw`
        INSERT INTO certificate_settings (id, settings, "updatedAt")
        VALUES ('global', ${JSON.stringify(newSettings)}, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
        settings = ${JSON.stringify(newSettings)},
        "updatedAt" = CURRENT_TIMESTAMP
      `
      
      console.log('✅ Certificate settings saved successfully')
    } catch (dbError: any) {
      console.error('❌ Database save failed:', dbError?.message)
      
      // Fallback: try alternative approach
      try {
        console.log('🔄 Trying alternative database approach...')
        
        // Delete existing record first
        await prisma.$executeRaw`DELETE FROM certificate_settings WHERE id = 'global'`
        
        // Insert new record
        await prisma.$executeRaw`
          INSERT INTO certificate_settings (id, settings, "createdAt", "updatedAt")
          VALUES ('global', ${JSON.stringify(newSettings)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `
        
        console.log('✅ Certificate settings saved with alternative method')
      } catch (fallbackError: any) {
        console.error('❌ Fallback also failed:', fallbackError?.message)
        throw new Error('Failed to save certificate settings: ' + fallbackError?.message)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'تم حفظ إعدادات الشهادة بنجاح',
      settings: newSettings
    })

  } catch (error) {
    console.error('Error saving certificate settings:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في حفظ الإعدادات' },
      { status: 500 }
    )
  }
}
