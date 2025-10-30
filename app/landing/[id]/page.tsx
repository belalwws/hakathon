import { notFound, redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface LandingPageProps {
  params: Promise<{ id: string }>
}

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

export async function generateMetadata({ params }: LandingPageProps) {
  const resolvedParams = await params
  const landingPage = await getLandingPage(resolvedParams.id)
  
  if (!landingPage) {
    return {
      title: 'صفحة غير موجودة',
      description: 'الصفحة المطلوبة غير موجودة'
    }
  }

  return {
    title: landingPage.seoTitle || landingPage.hackathon.title,
    description: landingPage.seoDescription || landingPage.hackathon.description,
    openGraph: {
      title: landingPage.seoTitle || landingPage.hackathon.title,
      description: landingPage.seoDescription || landingPage.hackathon.description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: landingPage.seoTitle || landingPage.hackathon.title,
      description: landingPage.seoDescription || landingPage.hackathon.description,
    }
  }
}

export default async function LandingPage({ params }: LandingPageProps) {
  const resolvedParams = await params

  // إعادة توجيه إلى صفحة HTML خالصة
  redirect(`/api/landing/${resolvedParams.id}`)
}
