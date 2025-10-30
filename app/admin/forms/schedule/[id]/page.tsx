"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Calendar, Save, ArrowLeft, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FormSchedule {
  id: string
  title: string
  openAt: string | null
  closeAt: string | null
  isActive: boolean
}

export default function FormSchedulePage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormSchedule | null>(null)
  const [enableSchedule, setEnableSchedule] = useState(false)
  const [openDate, setOpenDate] = useState('')
  const [openTime, setOpenTime] = useState('')
  const [closeDate, setCloseDate] = useState('')
  const [closeTime, setCloseTime] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }
    fetchFormSchedule()
  }, [user, router, params.id])

  const fetchFormSchedule = async () => {
    try {
      const response = await fetch(`/api/admin/forms/${params.id}/schedule`)
      if (response.ok) {
        const data = await response.json()
        setForm(data.form)
        
        // Set initial values
        if (data.form.openAt || data.form.closeAt) {
          setEnableSchedule(true)
          
          if (data.form.openAt) {
            const openDateTime = new Date(data.form.openAt)
            // استخدام التوقيت المحلي بدلاً من UTC
            const year = openDateTime.getFullYear()
            const month = String(openDateTime.getMonth() + 1).padStart(2, '0')
            const day = String(openDateTime.getDate()).padStart(2, '0')
            const hours = String(openDateTime.getHours()).padStart(2, '0')
            const minutes = String(openDateTime.getMinutes()).padStart(2, '0')
            
            setOpenDate(`${year}-${month}-${day}`)
            setOpenTime(`${hours}:${minutes}`)
          }
          
          if (data.form.closeAt) {
            const closeDateTime = new Date(data.form.closeAt)
            // استخدام التوقيت المحلي بدلاً من UTC
            const year = closeDateTime.getFullYear()
            const month = String(closeDateTime.getMonth() + 1).padStart(2, '0')
            const day = String(closeDateTime.getDate()).padStart(2, '0')
            const hours = String(closeDateTime.getHours()).padStart(2, '0')
            const minutes = String(closeDateTime.getMinutes()).padStart(2, '0')
            
            setCloseDate(`${year}-${month}-${day}`)
            setCloseTime(`${hours}:${minutes}`)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching form schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveStatus('idle')

    try {
      let openAt: string | null = null
      let closeAt: string | null = null

      if (enableSchedule) {
        // Validate and create openAt
        if (openDate && openTime) {
          // إنشاء Date object من التاريخ والوقت المحلي
          const openDateTime = new Date(`${openDate}T${openTime}`)
          openAt = openDateTime.toISOString()
        }

        // Validate and create closeAt
        if (closeDate && closeTime) {
          // إنشاء Date object من التاريخ والوقت المحلي
          const closeDateTime = new Date(`${closeDate}T${closeTime}`)
          closeAt = closeDateTime.toISOString()
        }

        // Validation: closeAt must be after openAt
        if (openAt && closeAt && new Date(closeAt) <= new Date(openAt)) {
          alert('تاريخ الإغلاق يجب أن يكون بعد تاريخ الفتح')
          setSaving(false)
          return
        }
      }

      const response = await fetch(`/api/admin/forms/${params.id}/schedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openAt, closeAt })
      })

      if (response.ok) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
        fetchFormSchedule() // Refresh data
      } else {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    } catch (error) {
      console.error('Error saving schedule:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setSaving(false)
    }
  }

  const getCurrentStatus = () => {
    if (!form || !enableSchedule) return null
    
    const now = new Date()
    const openAt = form.openAt ? new Date(form.openAt) : null
    const closeAt = form.closeAt ? new Date(form.closeAt) : null

    if (openAt && now < openAt) {
      return { status: 'pending', label: 'لم يفتح بعد', color: 'blue' }
    }

    if (closeAt && now >= closeAt) {
      return { status: 'closed', label: 'مغلق', color: 'red' }
    }

    if (openAt && closeAt && now >= openAt && now < closeAt) {
      return { status: 'open', label: 'مفتوح حالياً', color: 'green' }
    }

    return { status: 'open', label: 'مفتوح', color: 'green' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#01645e] mx-auto mb-4"></div>
          <p className="text-[#01645e]">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  const status = getCurrentStatus()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/admin/forms">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 ml-2" />
              رجوع للفورمات
            </Button>
          </Link>

          <h1 className="text-4xl font-bold text-[#01645e] mb-2 flex items-center gap-3">
            <Clock className="w-10 h-10" />
            جدولة النموذج
          </h1>
          <p className="text-gray-600 text-lg">
            تحديد موعد فتح وإغلاق النموذج
          </p>
        </motion.div>

        {/* Form Title Card */}
        {form && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="mb-6 border-2 border-[#01645e]/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-[#01645e]">
                      {form.title}
                    </CardTitle>
                  </div>
                  {status && (
                    <div className={`px-4 py-2 rounded-full bg-${status.color}-100 text-${status.color}-700 font-semibold flex items-center gap-2`}>
                      {status.status === 'open' && <CheckCircle2 className="w-5 h-5" />}
                      {status.status === 'pending' && <Clock className="w-5 h-5" />}
                      {status.status === 'closed' && <XCircle className="w-5 h-5" />}
                      {status.label}
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        )}

        {/* Schedule Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-[#01645e]">إعدادات الجدولة</CardTitle>
                  <CardDescription>
                    حدد موعد فتح وإغلاق استقبال الردود على النموذج
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor="enable-schedule" className="text-base font-semibold">
                    تفعيل الجدولة
                  </Label>
                  <Switch
                    id="enable-schedule"
                    checked={enableSchedule}
                    onCheckedChange={setEnableSchedule}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {!enableSchedule && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <p className="text-blue-700 font-medium">
                    الجدولة معطلة - النموذج متاح دائماً
                  </p>
                  <p className="text-blue-600 text-sm mt-2">
                    فعّل الجدولة لتحديد مواعيد الفتح والإغلاق
                  </p>
                </div>
              )}

              {enableSchedule && (
                <>
                  {/* Opening Time */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-green-500 p-3 rounded-full">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-green-800">موعد فتح النموذج</h3>
                        <p className="text-green-600 text-sm">متى سيصبح النموذج متاحاً للإجابات</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="open-date" className="text-green-800 font-semibold mb-2 block">
                          التاريخ
                        </Label>
                        <Input
                          id="open-date"
                          type="date"
                          value={openDate}
                          onChange={(e) => setOpenDate(e.target.value)}
                          className="border-green-300 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="open-time" className="text-green-800 font-semibold mb-2 block">
                          الوقت
                        </Label>
                        <Input
                          id="open-time"
                          type="time"
                          value={openTime}
                          onChange={(e) => setOpenTime(e.target.value)}
                          className="border-green-300 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    {openDate && openTime && (
                      <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                        <p className="text-sm text-green-700">
                          <span className="font-semibold">سيفتح في:</span>{' '}
                          {new Date(`${openDate}T${openTime}`).toLocaleString('ar-SA', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Closing Time */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-red-500 p-3 rounded-full">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-red-800">موعد إغلاق النموذج</h3>
                        <p className="text-red-600 text-sm">متى سيتم إيقاف استقبال الإجابات</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="close-date" className="text-red-800 font-semibold mb-2 block">
                          التاريخ
                        </Label>
                        <Input
                          id="close-date"
                          type="date"
                          value={closeDate}
                          onChange={(e) => setCloseDate(e.target.value)}
                          className="border-red-300 focus:border-red-500 focus:ring-red-500"
                          min={openDate || undefined}
                        />
                      </div>
                      <div>
                        <Label htmlFor="close-time" className="text-red-800 font-semibold mb-2 block">
                          الوقت
                        </Label>
                        <Input
                          id="close-time"
                          type="time"
                          value={closeTime}
                          onChange={(e) => setCloseTime(e.target.value)}
                          className="border-red-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                    </div>

                    {closeDate && closeTime && (
                      <div className="mt-4 p-3 bg-white rounded-lg border border-red-200">
                        <p className="text-sm text-red-700">
                          <span className="font-semibold">سيغلق في:</span>{' '}
                          {new Date(`${closeDate}T${closeTime}`).toLocaleString('ar-SA', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Duration Display */}
                  {openDate && openTime && closeDate && closeTime && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                      <h4 className="text-blue-800 font-bold mb-2 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        مدة فتح النموذج
                      </h4>
                      {(() => {
                        const start = new Date(`${openDate}T${openTime}`)
                        const end = new Date(`${closeDate}T${closeTime}`)
                        const diffMs = end.getTime() - start.getTime()
                        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
                        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

                        return (
                          <p className="text-blue-700 text-lg font-semibold">
                            {diffDays > 0 && `${diffDays} يوم `}
                            {diffHours > 0 && `${diffHours} ساعة `}
                            {diffMinutes > 0 && `${diffMinutes} دقيقة`}
                          </p>
                        )
                      })()}
                    </div>
                  )}
                </>
              )}

              {/* Save Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white hover:from-[#3ab666] hover:to-[#c3e956] text-lg py-6"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 ml-2" />
                      حفظ الإعدادات
                    </>
                  )}
                </Button>
              </div>

              {/* Save Status */}
              {saveStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center gap-3"
                >
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <p className="text-green-700 font-semibold">تم حفظ الإعدادات بنجاح!</p>
                </motion.div>
              )}

              {saveStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center gap-3"
                >
                  <XCircle className="w-6 h-6 text-red-600" />
                  <p className="text-red-700 font-semibold">حدث خطأ في الحفظ</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="space-y-2 text-blue-800">
                  <p className="font-semibold">ملاحظات هامة:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>عند تفعيل الجدولة، سيرى المستخدمون عداد تنازلي قبل فتح النموذج</li>
                    <li>بعد موعد الإغلاق، سيتم عرض رسالة أن النموذج مغلق ولا يقبل ردود</li>
                    <li>يمكنك تعديل الأوقات في أي وقت حتى بعد النشر</li>
                    <li>إذا لم تحدد موعد فتح، سيكون النموذج متاحاً فوراً</li>
                    <li>إذا لم تحدد موعد إغلاق، سيبقى النموذج مفتوحاً للأبد</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
