import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface FileItem {
  id: string
  name: string
  type: 'html' | 'css' | 'js' | 'json'
  content: string
  isMain?: boolean
}

async function getLandingPagePro(hackathonId: string) {
  try {
    const landingPage = await prisma.hackathonLandingPage.findUnique({
      where: { 
        hackathonId: hackathonId,
        isEnabled: true
      },
      include: {
        hackathon: true
      }
    })

    return landingPage
  } catch (error) {
    console.error('Error fetching pro landing page:', error)
    return null
  }
}

function processFiles(files: FileItem[], hackathon: any, hackathonId: string): string {
  // Find main HTML file
  const mainHtmlFile = files.find(f => f.isMain)
  if (!mainHtmlFile) {
    return '<html><body><h1>No main HTML file found</h1></body></html>'
  }

  let processedHtml = mainHtmlFile.content

  // Replace template variables
  processedHtml = processedHtml
    .replace(/{{HACKATHON_TITLE}}/g, hackathon?.title || 'هاكاثون')
    .replace(/{{HACKATHON_DESCRIPTION}}/g, hackathon?.description || 'انضم إلينا في رحلة الإبداع والابتكار')
    .replace(/{{HACKATHON_ID}}/g, hackathonId)
    .replace(/{{REGISTRATION_URL}}/g, `/hackathons/${hackathonId}/register-form`)

  // Process CSS files
  const cssFiles = files.filter(f => f.type === 'css')
  cssFiles.forEach(cssFile => {
    // Replace CSS file references with inline styles
    const cssLinkRegex = new RegExp(`<link[^>]*href=["']${cssFile.name}["'][^>]*>`, 'gi')
    processedHtml = processedHtml.replace(cssLinkRegex, `<style>${cssFile.content}</style>`)
    
    // Also handle href without quotes
    const cssLinkRegex2 = new RegExp(`<link[^>]*href=${cssFile.name}[^>]*>`, 'gi')
    processedHtml = processedHtml.replace(cssLinkRegex2, `<style>${cssFile.content}</style>`)
  })

  // Process JS files
  const jsFiles = files.filter(f => f.type === 'js')
  jsFiles.forEach(jsFile => {
    // Replace JS file references with inline scripts
    const jsScriptRegex = new RegExp(`<script[^>]*src=["']${jsFile.name}["'][^>]*></script>`, 'gi')
    processedHtml = processedHtml.replace(jsScriptRegex, `<script>${jsFile.content}</script>`)
    
    // Also handle src without quotes
    const jsScriptRegex2 = new RegExp(`<script[^>]*src=${jsFile.name}[^>]*></script>`, 'gi')
    processedHtml = processedHtml.replace(jsScriptRegex2, `<script>${jsFile.content}</script>`)
  })

  // Add registration helper functions if not present
  if (!processedHtml.includes('registerNow') && !processedHtml.includes('function registerNow')) {
    const helperScript = `
    <script>
      // دوال مساعدة للتسجيل
      function registerNow() {
        window.location.href = '/hackathons/${hackathonId}/register-form';
      }
      
      function openRegistrationModal() {
        const modal = window.open(
          '/hackathons/${hackathonId}/register-form',
          'registration',
          'width=800,height=600,scrollbars=yes,resizable=yes'
        );
      }
      
      function checkRegistrationStatus() {
        const registered = localStorage.getItem('hackathon_registered_${hackathonId}');
        return registered === 'true';
      }
    </script>
    `
    
    // Insert before closing body tag
    processedHtml = processedHtml.replace('</body>', helperScript + '</body>')
  }

  return processedHtml
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    console.log('🔄 Loading pro landing page for:', resolvedParams.id)

    const landingPage = await getLandingPagePro(resolvedParams.id)

    if (!landingPage) {
      console.log('❌ Pro landing page not found for:', resolvedParams.id)
      return new NextResponse(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>الصفحة غير موجودة</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              direction: rtl;
            }
          </style>
        </head>
        <body>
          <h1>الصفحة غير موجودة</h1>
          <p>لم يتم العثور على صفحة الهبوط لهذا الهاكاثون أو أنها غير مفعلة.</p>
        </body>
        </html>
      `, { 
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      })
    }

    console.log('✅ Pro landing page found:', {
      id: landingPage.id,
      enabled: landingPage.isEnabled,
      template: landingPage.template,
      updatedAt: landingPage.updatedAt
    })

    // Parse files from stored data
    let files: FileItem[] = []
    try {
      if (landingPage.htmlContent && landingPage.htmlContent.startsWith('[')) {
        files = JSON.parse(landingPage.htmlContent)
      } else {
        // Fallback to old format
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
      return new NextResponse('Error parsing landing page files', { status: 500 })
    }

    if (files.length === 0) {
      return new NextResponse('No files found in landing page', { status: 404 })
    }

    // Process and combine all files
    const finalHtml = processFiles(files, landingPage.hackathon, resolvedParams.id)

    // إرجاع HTML مع Content-Type صحيح
    return new NextResponse(finalHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })

  } catch (error) {
    console.error('❌ Error loading pro landing page:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
