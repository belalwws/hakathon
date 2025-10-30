import { Metadata } from 'next'

interface SEOProps {
  title: string
  description: string
  keywords?: string
  ogImage?: string
  ogType?: string
  canonicalUrl?: string
}

export function generateMetadata({
  title,
  description,
  keywords,
  ogImage = '/og-image.png',
  ogType = 'website',
  canonicalUrl
}: SEOProps): Metadata {
  const siteName = 'HackPro'
  const fullTitle = title === siteName ? siteName : `${title} | ${siteName}`
  
  return {
    title: fullTitle,
    description,
    keywords: keywords || 'hackathon, competition, tech events, coding, programming',
    authors: [{ name: 'HackPro Team' }],
    creator: 'HackPro',
    publisher: 'HackPro',
    openGraph: {
      type: ogType as any,
      locale: 'ar_EG',
      alternateLocale: 'en_US',
      url: canonicalUrl,
      title: fullTitle,
      description,
      siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
      creator: '@hackpro'
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    alternates: {
      canonical: canonicalUrl
    }
  }
}

// Structured data generator
export function generateStructuredData(type: 'organization' | 'website' | 'article', data: any) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hackpro.com'
  
  const schemas: Record<string, any> = {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'HackPro',
      description: 'Professional hackathon management platform',
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      sameAs: [
        'https://twitter.com/hackpro',
        'https://linkedin.com/company/hackpro',
        'https://github.com/hackpro'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-555-123-4567',
        contactType: 'customer service',
        email: 'info@hackpro.com',
        availableLanguage: ['English', 'Arabic']
      }
    },
    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'HackPro',
      url: baseUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${baseUrl}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    },
    article: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.title,
      description: data.description,
      image: data.image,
      datePublished: data.publishedDate,
      dateModified: data.modifiedDate,
      author: {
        '@type': 'Person',
        name: data.author
      },
      publisher: {
        '@type': 'Organization',
        name: 'HackPro',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`
        }
      }
    }
  }

  return JSON.stringify(schemas[type])
}
