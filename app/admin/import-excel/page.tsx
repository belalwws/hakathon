'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, Download, CheckCircle2, XCircle, AlertCircle, FileSpreadsheet } from 'lucide-react'
import { motion } from 'framer-motion'
import { useModal } from '@/hooks/use-modal'

export default function ImportExcelPage() {
  const [hackathons, setHackathons] = useState<any[]>([])
  const [selectedHackathon, setSelectedHackathon] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const { showSuccess, showError, ModalComponents } = useModal()

  useEffect(() => {
    fetchHackathons()
  }, [])

  const fetchHackathons = async () => {
    try {
      const response = await fetch('/api/admin/hackathons')
      if (response.ok) {
        const data = await response.json()
        setHackathons(data.hackathons || [])
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      
      // Validate file type
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        showError('يرجى اختيار ملف Excel (.xlsx أو .xls)')
        return
      }
      
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file || !selectedHackathon) {
      showError('يرجى اختيار الهاكاثون والملف')
      return
    }

    setUploading(true)
    setResults(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('hackathonId', selectedHackathon)

      const response = await fetch('/api/admin/import-excel', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setResults(data)
        showSuccess(`تم استيراد ${data.successCount} مشارك بنجاح!`)
      } else {
        showError(data.error || 'فشل في استيراد الملف')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      showError('حدث خطأ في رفع الملف')
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    // Create CSV template
    const template = `الاسم,البريد الإلكتروني,رقم الجوال,المؤسسة,الدور المفضل
أحمد محمد,ahmed@example.com,0501234567,جامعة الملك سعود,مطور
فاطمة علي,fatima@example.com,0509876543,جامعة الأميرة نورة,مصممة`

    const blob = new Blob(['\ufeff' + template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'participants-template.csv'
    link.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-[#01645e] mb-2">
            استيراد المشاركين من Excel
          </h1>
          <p className="text-[#8b7632]">
            ارفع ملف Excel لإضافة مشاركين بشكل جماعي
          </p>
        </motion.div>

        {/* Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              تعليمات الاستخدام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <Badge className="bg-[#01645e] mt-1">1</Badge>
              <p>حمّل القالب المثالي أدناه</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-[#01645e] mt-1">2</Badge>
              <p>املأ البيانات في ملف Excel (الأعمدة المطلوبة: الاسم، البريد الإلكتروني)</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-[#01645e] mt-1">3</Badge>
              <p>الأعمدة الاختيارية: رقم الجوال، المؤسسة، الدور المفضل</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-[#01645e] mt-1">4</Badge>
              <p>اختر الهاكاثون وارفع الملف</p>
            </div>
            
            <Button
              onClick={downloadTemplate}
              variant="outline"
              className="mt-4"
            >
              <Download className="w-4 h-4 ml-2" />
              تحميل القالب المثالي
            </Button>
          </CardContent>
        </Card>

        {/* Upload Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#01645e]" />
              رفع ملف Excel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Hackathon Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">اختر الهاكاثون:</label>
              <Select value={selectedHackathon} onValueChange={setSelectedHackathon}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الهاكاثون" />
                </SelectTrigger>
                <SelectContent>
                  {hackathons.map(h => (
                    <SelectItem key={h.id} value={h.id}>{h.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">اختر ملف Excel:</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#01645e] transition-colors">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-[#01645e] mx-auto mb-4" />
                  {file ? (
                    <div>
                      <p className="text-[#01645e] font-semibold">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[#01645e] font-semibold">اضغط لاختيار ملف</p>
                      <p className="text-sm text-gray-500">أو اسحب الملف هنا</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!file || !selectedHackathon || uploading}
              className="w-full bg-gradient-to-r from-[#01645e] to-[#3ab666]"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 ml-2" />
                  رفع واستيراد
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                نتائج الاستيراد
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{results.successCount}</p>
                  <p className="text-sm text-gray-600">نجح</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-3xl font-bold text-red-600">{results.errorCount}</p>
                  <p className="text-sm text-gray-600">فشل</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{results.totalRows}</p>
                  <p className="text-sm text-gray-600">إجمالي</p>
                </div>
              </div>

              {results.errors && results.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-red-600 mb-2">الأخطاء:</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {results.errors.map((error: any, index: number) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded">
                        <XCircle className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-semibold">الصف {error.row}:</p>
                          <p className="text-red-700">{error.error}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <ModalComponents />
    </div>
  )
}

