"use client"

import React, { useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Upload, Download, FileSpreadsheet, Users, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'

interface UploadResult {
  message: string
  summary: {
    totalRows: number
    newParticipants: number
    existingParticipants: number
    creationErrors: number
  }
  createdParticipants: Array<{ name: string; email: string; participantId: string }>
  existingParticipants: Array<{ name: string; email: string }>
  creationErrors: string[]
}

interface UploadError {
  error: string
  errors?: string[]
  totalErrors?: number
  processedRows?: number
  totalRows?: number
}

export default function BulkUploadPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const hackathonId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [uploadError, setUploadError] = useState<UploadError | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  React.useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/admin/dashboard')
      return
    }
  }, [user, authLoading, router])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadResult(null)
      setUploadError(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('يرجى اختيار ملف أولاً')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setUploadResult(null)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch(`/api/admin/hackathons/${hackathonId}/bulk-upload`, {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()

      if (response.ok) {
        setUploadResult(result)
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        setUploadError(result)
      }

    } catch (error) {
      console.error('Error uploading file:', error)
      setUploadError({ error: 'حدث خطأ في رفع الملف' })
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }

  const downloadTemplate = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/bulk-upload/template`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `template_participants.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('خطأ في تحميل القالب')
      }
    } catch (error) {
      console.error('Error downloading template:', error)
      alert('حدث خطأ في تحميل القالب')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#01645e] font-medium">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/20 to-[#3ab666]/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/admin/hackathons/${hackathonId}`}>
              <Button variant="outline" size="sm">
                <ArrowRight className="w-4 h-4 ml-2" />
                العودة للهاكاثون
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#01645e] mb-2">رفع بيانات المشاركين</h1>
              <p className="text-[#8b7632]">رفع بيانات المشاركين من ملف Excel أو CSV</p>
            </div>
            <Badge className="bg-[#3ab666] text-white">
              <Upload className="w-4 h-4 ml-1" />
              رفع مجمع
            </Badge>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-[#01645e] flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                تعليمات الرفع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-[#01645e] mb-2">الخطوات:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-[#8b7632]">
                    <li>قم بتحميل قالب Excel</li>
                    <li>املأ البيانات في القالب</li>
                    <li>احفظ الملف بصيغة Excel أو CSV</li>
                    <li>ارفع الملف هنا</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold text-[#01645e] mb-2">الحقول المطلوبة:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-[#8b7632]">
                    <li>الاسم الكامل</li>
                    <li>البريد الإلكتروني</li>
                    <li>رقم الهاتف</li>
                    <li>المدينة</li>
                    <li>الجنسية</li>
                    <li>التخصص المفضل</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-center pt-4">
                <Button
                  onClick={downloadTemplate}
                  variant="outline"
                  className="border-[#3ab666] text-[#3ab666] hover:bg-[#3ab666] hover:text-white"
                >
                  <Download className="w-4 h-4 ml-2" />
                  تحميل قالب Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-[#01645e]">رفع الملف</CardTitle>
              <CardDescription>
                اختر ملف Excel (.xlsx, .xls) أو CSV يحتوي على بيانات المشاركين
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-[#3ab666]/30 rounded-lg p-8 text-center">
                <FileSpreadsheet className="w-12 h-12 text-[#3ab666] mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-[#01645e] font-medium">
                    {selectedFile ? selectedFile.name : 'اختر ملف البيانات'}
                  </p>
                  <p className="text-sm text-[#8b7632]">
                    Excel (.xlsx, .xls) أو CSV
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="mt-4"
                  disabled={uploading}
                >
                  اختيار ملف
                </Button>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between bg-[#3ab666]/10 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-[#3ab666]" />
                    <div>
                      <p className="font-medium text-[#01645e]">{selectedFile.name}</p>
                      <p className="text-sm text-[#8b7632]">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="bg-gradient-to-r from-[#01645e] to-[#3ab666]"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin ml-2" />
                        جاري الرفع...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 ml-2" />
                        رفع البيانات
                      </>
                    )}
                  </Button>
                </div>
              )}

              {uploading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#01645e]">تقدم الرفع</span>
                    <span className="text-[#8b7632]">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upload Results */}
        {uploadResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  تم الرفع بنجاح
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{uploadResult.summary.totalRows}</div>
                    <div className="text-sm text-blue-800">إجمالي الصفوف</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{uploadResult.summary.newParticipants}</div>
                    <div className="text-sm text-green-800">مشاركين جدد</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{uploadResult.summary.existingParticipants}</div>
                    <div className="text-sm text-yellow-800">موجودين مسبقاً</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{uploadResult.summary.creationErrors}</div>
                    <div className="text-sm text-red-800">أخطاء</div>
                  </div>
                </div>

                {/* Created Participants */}
                {uploadResult.createdParticipants.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-[#01645e] mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      المشاركين الجدد ({uploadResult.createdParticipants.length})
                    </h4>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {uploadResult.createdParticipants.slice(0, 10).map((participant, index) => (
                        <div key={index} className="flex items-center justify-between bg-green-50 rounded p-2">
                          <span className="font-medium text-green-800">{participant.name}</span>
                          <span className="text-sm text-green-600">{participant.email}</span>
                        </div>
                      ))}
                      {uploadResult.createdParticipants.length > 10 && (
                        <p className="text-sm text-[#8b7632] text-center">
                          و {uploadResult.createdParticipants.length - 10} مشارك آخر...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Creation Errors */}
                {uploadResult.creationErrors.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      أخطاء الإنشاء ({uploadResult.creationErrors.length})
                    </h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {uploadResult.creationErrors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 bg-red-50 rounded p-2">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Upload Errors */}
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  خطأ في الرفع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-red-600 font-medium">{uploadError.error}</p>
                
                {uploadError.errors && (
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">
                      الأخطاء ({uploadError.totalErrors || uploadError.errors.length}):
                    </h4>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {uploadError.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 bg-red-50 rounded p-2">
                          {error}
                        </div>
                      ))}
                    </div>
                    {uploadError.totalErrors && uploadError.totalErrors > uploadError.errors.length && (
                      <p className="text-sm text-[#8b7632] mt-2">
                        و {uploadError.totalErrors - uploadError.errors.length} خطأ آخر...
                      </p>
                    )}
                  </div>
                )}

                {uploadError.processedRows !== undefined && uploadError.totalRows !== undefined && (
                  <div className="bg-yellow-50 rounded p-3">
                    <p className="text-sm text-yellow-800">
                      تم معالجة {uploadError.processedRows} من أصل {uploadError.totalRows} صف بنجاح
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
