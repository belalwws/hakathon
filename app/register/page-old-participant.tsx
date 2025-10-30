"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, Flag, Users, ArrowRight, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { SuccessModal } from '@/components/ui/success-modal'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Removed Hackathon interface as we're not selecting hackathons anymore

const teamRoles = [
  'قائد الفريق',
  'مطور واجهات أمامية',
  'مطور واجهات خلفية',
  'مطور تطبيقات الجوال',
  'مصمم UI/UX',
  'مصمم جرافيك',
  'محلل بيانات',
  'مختص أمن سيبراني',
  'مدير مشروع',
  'مختص تسويق رقمي',
  'أخرى'
]

const saudiCities = [
  'الرياض',
  'جدة',
  'مكة المكرمة',
  'المدينة المنورة',
  'الدمام',
  'الخبر',
  'الظهران',
  'تبوك',
  'بريدة',
  'خميس مشيط',
  'حائل',
  'نجران',
  'الطائف',
  'الجبيل',
  'ينبع',
  'أبها',
  'عرعر',
  'سكاكا',
  'جازان',
  'القطيف',
  'الأحساء',
  'الباحة'
]

const nationalities = [
  'السعودية',
  'مصر',
  'الأردن',
  'الإمارات',
  'الكويت',
  'قطر',
  'البحرين',
  'عُمان',
  'اليمن',
  'سوريا',
  'لبنان',
  'العراق',
  'فلسطين',
  'المغرب',
  'الجزائر',
  'تونس',
  'ليبيا',
  'السودان',
  'الصومال',
  'موريتانيا',
  'تركيا',
  'الهند',
  'باكستان',
  'الفلبين',
  'أخرى'
]

