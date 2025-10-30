'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Copy, Check, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ImageUploaderPage() {
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image too large (max 10MB)')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setUploadedUrl(data.url)
      } else {
        alert('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(uploadedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            مركز رفع الصور
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            ارفع صورك على Cloudinary واحصل على الرابط المباشر
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8"
        >
          {/* Upload Area */}
          <div className="mb-8">
            <label className="flex flex-col items-center justify-center gap-4 p-12 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-indigo-600 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-1">جاري الرفع...</p>
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-16 w-16 text-indigo-600" />
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      اضغط لاختيار صورة
                    </p>
                    <p className="text-sm text-gray-500">
                      JPG, PNG, GIF, WebP (حد أقصى 10MB)
                    </p>
                  </div>
                </>
              )}
            </label>
          </div>

          {/* Result */}
          {uploadedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Preview */}
              <div className="rounded-lg overflow-hidden">
                <img
                  src={uploadedUrl}
                  alt="Uploaded"
                  className="w-full h-auto"
                />
              </div>

              {/* URL */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={uploadedUrl}
                  readOnly
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono text-gray-900 dark:text-white"
                />
                <Button
                  onClick={copyToClipboard}
                  className={`px-6 ${
                    copied
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      تم النسخ
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      نسخ
                    </>
                  )}
                </Button>
              </div>

              {/* Info */}
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  ✅ تم رفع الصورة بنجاح على Cloudinary! يمكنك استخدام الرابط أعلاه في أي مكان.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white"
        >
          <h3 className="text-xl font-bold mb-4">📝 كيفية الاستخدام:</h3>
          <ol className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>اضغط على منطقة الرفع واختر الصورة من جهازك</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>انتظر حتى يتم رفع الصورة على Cloudinary</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>انسخ الرابط واستخدمه في محتوى المقال</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">4.</span>
              <span>في HTML: <code className="bg-white/20 px-2 py-1 rounded">&lt;img src="الرابط" /&gt;</code></span>
            </li>
          </ol>
        </motion.div>
      </div>
    </div>
  )
}
