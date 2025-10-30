import type React from "react"

export default function InvitationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* No AuthProvider wrapper - this is a public page */}
      {children}
    </div>
  )
}