export default function RegisterPage() {
  const router = useRouter()
  const { refreshUser, forceSetUser } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [registeredUser, setRegisteredUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    // Personal Info
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    nationality: '',

    // Participation Type
    teamType: 'individual', // individual or team
    preferredRole: '' // Required field for preferred role in team
  })

  // Removed hackathon fetching as we're not selecting hackathons anymore

  const handleSubmit = async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Registration response:', data)

        // Check if auto-login was successful
        if (data.autoLogin && data.user) {
          console.log('🔄 Auto-login successful, user data:', data.user)

          // Force set user immediately in AuthContext
          console.log('🔥 Force setting user in context...')
          forceSetUser(data.user)

          // Wait a bit for cookie to be set
          await new Promise(resolve => setTimeout(resolve, 1000))

          // Try to refresh auth context multiple times as backup
          let refreshedUser = null
          for (let i = 0; i < 3; i++) {
            console.log(`🔄 Refresh attempt ${i + 1}/3...`)
            refreshedUser = await refreshUser()
            if (refreshedUser) {
              console.log('✅ User context refreshed successfully:', refreshedUser.email)
              break
            }
            await new Promise(resolve => setTimeout(resolve, 500))
          }

          // Set user data and show success modal
          setRegisteredUser(data.user)
          setShowSuccessModal(true)

          console.log('🎉 Registration successful, showing success modal')
        } else {
          console.log('❌ Auto-login failed, redirecting to success page')
          // Fallback to success page
          router.push('/register/success')
        }
      } else {
        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const error = await response.json()
          alert(error.error || error.message || 'حدث خطأ في التسجيل')
          setErrorMessage(error.error || error.message || 'حدث خطأ في التسجيل')
        } else {
          const text = await response.text()
          console.error('Non-JSON error response:', text)
          alert('حدث خطأ في الخادم. حاول لاحقاً.')
          setErrorMessage('حدث خطأ في الخادم. حاول لاحقاً.')
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('حدث خطأ في التسجيل')
      setErrorMessage('حدث خطأ في التسجيل')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step < 2) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name && formData.email && formData.password && formData.phone && formData.city && formData.nationality
      case 2:
        return formData.teamType && formData.preferredRole
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-[#01645e] mb-4">تسجيل مشارك جديد</h1>
          <p className="text-[#8b7632] text-lg">انضم إلى هاكاثون الابتكار وكن جزءاً من التغيير</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {[1, 2].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= stepNumber
                    ? 'bg-[#01645e] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 2 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-[#01645e]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form Steps */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-[#01645e]">
                {step === 1 && 'المعلومات الشخصية'}
                {step === 2 && 'نوع المشاركة'}
              </CardTitle>
              <CardDescription>
                {step === 1 && 'أدخل معلوماتك الشخصية الأساسية'}
                {step === 2 && 'حدد نوع مشاركتك ودورك في الفريق'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">الاسم الكامل *</Label>
                    <div className="relative">
                      <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="أدخل اسمك الكامل"
                        className="pr-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني *</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="example@email.com"
                        className="pr-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password">كلمة المرور *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="********"
                        className="pr-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="05xxxxxxxx"
                        className="pr-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="city">المدينة *</Label>
                    <Select value={formData.city} onValueChange={(value) => setFormData({...formData, city: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المدينة" />
                      </SelectTrigger>
                      <SelectContent>
                        {saudiCities.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="nationality">الجنسية *</Label>
                    <Select value={formData.nationality} onValueChange={(value) => setFormData({...formData, nationality: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الجنسية" />
                      </SelectTrigger>
                      <SelectContent>
                        {nationalities.map((n) => (
                          <SelectItem key={n} value={n}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              {/* Step 2: Participation Type */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-[#01645e] mb-4">نوع المشاركة</h3>
                    <RadioGroup
                      value={formData.teamType}
                      onValueChange={(value) => setFormData({...formData, teamType: value})}
                    >
                      <div className="flex items-center space-x-2 rtl:space-x-reverse p-4 border rounded-lg">
                        <RadioGroupItem value="individual" id="individual" />
                        <Label htmlFor="individual" className="cursor-pointer flex-1">
                          <div className="flex items-center">
                            <User className="w-5 h-5 text-[#01645e] ml-2" />
                            <div>
                              <h4 className="font-semibold">مشاركة فردية</h4>
                              <p className="text-sm text-[#8b7632]">سأشارك بمفردي أو سيتم تكويني في فريق</p>
                            </div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 rtl:space-x-reverse p-4 border rounded-lg">
                        <RadioGroupItem value="team" id="team" />
                        <Label htmlFor="team" className="cursor-pointer flex-1">
                          <div className="flex items-center">
                            <Users className="w-5 h-5 text-[#3ab666] ml-2" />
                            <div>
                              <h4 className="font-semibold">مشاركة ضمن فريق</h4>
                              <p className="text-sm text-[#8b7632]">لدي فريق أو أريد الانضمام لفريق محدد</p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="preferredRole">الدور المفضل في الفريق *</Label>
                    <Select value={formData.preferredRole} onValueChange={(value) => setFormData({...formData, preferredRole: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الدور الذي تفضل لعبه في الفريق" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamRoles.map((role) => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <div>
                  {step > 1 && (
                    <Button variant="outline" onClick={prevStep}>
                      <ArrowRight className="w-4 h-4 ml-2" />
                      السابق
                    </Button>
                  )}
                </div>
                
                <div className="flex space-x-4 rtl:space-x-reverse">
                  <Link href="/">
                    <Button variant="outline">إلغاء</Button>
                  </Link>
                  
                  {step < 2 ? (
                    <Button
                      onClick={nextStep}
                      disabled={!isStepValid()}
                      className="bg-[#01645e] hover:bg-[#014a46]"
                    >
                      التالي
                      <ArrowLeft className="w-4 h-4 mr-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={loading || !isStepValid()}
                      className="bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52]"
                    >
                      {loading ? 'جاري التسجيل...' : 'إتمام التسجيل'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Login Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 text-gray-500">أو</span>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-3">
              لديك حساب بالفعل؟
            </p>
            <Link href="/login">
              <button className="bg-white border-2 border-[#01645e] text-[#01645e] hover:bg-[#01645e] hover:text-white py-3 px-8 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 mx-auto">
                <span>تسجيل الدخول</span>
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="🎉 تم إنشاء حسابك بنجاح!"
        message="تم تسجيل دخولك تلقائياً وسيتم توجيهك الآن إلى لوحة المشارك حيث يمكنك متابعة مشاركتك في الهاكاثونات."
        userName={registeredUser?.name}
        onContinue={async () => {
          console.log('🚀 Modal continue clicked, navigating to dashboard...')
          setShowSuccessModal(false)

          // Wait a bit and refresh user context one more time
          await new Promise(resolve => setTimeout(resolve, 500))
          const finalUser = await refreshUser()

          if (finalUser) {
            console.log('✅ Final user verification successful:', finalUser.email, 'role:', finalUser.role)
            // Navigate based on role
            if (finalUser.role === 'participant') {
              window.location.href = '/participant/dashboard'
            } else if (finalUser.role === 'admin') {
              window.location.href = '/admin/dashboard'
            } else {
              window.location.href = '/participant/dashboard'
            }
          } else {
            console.log('❌ Final user verification failed, forcing participant dashboard')
            window.location.href = '/participant/dashboard'
          }
        }}
        continueText="الذهاب إلى لوحة المشارك"
      />
    </div>
  )
}
