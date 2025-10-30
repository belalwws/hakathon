"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ErrorBoundary from "@/components/ErrorBoundary"
import { HeartbeatTracker } from "@/components/heartbeat-tracker"
import {
  Trophy,
  BarChart3,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Settings,
  FileText,
  ClipboardList,
  Award,
  Mail,
  Users,
  Gavel,
  Send
} from "lucide-react"

const sidebarItems = [
  {
    title: "الرئيسية",
    href: "/supervisor/dashboard",
    icon: Home,
    description: "لوحة التحكم الرئيسية"
  },
  {
    title: "الهاكاثونات",
    href: "/supervisor/hackathons",
    icon: Trophy,
    description: "إدارة الهاكاثونات المسندة"
  },
  {
    title: "العروض التقديمية",
    href: "/supervisor/presentations",
    icon: FileText,
    description: "متابعة وإرسال روابط العروض",
    badge: "جديد"
  },
  {
    title: "الفورمات",
    href: "/supervisor/forms",
    icon: ClipboardList,
    description: "نماذج التسجيل"
  },
  {
    title: "الشهادات",
    href: "/supervisor/certificates",
    icon: Award,
    description: "إصدار الشهادات"
  },
  {
    title: "إدارة الإيميلات",
    href: "/supervisor/email-management",
    icon: Mail,
    description: "قوالب الإيميلات التلقائية"
  },
  {
    title: "إيميل مخصص",
    href: "/supervisor/custom-email",
    icon: Send,
    description: "إرسال إيميلات مخصصة",
    badge: "جديد"
  },
  {
    title: "الخبراء",
    href: "/supervisor/experts",
    icon: Users,
    description: "إدارة الخبراء والدعوات"
  },
  {
    title: "المحكمين",
    href: "/supervisor/judges",
    icon: Gavel,
    description: "إدارة المحكمين والدعوات"
  },
  {
    title: "التقارير",
    href: "/supervisor/reports",
    icon: BarChart3,
    description: "التقارير والإحصائيات"
  },
  {
    title: "الملف الشخصي",
    href: "/supervisor/profile",
    icon: User,
    description: "إعدادات الحساب"
  }
]

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout, loading, refreshUser } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [allowAccess, setAllowAccess] = useState(false)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔍 [SupervisorLayout] Auth state - loading:', loading, 'user:', user?.email, 'role:', user?.role)

    // Don't redirect if still loading
    if (loading) {
      console.log('⏳ [SupervisorLayout] Still loading, waiting...')
      return
    }

    // If no user, check localStorage as fallback
    if (!user) {
      console.log('🔄 [SupervisorLayout] No user found, checking localStorage...')

      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('auth-user')
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser)
            if (userData.role === 'supervisor') {
              console.log('✅ [SupervisorLayout] Found supervisor in localStorage, allowing access')
              setAllowAccess(true)
              setProfilePicture(userData.profilePicture || null)
              return // Don't redirect, user is valid
            }
          } catch (e) {
            console.log('❌ [SupervisorLayout] Invalid localStorage data')
          }
        }
      }

      // If no valid user found, redirect after a delay
      const timer = setTimeout(() => {
        console.log('🔀 [SupervisorLayout] Redirecting to login - no valid user found')
        router.push("/login?redirect=/supervisor/dashboard")
      }, 1000) // Give more time for auth to load

      return () => clearTimeout(timer)
    }

    // If user exists but wrong role
    if (user.role !== "supervisor") {
      console.log('🔀 [SupervisorLayout] Wrong role, redirecting to login')
      router.push("/login?redirect=/supervisor/dashboard")
      return
    }

    console.log('✅ [SupervisorLayout] User authenticated as supervisor:', user.email)
    setAllowAccess(true)
    // @ts-ignore - profilePicture exists but TS doesn't recognize it
    setProfilePicture(user.profilePicture || null)
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  // Allow access if user is supervisor OR if localStorage indicates supervisor access
  const shouldAllowAccess = allowAccess || (user && user.role === "supervisor")

  if (!shouldAllowAccess) {
    return null
  }

  return (
    <ErrorBoundary>
      <HeartbeatTracker />
      <div className="min-h-screen bg-gray-50" dir="rtl">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed top-0 right-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          md:translate-x-0 md:z-10
        `}>
          <div className="flex flex-col h-full overflow-y-auto">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Settings className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-blue-900">لوحة المشرف</h2>
                    <p className="text-xs text-gray-600">{user?.name || 'مشرف'}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden hover:bg-white/50"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Profile Picture */}
              {profilePicture && (
                <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg">
                  <img 
                    src={profilePicture} 
                    alt={user?.name || 'Profile'} 
                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-200"
                  />
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 md:p-4">
              <ul className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center justify-between px-3 py-3 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all group"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-medium">{item.title}</span>
                            {item.description && (
                              <p className="text-xs text-gray-500 hidden lg:block">{item.description}</p>
                            )}
                          </div>
                        </div>
                        {item.badge && (
                          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs px-2.5 py-1 rounded-full shadow-sm">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="p-3 md:p-4 border-t border-gray-200 bg-gray-50">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl py-6"
                onClick={logout}
              >
                <LogOut className="w-5 h-5 ml-3" />
                <span className="font-medium">تسجيل الخروج</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="md:mr-72">
          {/* Top bar */}
          <header className="sticky top-0 z-20 bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden hover:bg-gray-100 rounded-xl p-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </Button>
            
              <div className="flex items-center gap-4 relative z-10 ml-auto md:ml-0">
                <div className="text-right hidden md:block">
                  <p className="text-sm text-gray-600">مرحباً،</p>
                  <p className="font-semibold text-gray-900">{user?.name || 'مشرف'}</p>
                </div>
                {profilePicture ? (
                  <img
                  src={profilePicture}
                  alt={user?.name || 'مشرف'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 relative z-10"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center relative z-10">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
    </ErrorBoundary>
  )
}
