'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface ParticipantsImportProps {
  hackathonId: string
  onImportComplete?: () => void
}

interface ImportResult {
  success: boolean
  message: string
  summary: {
    total: number
    processed: number
    errors: number
  }
  participants: Array<{
    name: string
    email: string
    status: string
    registration: string
  }>
  errors: string[]
}

export default function ParticipantsImport({ hackathonId, onImportComplete }: ParticipantsImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [showResult, setShowResult] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
      setShowResult(false)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('participantsFile', file)

      const response = await fetch(`/api/admin/hackathons/${hackathonId}/import-participants`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        setShowResult(true)
        if (onImportComplete) {
          onImportComplete()
        }
      } else {
        alert(`خطأ: ${data.error}`)
      }
    } catch (error) {
      console.error('Error importing participants:', error)
      alert('حدث خطأ أثناء استيراد المشاركين')
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    // Create a sample Excel template with all supported columns
    const csvContent = `Name,Email,Phone,University,Major,Year,City,Nationality,Skills,Experience,PreferredRole,Bio,Github,Linkedin,Portfolio,WorkExperience
أحمد محمد,ahmed@example.com,0501234567,جامعة الملك سعود,علوم الحاسب,الثالثة,الرياض,سعودي,Python|JavaScript|React,3 سنوات,Full Stack Developer,مطور برمجيات متحمس,github.com/ahmed,linkedin.com/in/ahmed,portfolio.com/ahmed,مطور في شركة تقنية
فاطمة علي,fatima@example.com,0509876543,جامعة الأميرة نورة,هندسة البرمجيات,الثانية,جدة,سعودية,Java|SQL|Spring,سنة واحدة,Backend Developer,مهندسة برمجيات طموحة,github.com/fatima,linkedin.com/in/fatima,portfolio.com/fatima,متدربة في شركة برمجيات
محمد خالد,mohammed@example.com,0512345678,جامعة الإمام,نظم المعلومات,الرابعة,الدمام,سعودي,UI/UX|Figma|Adobe XD,سنتان,UI/UX Designer,مصمم واجهات مستخدم,github.com/mohammed,linkedin.com/in/mohammed,portfolio.com/mohammed,مصمم في وكالة تصميم`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'participants_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">استيراد المشاركين</h3>
        <button
          onClick={downloadTemplate}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          📥 تحميل القالب
        </button>
      </div>

      <div className="space-y-4">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اختر ملف Excel أو CSV
          </label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              الملف المحدد: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">تعليمات الاستيراد:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• الملف يجب أن يحتوي على عمودي الاسم والإيميل على الأقل</li>
            <li>• <strong>الأعمدة الأساسية:</strong> Name, Email, Phone, University, Major, Year</li>
            <li>• <strong>الأعمدة الإضافية:</strong> City, Nationality, Skills, Experience, PreferredRole, Bio, Github, Linkedin, Portfolio, WorkExperience</li>
            <li>• يمكن استخدام الأسماء بالعربية أو الإنجليزية</li>
            <li>• سيتم إنشاء حسابات جديدة للمستخدمين غير الموجودين</li>
            <li>• سيتم قبول جميع المشاركين تلقائياً</li>
          </ul>
        </div>

        {/* Import Button */}
        <button
          onClick={handleImport}
          disabled={!file || isUploading}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
            !file || isUploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isUploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              جاري الاستيراد...
            </div>
          ) : (
            '📤 استيراد المشاركين'
          )}
        </button>
      </div>

      {/* Results */}
      {showResult && result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200"
        >
          <h4 className="font-semibold text-green-800 mb-3">نتائج الاستيراد</h4>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{result.summary.total}</div>
              <div className="text-sm text-gray-600">إجمالي الصفوف</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{result.summary.processed}</div>
              <div className="text-sm text-gray-600">تم المعالجة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{result.summary.errors}</div>
              <div className="text-sm text-gray-600">أخطاء</div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="mt-4">
              <h5 className="font-semibold text-red-800 mb-2">الأخطاء:</h5>
              <ul className="text-sm text-red-700 space-y-1">
                {result.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4">
            <p className="text-green-700 font-medium">{result.message}</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
