"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, Mail, Lock, User, Globe, ArrowRight, Sparkles, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    organizationSlug: ''
  })

  // Auto-generate slug from organization name
  const handleOrganizationNameChange = (value: string) => {
    setFormData({
      ...formData,
      organizationName: value,
      organizationSlug: value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Remove consecutive hyphens
        .trim()
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('كلمات المرور غير متطابقة')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setErrorMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          organizationName: formData.organizationName,
          organizationSlug: formData.organizationSlug
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Registration successful:', data)
        
        // Show success message
        const message = data.emailSent 
          ? `تم إنشاء حسابك بنجاح! تم إرسال إيميل ترحيبي إلى ${formData.email}`
          : 'تم إنشاء حسابك بنجاح! سيتم تحويلك إلى لوحة التحكم...'
        
        setSuccessMessage(message)
        
        // Redirect to admin dashboard after 2 seconds
        setTimeout(() => {
          router.push('/admin/dashboard')
        }, 2000)
      } else {
        const error = await response.json()
        setErrorMessage(error.error || 'حدث خطأ في التسجيل')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrorMessage('حدث خطأ في التسجيل')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = 
    formData.name && 
    formData.email && 
    formData.password && 
    formData.confirmPassword && 
    formData.organizationName && 
    formData.organizationSlug &&
    formData.password === formData.confirmPassword &&
    formData.password.length >= 8

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  HackPro SaaS
                </h1>
                <p className="text-gray-600">منصة إدارة الهاكاثونات السحابية</p>
              </div>
            </div>

            <div className="space-y-4 mt-12">
              <h2 className="text-4xl font-bold text-gray-900">
                ابدأ رحلتك الرقمية
              </h2>
              <p className="text-xl text-gray-600">
                أنشئ مؤسستك وابدأ بإدارة هاكاثوناتك بكفاءة عالية
              </p>
            </div>

            <div className="space-y-4 mt-8">
              {[
                'إدارة متعددة المستأجرين',
                'لوحة تحكم متقدمة',
                'عزل كامل للبيانات',
                'تقارير تفصيلية'
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center space-x-3 rtl:space-x-reverse"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Side - Registration Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-2xl border-0">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  إنشاء حساب جديد
                </h2>
                <p className="text-gray-600">
                  سجّل مؤسستك وابدأ باستخدام المنصة
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <Label htmlFor="name" className="text-gray-700">الاسم الكامل *</Label>
                  <div className="relative mt-2">
                    <User className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="أدخل اسمك الكامل"
                      className="pr-11 h-12 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-700">البريد الإلكتروني *</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="admin@example.com"
                      className="pr-11 h-12 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password" className="text-gray-700">كلمة المرور *</Label>
                    <div className="relative mt-2">
                      <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="********"
                        className="pr-11 h-12 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-gray-700">تأكيد كلمة المرور *</Label>
                    <div className="relative mt-2">
                      <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        placeholder="********"
                        className="pr-11 h-12 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Organization Information */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                    <Building2 className="w-5 h-5 text-violet-600" />
                    <h3 className="text-lg font-semibold text-gray-900">معلومات المؤسسة</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="organizationName" className="text-gray-700">اسم المؤسسة *</Label>
                      <div className="relative mt-2">
                        <Building2 className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="organizationName"
                          type="text"
                          value={formData.organizationName}
                          onChange={(e) => handleOrganizationNameChange(e.target.value)}
                          placeholder="مثال: وزارة الاتصالات"
                          className="pr-11 h-12 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="organizationSlug" className="text-gray-700">معرّف المؤسسة (URL) *</Label>
                      <div className="relative mt-2">
                        <Globe className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="organizationSlug"
                          type="text"
                          value={formData.organizationSlug}
                          onChange={(e) => setFormData({...formData, organizationSlug: e.target.value})}
                          placeholder="ministry-of-communications"
                          className="pr-11 h-12 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                          required
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        سيُستخدم في رابط مؤسستك: hackpro.com/{formData.organizationSlug || 'your-org'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start space-x-3 rtl:space-x-reverse"
                  >
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{successMessage}</span>
                  </motion.div>
                )}

                {/* Error Message */}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
                  >
                    {errorMessage}
                  </motion.div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>جاري التسجيل...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                      <span>إنشاء الحساب</span>
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>

                {/* Login Link */}
                <div className="text-center pt-4">
                  <p className="text-gray-600">
                    لديك حساب بالفعل؟{' '}
                    <Link href="/login" className="text-violet-600 hover:text-violet-700 font-semibold">
                      تسجيل الدخول
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
