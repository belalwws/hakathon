'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'

export function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return

    const url = pathname + searchParams.toString()
    
    // Page view
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }, [pathname, searchParams])

  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return null

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <script
        id="google-analytics"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}

// Analytics helper functions
export const analytics = {
  // Track page views
  pageView: (url: string) => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
      })
    }
  },

  // Track events
  event: ({
    action,
    category,
    label,
    value,
  }: {
    action: string
    category: string
    label?: string
    value?: number
  }) => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      })
    }
  },

  // Track button clicks
  trackButtonClick: (buttonName: string, location: string) => {
    analytics.event({
      action: 'click',
      category: 'button',
      label: `${buttonName} - ${location}`,
    })
  },

  // Track form submissions
  trackFormSubmit: (formName: string, success: boolean) => {
    analytics.event({
      action: success ? 'submit_success' : 'submit_error',
      category: 'form',
      label: formName,
    })
  },

  // Track link clicks
  trackLinkClick: (linkUrl: string, linkText: string) => {
    analytics.event({
      action: 'click',
      category: 'link',
      label: `${linkText} -> ${linkUrl}`,
    })
  },

  // Track scroll depth
  trackScrollDepth: (percentage: number) => {
    analytics.event({
      action: 'scroll',
      category: 'engagement',
      label: `${percentage}%`,
      value: percentage,
    })
  },

  // Track video play
  trackVideoPlay: (videoTitle: string) => {
    analytics.event({
      action: 'play',
      category: 'video',
      label: videoTitle,
    })
  },

  // Track downloads
  trackDownload: (fileName: string) => {
    analytics.event({
      action: 'download',
      category: 'file',
      label: fileName,
    })
  },

  // Track search
  trackSearch: (searchTerm: string, resultsCount: number) => {
    analytics.event({
      action: 'search',
      category: 'search',
      label: searchTerm,
      value: resultsCount,
    })
  },

  // Track user signup
  trackSignup: (method: string) => {
    analytics.event({
      action: 'signup',
      category: 'user',
      label: method,
    })
  },

  // Track user login
  trackLogin: (method: string) => {
    analytics.event({
      action: 'login',
      category: 'user',
      label: method,
    })
  },

  // Track errors
  trackError: (errorMessage: string, errorLocation: string) => {
    analytics.event({
      action: 'error',
      category: 'error',
      label: `${errorLocation}: ${errorMessage}`,
    })
  },

  // Track timing
  trackTiming: (category: string, variable: string, value: number, label?: string) => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'timing_complete', {
        name: variable,
        value: value,
        event_category: category,
        event_label: label,
      })
    }
  }
}

// Custom hook for tracking
export function useAnalytics() {
  return analytics
}
