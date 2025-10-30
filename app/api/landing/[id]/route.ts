import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getLandingPage(hackathonId: string) {
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
    console.error('Error fetching landing page:', error)
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    console.log('🔄 Loading landing page for:', resolvedParams.id)

    const landingPage = await getLandingPage(resolvedParams.id)

    if (!landingPage) {
      console.log('❌ Landing page not found for:', resolvedParams.id)
      return new NextResponse('Landing page not found', { status: 404 })
    }

    console.log('✅ Landing page found:', {
      id: landingPage.id,
      enabled: landingPage.isEnabled,
      htmlLength: landingPage.htmlContent?.length || 0,
      template: landingPage.template,
      updatedAt: landingPage.updatedAt
    })

    // التحقق من نوع المحتوى
    let fullHtml;

    // إذا كان HTML يحتوي على DOCTYPE، استخدمه مباشرة
    if (landingPage.htmlContent.includes('<!DOCTYPE html>')) {
      console.log('✅ Using complete HTML from database');
      fullHtml = landingPage.htmlContent;
    } else {
      console.log('⚠️ Using legacy format, building HTML');
      // إنشاء HTML كامل للتنسيق القديم
      fullHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${landingPage.seoTitle || landingPage.hackathon.title}</title>
    <meta name="description" content="${landingPage.seoDescription || landingPage.hackathon.description}">

    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${landingPage.seoTitle || landingPage.hackathon.title}">
    <meta property="og:description" content="${landingPage.seoDescription || landingPage.hackathon.description}">
    <meta property="og:type" content="website">

    <!-- Twitter Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${landingPage.seoTitle || landingPage.hackathon.title}">
    <meta name="twitter:description" content="${landingPage.seoDescription || landingPage.hackathon.description}">

    <!-- External Libraries -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">

    <!-- Base CSS Reset -->
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Cairo', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            direction: rtl;
            text-align: right;
        }

        html, body {
            height: 100%;
            width: 100%;
        }

        /* Default styles for common elements */
        h1, h2, h3, h4, h5, h6 {
            margin-bottom: 1rem;
            font-weight: 600;
        }

        p {
            margin-bottom: 1rem;
        }

        button {
            cursor: pointer;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: inherit;
        }

        a {
            text-decoration: none;
            color: inherit;
        }

        img {
            max-width: 100%;
            height: auto;
        }

        /* Custom CSS from admin */
        ${landingPage.cssContent || ''}
    </style>
</head>
<body>
    ${landingPage.htmlContent}

    <!-- Custom JavaScript -->
    <script>
        // Helper functions for registration
        function register() {
            window.location.href = '/hackathons/${resolvedParams.id}/register-form';
        }

        function goToHackathon() {
            window.location.href = '/hackathons/${resolvedParams.id}';
        }

        // Custom JavaScript from admin
        ${landingPage.jsContent}

        // Track landing page views
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: '${landingPage.hackathon.title} - Landing Page',
                page_location: window.location.href
            });
        }
    </script>
</body>
</html>`;
    }

    // إرجاع HTML مع Content-Type صحيح
    return new NextResponse(fullHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate', // لا cache للتطوير
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })

  } catch (error) {
    console.error('Error serving landing page:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
