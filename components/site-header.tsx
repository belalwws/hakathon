"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronDown, LogOut, User as UserIcon, Menu, X, Calendar, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/auth-context'

export function SiteHeader() {
  const { user, loading, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse hover:opacity-80 transition-all duration-300 group">
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  نظام إدارة الهاكاثون
                </h1>
                <p className="text-xs sm:text-sm text-slate-600">منصة متكاملة لإدارة الهاكاثونات</p>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:flex items-center space-x-6 rtl:space-x-reverse">
            {loading ? (
              <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
            ) : !user ? (
              <div className="hidden sm:flex items-center gap-2 lg:gap-3">
                <Link href="/register" className="bg-white text-slate-900 border border-slate-200 px-3 lg:px-5 py-2 lg:py-2.5 rounded-lg font-semibold hover:bg-slate-50 transition-colors text-sm lg:text-base">
                  إنشاء حساب
                </Link>
                <Link href="/login" className="bg-slate-900 text-white px-3 lg:px-5 py-2 lg:py-2.5 rounded-lg font-semibold hover:bg-slate-800 transition-colors text-sm lg:text-base">
                  تسجيل الدخول
                </Link>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-4 py-2 transition-all duration-300"
                    >
                      <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-600">
                          {user.role === 'admin' ? 'مدير النظام' :
                           user.role === 'judge' ? 'محكم' :
                           user.role === 'supervisor' ? 'مشرف' : 'مشارك'}
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-600 transition-transform duration-200" />
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 bg-white border border-slate-200 shadow-lg rounded-lg p-2"
                >
                  <div className="px-3 py-2 bg-slate-50 rounded-lg mb-2 flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{user.name}</div>
                      <div className="text-sm text-slate-600">{user.email}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {user.role === 'admin' ? '🔧 مدير النظام' :
                         user.role === 'judge' ? '⚖️ محكم معتمد' :
                         user.role === 'supervisor' ? '👨‍🏫 مشرف' : '👨‍💻 مشارك'}
                      </div>
                    </div>
                  </div>

                  <DropdownMenuSeparator className="bg-slate-200" />

                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">🏛️</span>
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">لوحة تحكم الأدمن</div>
                            <div className="text-xs text-slate-600">إدارة النظام والمشاركين</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href="/admin/forms" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">📝</span>
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">إدارة النماذج</div>
                            <div className="text-xs text-slate-600">إنشاء ومتابعة النماذج</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href="/master/blog" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">✍️</span>
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">إدارة المدونة</div>
                            <div className="text-xs text-slate-600">إنشاء وتعديل المقالات</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {user.role === 'judge' && (
                    <DropdownMenuItem asChild>
                      <Link href="/judge" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">⚖️</span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">منطقة المحكم</div>
                          <div className="text-xs text-slate-600">تقييم المشاريع والحلول</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {user.role === 'supervisor' && (
                    <DropdownMenuItem asChild>
                      <Link href="/supervisor/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">👨‍🏫</span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">لوحة المشرف</div>
                          <div className="text-xs text-slate-600">إدارة المشاركين والفرق</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {user.role === 'participant' && (
                    <DropdownMenuItem asChild>
                      <Link href="/participant/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">👨‍💻</span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">لوحة المشارك</div>
                          <div className="text-xs text-slate-600">متابعة مشروعك وحالة المشاركة</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-slate-200 my-2" />

                  <DropdownMenuItem asChild>
                    <Link
                      href={user.role === 'supervisor' ? '/supervisor/profile' : '/profile'}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">👤</span>
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">الملف الشخصي</div>
                        <div className="text-xs text-slate-600">معلوماتك ومشاركاتك</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/hackathons" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">🏆</span>
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">الهاكاثونات</div>
                        <div className="text-xs text-slate-600">تصفح الفعاليات المتاحة</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-slate-200 my-2" />

                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-red-600 hover:text-red-700"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <LogOut className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium">تسجيل الخروج</div>
                      <div className="text-xs text-red-500">إنهاء الجلسة الحالية</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </motion.div>

          {/* Mobile Menu Button & User Menu */}
          <div className="lg:hidden flex items-center gap-2">
            {/* User Avatar for Mobile */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 rounded-full"
                  >
                    <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 border-slate-200">
                  <DropdownMenuLabel className="text-center pb-2">
                    <div className="font-semibold text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-600">
                      {user.role === 'admin' ? 'مدير النظام' :
                       user.role === 'judge' ? 'محكم' :
                       user.role === 'supervisor' ? 'مشرف' : 'مشارك'}
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-slate-200" />

                  {/* Dashboard Links */}
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard" className="flex items-center gap-2 w-full">
                        <Settings className="w-4 h-4" />
                        لوحة التحكم
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {user.role === 'judge' && (
                    <DropdownMenuItem asChild>
                      <Link href="/judge" className="flex items-center gap-2 w-full">
                        <Settings className="w-4 h-4" />
                        منطقة التحكيم
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {user.role === 'supervisor' && (
                    <DropdownMenuItem asChild>
                      <Link href="/supervisor/dashboard" className="flex items-center gap-2 w-full">
                        <Settings className="w-4 h-4" />
                        لوحة المشرف
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {user.role === 'participant' && (
                    <DropdownMenuItem asChild>
                      <Link href="/participant/dashboard" className="flex items-center gap-2 w-full">
                        <Settings className="w-4 h-4" />
                        لوحة المشارك
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 w-full">
                      <UserIcon className="w-4 h-4" />
                      الملف الشخصي
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-slate-200" />

                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-slate-700" /> : <Menu className="w-6 h-6 text-slate-700" />}
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-200 bg-white shadow-lg"
          >
            <div className="px-4 py-6 space-y-6">
              {/* User Info for Mobile (if logged in) */}
              {user && (
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-[#01645e] text-lg">{user.name}</div>
                      <div className="text-sm text-[#8b7632] font-medium">
                        {user.role === 'admin' ? '👑 مدير النظام' :
                         user.role === 'judge' ? '⚖️ محكم' :
                         user.role === 'supervisor' ? '👨‍🏫 مشرف' : '🚀 مشارك'}
                      </div>
                      <div className="text-xs text-[#01645e]/70 mt-1">مرحباً بك في المنصة</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dashboard Links for Logged in Users */}
              {user && (
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-[#8b7632] mb-3 px-2">لوحة التحكم</h3>

                  {user.role === 'admin' && (
                    <>
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-3 text-[#01645e] hover:text-white hover:bg-gradient-to-r hover:from-[#01645e] hover:to-[#3ab666] font-medium transition-all duration-300 py-3 px-3 rounded-xl shadow-sm hover:shadow-md border border-[#01645e]/20"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="w-5 h-5 flex-shrink-0" />
                        <span className="font-semibold">👑 لوحة الإدارة</span>
                      </Link>

                      <Link
                        href="/admin/forms"
                        className="flex items-center gap-3 text-[#3ab666] hover:text-white hover:bg-gradient-to-r hover:from-[#3ab666] hover:to-[#c3e956] font-medium transition-all duration-300 py-3 px-3 rounded-xl shadow-sm hover:shadow-md border border-[#3ab666]/20"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="w-5 h-5 flex-shrink-0 text-lg">📝</span>
                        <span className="font-semibold">إدارة النماذج</span>
                      </Link>
                    </>
                  )}

                  {user.role === 'judge' && (
                    <Link
                      href="/judge"
                      className="flex items-center gap-3 text-[#01645e] hover:text-white hover:bg-gradient-to-r hover:from-[#01645e] hover:to-[#3ab666] font-medium transition-all duration-300 py-3 px-3 rounded-xl shadow-sm hover:shadow-md border border-[#01645e]/20"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5 flex-shrink-0" />
                      <span className="font-semibold">⚖️ منطقة التحكيم</span>
                    </Link>
                  )}

                  {user.role === 'supervisor' && (
                    <Link
                      href="/supervisor/dashboard"
                      className="flex items-center gap-3 text-[#01645e] hover:text-white hover:bg-gradient-to-r hover:from-[#01645e] hover:to-[#3ab666] font-medium transition-all duration-300 py-3 px-3 rounded-xl shadow-sm hover:shadow-md border border-[#01645e]/20"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5 flex-shrink-0" />
                      <span className="font-semibold">👨‍🏫 لوحة المشرف</span>
                    </Link>
                  )}

                  {user.role === 'participant' && (
                    <Link
                      href="/participant/dashboard"
                      className="flex items-center gap-3 text-[#01645e] hover:text-white hover:bg-gradient-to-r hover:from-[#01645e] hover:to-[#3ab666] font-medium transition-all duration-300 py-3 px-3 rounded-xl shadow-sm hover:shadow-md border border-[#01645e]/20"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UserIcon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-semibold">🚀 لوحة المشارك</span>
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    className="flex items-center gap-3 text-[#01645e] hover:text-white hover:bg-gradient-to-r hover:from-[#01645e] hover:to-[#3ab666] font-medium transition-all duration-300 py-3 px-3 rounded-xl shadow-sm hover:shadow-md border border-[#01645e]/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserIcon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-semibold">👤 الملف الشخصي</span>
                  </Link>
                </div>
              )}

              {/* Auth Buttons for Mobile */}
              {!user ? (
                <div className="space-y-3 pt-4 border-t border-[#01645e]/20">
                  <Link
                    href="/register"
                    className="flex items-center justify-center gap-2 w-full text-center bg-white text-[#01645e] border-2 border-[#01645e] px-4 py-4 rounded-xl font-bold shadow-md hover:bg-[#01645e] hover:text-white transition-all duration-300 hover:shadow-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>✨ إنشاء حساب جديد</span>
                  </Link>
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 w-full text-center bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-4 py-4 rounded-xl font-bold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogOut className="w-5 h-5 rotate-180" />
                    <span>🚀 تسجيل الدخول</span>
                  </Link>
                </div>
              ) : (
                <div className="pt-4 border-t border-[#01645e]/20">
                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center justify-center gap-3 w-full text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 font-bold transition-all duration-300 py-4 px-3 rounded-xl border-2 border-red-200 hover:border-red-500 shadow-md hover:shadow-lg"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>👋 تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </header>
  )
}


