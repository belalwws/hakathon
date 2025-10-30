'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/theme-context'
import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Rocket,
  ArrowLeft,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  Settings,
  User,
  LogOut,
  Award,
  Users,
  BarChart3,
  FileText,
  Home,
  Sun,
  Moon,
  Globe
} from 'lucide-react'

export function ModernHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { language, toggleLanguage, t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleDashboardClick = () => {
    if (!user) {
      router.push('/login')
      return
    }

    const dashboardRoutes: Record<string, string> = {
      master: '/master',
      admin: '/admin/dashboard',
      judge: '/judge/dashboard',
      supervisor: '/supervisor/dashboard',
      expert: '/expert/dashboard',
      participant: '/participant/dashboard'
    }

    router.push(dashboardRoutes[user.role] || '/login')
  }

  const getRoleName = (role: string) => {
    const roleNames: Record<string, string> = {
      master: 'مدير المنصة',
      admin: 'مدير النظام',
      judge: 'محكّم',
      supervisor: 'مشرف',
      expert: 'خبير',
      participant: 'مشارك'
    }
    return roleNames[role] || role
  }

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 transition-colors">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:inline">
              HackPro
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              className={`text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 ${
                isActive('/') ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : ''
              }`}
              onClick={() => router.push('/')}
            >
              <Home className="h-4 w-4 ml-2" />
              {t('nav.home')}
            </Button>

            <Button
              variant="ghost"
              className={`text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 ${
                isActive('/about') ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : ''
              }`}
              onClick={() => router.push('/about')}
            >
              {language === 'ar' ? 'من نحن' : 'About'}
            </Button>

            <Button
              variant="ghost"
              className={`text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 ${
                isActive('/features') ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : ''
              }`}
              onClick={() => router.push('/features')}
            >
              {language === 'ar' ? 'المميزات' : 'Features'}
            </Button>

            <Button
              variant="ghost"
              className={`text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 ${
                isActive('/pricing') ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : ''
              }`}
              onClick={() => router.push('/pricing')}
            >
              {language === 'ar' ? 'الأسعار' : 'Pricing'}
            </Button>

            <Button
              variant="ghost"
              className={`text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 ${
                isActive('/blog') ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : ''
              }`}
              onClick={() => router.push('/blog')}
            >
              {language === 'ar' ? 'المدونة' : 'Blog'}
            </Button>

            <Button
              variant="ghost"
              className={`text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 ${
                isActive('/contact') ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : ''
              }`}
              onClick={() => router.push('/contact')}
            >
              {language === 'ar' ? 'تواصل معنا' : 'Contact'}
            </Button>

            {user && (
              <>
                <Button
                  variant="ghost"
                  className={`text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 ${
                    pathname?.includes('/hackathons') ? 'bg-indigo-50 text-indigo-600' : ''
                  }`}
                  onClick={() => router.push('/hackathons')}
                >
                  <Award className="h-4 w-4 ml-2" />
                  الهاكاثونات
                </Button>

                {(user.role === 'admin' || user.role === 'supervisor') && (
                  <Button
                    variant="ghost"
                    className={`text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 ${
                      pathname?.includes('/admin/forms') ? 'bg-indigo-50 text-indigo-600' : ''
                    }`}
                    onClick={() => router.push('/admin/forms')}
                  >
                    <FileText className="h-4 w-4 ml-2" />
                    النماذج
                  </Button>
                )}

                {user.role === 'admin' && (
                  <Button
                    variant="ghost"
                    className={`text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 ${
                      pathname?.includes('/results') ? 'bg-indigo-50 text-indigo-600' : ''
                    }`}
                    onClick={() => router.push('/results')}
                  >
                    <BarChart3 className="h-4 w-4 ml-2" />
                    النتائج
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Right Side - Theme Toggle, Language Switcher & Auth Buttons / User Menu */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-9 h-9 p-0 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Language Switcher */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="hidden sm:flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
              title={language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">{language === 'ar' ? 'EN' : 'عربي'}</span>
            </Button>

            {loading ? (
              <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 transition-all"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                      <span className="text-xs text-gray-500">{getRoleName(user.role)}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white border border-gray-200 shadow-xl rounded-xl p-2">
                  <DropdownMenuLabel className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-indigo-600 font-medium mt-1">{getRoleName(user.role)}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-gray-200" />

                  <DropdownMenuItem
                    onClick={handleDashboardClick}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-indigo-50 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4 text-indigo-600" />
                    <span className="font-medium">لوحة التحكم</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => router.push('/profile')}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-indigo-50 transition-colors"
                  >
                    <User className="h-4 w-4 text-indigo-600" />
                    <span className="font-medium">الملف الشخصي</span>
                  </DropdownMenuItem>

                  {user.role === 'admin' && (
                    <DropdownMenuItem
                      onClick={() => router.push('/admin/dashboard')}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-indigo-50 transition-colors"
                    >
                      <Settings className="h-4 w-4 text-indigo-600" />
                      <span className="font-medium">إعدادات النظام</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-gray-200" />

                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">تسجيل الخروج</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/login')}
                  className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                >
                  تسجيل الدخول
                </Button>
                <Button
                  onClick={() => router.push('/register')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  ابدأ مجاناً
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 bg-white"
            >
              <div className="px-4 py-6 space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                  onClick={() => {
                    router.push('/')
                    setMobileMenuOpen(false)
                  }}
                >
                  <Home className="h-4 w-4 ml-2" />
                  الرئيسية
                </Button>

                {user && (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                      onClick={() => {
                        handleDashboardClick()
                        setMobileMenuOpen(false)
                      }}
                    >
                      <LayoutDashboard className="h-4 w-4 ml-2" />
                      لوحة التحكم
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                      onClick={() => {
                        router.push('/hackathons')
                        setMobileMenuOpen(false)
                      }}
                    >
                      <Award className="h-4 w-4 ml-2" />
                      الهاكاثونات
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                      onClick={() => {
                        router.push('/profile')
                        setMobileMenuOpen(false)
                      }}
                    >
                      <User className="h-4 w-4 ml-2" />
                      الملف الشخصي
                    </Button>

                    <div className="border-t border-gray-200 my-3" />

                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        logout()
                        setMobileMenuOpen(false)
                      }}
                    >
                      <LogOut className="h-4 w-4 ml-2" />
                      تسجيل الخروج
                    </Button>
                  </>
                )}

                {!user && (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                      onClick={() => {
                        router.push('/login')
                        setMobileMenuOpen(false)
                      }}
                    >
                      تسجيل الدخول
                    </Button>
                    <Button
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                      onClick={() => {
                        router.push('/register')
                        setMobileMenuOpen(false)
                      }}
                    >
                      ابدأ مجاناً
                      <ArrowLeft className="mr-2 h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
