import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { LanguageProvider } from "@/contexts/language-context"
import { ConditionalHeader } from "@/components/conditional-header"
import { HeartbeatTracker } from "@/components/heartbeat-tracker"
import { ScrollProgress } from "@/components/scroll-progress"
import { MagneticCursor } from "@/components/magnetic-cursor"
import { CookieConsent } from "@/components/cookie-consent"
import { GoogleAnalytics } from "@/lib/analytics"

export const metadata: Metadata = {
  title: "هاكاثون الابتكار التقني",
  description: "منصة متكاملة لإدارة وتنظيم الهاكاثونات التقنية",
  generator: "v0.app",
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="font-sans">
        <GoogleAnalytics />
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <ScrollProgress />
              <MagneticCursor />
              <HeartbeatTracker />
              <ConditionalHeader />
              {children}
              <CookieConsent />
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
