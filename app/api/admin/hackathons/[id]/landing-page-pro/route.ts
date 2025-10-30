import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface FileItem {
  id: string
  name: string
  type: 'html' | 'css' | 'js' | 'json' | 'image'
  content: string
  isMain?: boolean
  url?: string
  size?: number
  savedAt?: string
  processed?: boolean
}

interface LandingPageProData {
  hackathonId: string
  isEnabled: boolean
  files: FileItem[]
  settings: {
    title?: string
    description?: string
    customDomain?: string
    seoTitle?: string
    seoDescription?: string
  }
}

// GET - جلب بيانات Landing Page Pro
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    console.log('🔍 Fetching pro landing page for hackathon:', resolvedParams.id)

    const landingPage = await prisma.hackathonLandingPage.findUnique({
      where: { hackathonId: resolvedParams.id }
    })

    if (!landingPage) {
      return NextResponse.json({
        hackathonId: resolvedParams.id,
        isEnabled: false,
        files: [],
        settings: {}
      })
    }

    // Parse files from stored data
    let files: FileItem[] = []
    try {
      // Try to parse from new format first
      if (landingPage.htmlContent && landingPage.htmlContent.startsWith('[')) {
        files = JSON.parse(landingPage.htmlContent)
      } else {
        // Convert from old format
        files = [
          {
            id: 'main-html',
            name: 'index.html',
            type: 'html',
            content: landingPage.htmlContent || '',
            isMain: true
          }
        ]
        
        if (landingPage.cssContent) {
          files.push({
            id: 'main-css',
            name: 'styles.css',
            type: 'css',
            content: landingPage.cssContent
          })
        }
        
        if (landingPage.jsContent) {
          files.push({
            id: 'main-js',
            name: 'script.js',
            type: 'js',
            content: landingPage.jsContent
          })
        }
      }
    } catch (error) {
      console.error('Error parsing files:', error)
      files = []
    }

    const settings = {
      title: landingPage.seoTitle,
      description: landingPage.seoDescription,
      customDomain: landingPage.customDomain
    }

    return NextResponse.json({
      hackathonId: resolvedParams.id,
      isEnabled: landingPage.isEnabled,
      files,
      settings
    })

  } catch (error) {
    console.error('❌ Error fetching pro landing page:', error)
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 })
  }
}

// POST - حفظ أو تحديث Landing Page Pro
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const data: LandingPageProData = await request.json()

    console.log('💾 Saving pro landing page for hackathon:', resolvedParams.id)
    console.log('📝 Data received:', {
      filesCount: data.files?.length || 0,
      isEnabled: data.isEnabled,
      settings: data.settings,
      imageFiles: data.files?.filter(f => f.type === 'image').length || 0
    })

    // التحقق من وجود الهاكاثون
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // معالجة الصور وحفظها
    const processedFiles = await Promise.all(
      (data.files || []).map(async (file: any) => {
        if (file.type === 'image') {
          console.log(`🖼️ Processing image: ${file.name} (${((file.size || 0) / 1024).toFixed(1)} KB)`)

          // التحقق من أن المحتوى صالح
          if (file.content && (file.content.startsWith('data:image/') || file.content.startsWith('http'))) {
            return {
              ...file,
              url: file.content, // استخدام base64 أو URL مباشرة
              savedAt: new Date().toISOString(),
              processed: true
            }
          } else if (file.url) {
            // إذا كان هناك URL موجود مسبقاً
            return {
              ...file,
              processed: true
            }
          } else {
            console.warn(`⚠️ Invalid image content for: ${file.name}`)
            return file
          }
        }
        return file
      })
    )

    console.log(`✅ Processed ${processedFiles.filter(f => f.type === 'image').length} images`)

    // Store files as JSON in htmlContent field
    const filesJson = JSON.stringify(processedFiles)
    
    // Extract main HTML file for backward compatibility
    const mainHtmlFile = processedFiles?.find(f => f.isMain)
    const mainCssFile = processedFiles?.find(f => f.type === 'css')
    const mainJsFile = processedFiles?.find(f => f.type === 'js')

    // حفظ أو تحديث Landing Page
    const landingPage = await prisma.hackathonLandingPage.upsert({
      where: { hackathonId: resolvedParams.id },
      update: {
        isEnabled: data.isEnabled,
        customDomain: data.settings?.customDomain,
        htmlContent: filesJson, // Store all files as JSON
        cssContent: mainCssFile?.content || '', // Keep for backward compatibility
        jsContent: mainJsFile?.content || '', // Keep for backward compatibility
        seoTitle: data.settings?.seoTitle,
        seoDescription: data.settings?.seoDescription,
        template: 'pro',
        updatedAt: new Date()
      },
      create: {
        hackathonId: resolvedParams.id,
        isEnabled: data.isEnabled,
        customDomain: data.settings?.customDomain,
        htmlContent: filesJson,
        cssContent: mainCssFile?.content || '',
        jsContent: mainJsFile?.content || '',
        seoTitle: data.settings?.seoTitle,
        seoDescription: data.settings?.seoDescription,
        template: 'pro'
      }
    })

    const imageCount = processedFiles.filter(f => f.type === 'image').length

    console.log('✅ Pro landing page saved successfully:', {
      id: landingPage.id,
      filesCount: processedFiles.length,
      imageCount: imageCount
    })

    return NextResponse.json({
      success: true,
      message: `تم حفظ ${processedFiles.length} ملف بنجاح${imageCount > 0 ? ` (${imageCount} صورة)` : ''}`,
      landingPage: {
        id: landingPage.id,
        hackathonId: landingPage.hackathonId,
        isEnabled: landingPage.isEnabled,
        files: processedFiles,
        settings: data.settings
      },
      stats: {
        totalFiles: processedFiles.length,
        imageFiles: imageCount,
        codeFiles: processedFiles.filter(f => f.type !== 'image').length
      }
    })

  } catch (error) {
    console.error('❌ Error saving pro landing page:', error)
    return NextResponse.json({ error: 'خطأ في حفظ البيانات' }, { status: 500 })
  }
}

// DELETE - حذف Landing Page Pro
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    console.log('🗑️ Deleting pro landing page for hackathon:', resolvedParams.id)

    await prisma.hackathonLandingPage.delete({
      where: { hackathonId: resolvedParams.id }
    })

    console.log('✅ Pro landing page deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'تم حذف الصفحة بنجاح'
    })

  } catch (error) {
    console.error('❌ Error deleting pro landing page:', error)
    return NextResponse.json({ error: 'خطأ في حذف البيانات' }, { status: 500 })
  }
}
