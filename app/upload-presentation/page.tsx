"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Upload, FileText, CheckCircle2, XCircle, Loader2, AlertCircle, Clock, User, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

function UploadPresentationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [tokenData, setTokenData] = useState<any>(null)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (token) {
      verifyToken()
    } else {
      setError('الرابط غير صحيح')
      setVerifying(false)
      setLoading(false)
    }
  }, [token])

  const verifyToken = async () => {
    try {
      setVerifying(true)
      const response = await fetch(`/api/upload-presentation/verify?token=${token}`)
      const data = await response.json()

      if (response.ok && data.valid) {
        setTokenData(data)
        setError(null)
      } else {
        setError(data.error || 'الرابط غير صحيح')
      }
    } catch (err) {
      console.error('Error verifying token:', err)
      setError('حدث خطأ في التحقق من الرابط')
    } finally {
      setVerifying(false)
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // التحقق من نوع الملف
      const allowedTypes = [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/pdf'
      ]

      if (!allowedTypes.includes(selectedFile.type)) {
        setError('نوع الملف غير مدعوم. يرجى رفع ملف PowerPoint (.ppt, .pptx) أو PDF')
        return
      }

      // التحقق من حجم الملف (10 ميجابايت)
      const maxSize = 10 * 1024 * 1024
      if (selectedFile.size > maxSize) {
        setError('حجم الملف كبير جداً. الحد الأقصى المسموح 10 ميجابايت')
        return
      }

      setFile(selectedFile)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !title.trim()) {
      setError('يرجى إدخال عنوان العرض التقديمي ورفع الملف')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('token', token!)
      formData.append('file', file)
      formData.append('title', title.trim())
      formData.append('description', description.trim())

      const response = await fetch('/api/upload-presentation/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          // يمكن إعادة التوجيه لصفحة شكر أو إغلاق النافذة
        }, 3000)
      } else {
        setError(data.error || 'حدث خطأ في رفع الملف')
      }
    } catch (err) {
      console.error('Error uploading:', err)
      setError('حدث خطأ في رفع الملف')
    } finally {
      setUploading(false)
    }
  }

  // Loading state
  if (loading || verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-[#01645e] animate-spin" />
              <p className="text-lg text-gray-600">جاري التحقق من الرابط...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error && !tokenData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="w-full max-w-md border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">خطأ</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                >
                  العودة للصفحة الرئيسية
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="w-full max-w-md border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <CheckCircle2 className="w-20 h-20 mx-auto mb-4 text-green-500" />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">تم الرفع بنجاح! 🎉</h2>
                <p className="text-gray-600 mb-6">
                  تم رفع العرض التقديمي بنجاح. سيتم مراجعته من قبل المحكمين قريباً.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800">
                    <strong>الفريق:</strong> {tokenData?.team?.name}
                  </p>
                  <p className="text-sm text-green-800">
                    <strong>العنوان:</strong> {title}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  نتمنى لكم التوفيق في الهاكاثون! 🚀
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Upload form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            رفع العرض التقديمي 📤
          </h1>
          <p className="text-lg text-gray-600">
            {tokenData?.hackathon?.title}
          </p>
        </motion.div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <User className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">المشارك</p>
                    <p className="font-semibold text-gray-900">{tokenData?.participant?.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">الفريق</p>
                    <p className="font-semibold text-gray-900">{tokenData?.team?.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">معلومات العرض التقديمي</CardTitle>
              <CardDescription>
                يرجى إدخال عنوان العرض التقديمي ورفع الملف
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Title */}
                <div>
                  <Label htmlFor="title" className="text-lg mb-2 block">
                    عنوان العرض التقديمي <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: نظام ذكي لإدارة المشاريع"
                    className="text-lg h-12"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-lg mb-2 block">
                    وصف مختصر (اختياري)
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="وصف مختصر عن المشروع..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <Label htmlFor="file" className="text-lg mb-2 block">
                    ملف العرض التقديمي <span className="text-red-500">*</span>
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#01645e] transition-colors">
                    <input
                      id="file"
                      type="file"
                      accept=".ppt,.pptx,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                    <label htmlFor="file" className="cursor-pointer">
                      {file ? (
                        <div className="space-y-2">
                          <FileText className="w-12 h-12 mx-auto text-green-600" />
                          <p className="text-lg font-semibold text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} ميجابايت
                          </p>
                          <Button type="button" variant="outline" size="sm">
                            تغيير الملف
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-12 h-12 mx-auto text-gray-400" />
                          <p className="text-lg font-semibold text-gray-700">
                            اضغط لاختيار الملف
                          </p>
                          <p className="text-sm text-gray-500">
                            PowerPoint (.ppt, .pptx) أو PDF
                          </p>
                          <p className="text-xs text-gray-400">
                            الحد الأقصى: 10 ميجابايت
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Expiry Warning */}
                {tokenData?.expiresAt && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      صلاحية الرابط تنتهي في:{' '}
                      {new Date(tokenData.expiresAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={uploading || !file || !title.trim()}
                  className="w-full h-14 text-lg bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014d47] hover:to-[#2d9952]"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 ml-2" />
                      رفع العرض التقديمي
                    </>
                  )}
                </Button>

                {/* Important Notes */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-semibold text-yellow-900 mb-2">⚠️ ملاحظات هامة:</p>
                  <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                    <li>يمكنك رفع العرض التقديمي مرة واحدة فقط</li>
                    <li>تأكد من صحة جميع البيانات قبل الرفع</li>
                    <li>سيتم مراجعة العرض التقديمي من قبل المحكمين</li>
                  </ul>
                </div>

              </form>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  )
}

export default function UploadPresentationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#01645e] animate-spin" />
      </div>
    }>
      <UploadPresentationContent />
    </Suspense>
  )
}

