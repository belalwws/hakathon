import type React from "react"
import type { Metadata } from "next"
import "../globals.css"

export const metadata: Metadata = {
  title: "دعوة مشرف - هاكاثون الابتكار التقني",
  description: "صفحة قبول دعوة المشرف",
}

export default function InvitationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-sans">
        {/* No AuthProvider - this is completely public */}
        {children}
      </body>
    </html>
  )
}
