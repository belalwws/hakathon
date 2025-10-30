import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Auto-create table if it doesn't exist
async function ensureLandingPagesTable() {
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS hackathon_landing_pages (
        id TEXT PRIMARY KEY,
        hackathon_id TEXT UNIQUE NOT NULL,
        is_enabled BOOLEAN DEFAULT FALSE,
        custom_domain TEXT,
        html_content TEXT NOT NULL DEFAULT '',
        css_content TEXT NOT NULL DEFAULT '',
        js_content TEXT NOT NULL DEFAULT '',
        seo_title TEXT,
        seo_description TEXT,
        template TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hackathon_id) REFERENCES hackathons(id) ON DELETE CASCADE
      )
    `
    console.log('✅ Landing pages table ensured')
  } catch (error) {
    console.log('ℹ️ Landing pages table already exists or error:', error)
  }
}

// GET - جلب بيانات Landing Page
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure table exists
    await ensureLandingPagesTable()
    const landingPage = await prisma.hackathonLandingPage.findUnique({
      where: { hackathonId: params.id }
    })

    if (!landingPage) {
      return NextResponse.json({
        hackathonId: params.id,
        isEnabled: false,
        htmlContent: '',
        cssContent: '',
        jsContent: '',
        template: 'blank'
      })
    }

    return NextResponse.json(landingPage)
  } catch (error) {
    console.error('Error fetching landing page:', error)
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 })
  }
}

// POST - حفظ أو تحديث Landing Page
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure table exists
    await ensureLandingPagesTable()
    const data = await request.json()

    console.log('💾 Saving landing page for hackathon:', params.id)
    console.log('📝 Data received:', {
      htmlLength: data.htmlContent?.length || 0,
      cssLength: data.cssContent?.length || 0,
      jsLength: data.jsContent?.length || 0,
      isEnabled: data.isEnabled,
      template: data.template
    })

    // التحقق من وجود الهاكاثون
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // حفظ أو تحديث Landing Page
    const landingPage = await prisma.hackathonLandingPage.upsert({
      where: { hackathonId: params.id },
      update: {
        isEnabled: data.isEnabled,
        customDomain: data.customDomain,
        htmlContent: data.htmlContent,
        cssContent: data.cssContent,
        jsContent: data.jsContent,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        template: data.template,
        updatedAt: new Date()
      },
      create: {
        hackathonId: params.id,
        isEnabled: data.isEnabled,
        customDomain: data.customDomain,
        htmlContent: data.htmlContent,
        cssContent: data.cssContent,
        jsContent: data.jsContent,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        template: data.template
      }
    })

    console.log('✅ Landing page saved successfully:', {
      id: landingPage.id,
      htmlLength: landingPage.htmlContent?.length || 0,
      updatedAt: landingPage.updatedAt
    })

    return NextResponse.json({
      success: true,
      message: 'تم حفظ Landing Page بنجاح',
      landingPage
    })

  } catch (error) {
    console.error('Error saving landing page:', error)
    return NextResponse.json({ error: 'خطأ في حفظ البيانات' }, { status: 500 })
  }
}

// DELETE - حذف Landing Page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.hackathonLandingPage.delete({
      where: { hackathonId: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف Landing Page بنجاح'
    })

  } catch (error) {
    console.error('Error deleting landing page:', error)
    return NextResponse.json({ error: 'خطأ في حذف البيانات' }, { status: 500 })
  }
}
