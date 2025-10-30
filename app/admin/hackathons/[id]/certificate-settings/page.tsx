'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Settings, Save, RotateCcw, Eye, ArrowLeft, Upload } from 'lucide-react'

interface CertificateSettings {
  namePositionY: number
  namePositionX: number
  nameFont: string
  nameColor: string
  certificateTemplate?: string
  lastUpdated?: string
  updatedBy?: string
  hackathonId?: string
}

interface Hackathon {
  id: string
  title: string
  description: string
  status: string
}

export default function HackathonCertificateSettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const hackathonId = params.id as string
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [settings, setSettings] = useState<CertificateSettings>({
    namePositionY: 0.52,
    namePositionX: 0.50,
    nameFont: 'bold 48px Arial',
    nameColor: '#1a472a'
  })
  const [saving, setSaving] = useState(false)
  const [previewName, setPreviewName] = useState('محمد أحمد علي')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [uploadingCertificate, setUploadingCertificate] = useState(false)
  const [certificateImageSrc, setCertificateImageSrc] = useState('/row-certificat.svg')
  const [previewError, setPreviewError] = useState('')

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/admin/dashboard')
      return
    }
    if (hackathonId) {
      loadHackathon()
      loadSettings()
      loadCertificateImage()
    }
  }, [user, router, hackathonId])

  useEffect(() => {
    console.log('Certificate image source changed:', certificateImageSrc)
    setImageLoaded(false)
    loadCertificateImage()
  }, [certificateImageSrc])

  const loadHackathon = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}`)
      if (response.ok) {
        const data = await response.json()
        setHackathon(data.hackathon)
      }
    } catch (error) {
      console.error('Error loading hackathon:', error)
    }
  }

  const loadSettings = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/certificate-settings`)
      if (response.ok) {
        const data = await response.json()
        console.log('📋 Loaded settings:', data)
        setSettings(data)

        // Update certificate image source if custom template exists
        if (data.certificateTemplate) {
          console.log('🖼️ Loading custom certificate template:', data.certificateTemplate)
          setCertificateImageSrc(data.certificateTemplate)
        } else {
          console.log('🖼️ Using default certificate template')
          setCertificateImageSrc('/row-certificat.svg')
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const loadCertificateImage = () => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.error('Canvas not found')
      setPreviewError('لم يتم العثور على منطقة المعاينة')
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('Canvas context not available')
      setPreviewError('خطأ في تهيئة منطقة المعاينة')
      return
    }

    console.log('🖼️ Loading certificate image:', certificateImageSrc)
    setImageLoaded(false)
    setPreviewError('')

    const img = new Image()
    img.onload = () => {
      try {
        console.log('✅ Certificate image loaded successfully')
        console.log('Image dimensions:', img.width, 'x', img.height)

        const scale = 0.6
        canvas.width = img.width * scale
        canvas.height = img.height * scale

        drawCertificate(ctx, canvas, img, scale)
        setImageLoaded(true)
        setPreviewError('')
      } catch (error) {
        console.error('Error processing loaded image:', error)
        setPreviewError('خطأ في معالجة الصورة')
      }
    }

    img.onerror = (error) => {
      console.error('❌ Failed to load certificate image:', certificateImageSrc, error)
      setImageLoaded(false)
      setPreviewError('فشل في تحميل صورة الشهادة. تأكد من وجود الملف.')

      if (certificateImageSrc !== '/row-certificat.svg') {
        console.log('🔄 Trying fallback to default certificate')
        setCertificateImageSrc('/row-certificat.svg')
      }
    }

    img.crossOrigin = 'anonymous'
    img.src = `${certificateImageSrc}?t=${Date.now()}&cache=false`
  }

  const drawCertificate = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    img: HTMLImageElement,
    scale: number
  ) => {
    try {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const nameX = canvas.width * settings.namePositionX
      const nameY = canvas.height * settings.namePositionY

      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = settings.nameColor

      const fontSize = parseInt(settings.nameFont.match(/(\d+)px/)?.[1] || '48') * scale
      const fontFamily = settings.nameFont.replace(/bold\s+\d+px\s+/, '') || 'Arial'
      ctx.font = `bold ${fontSize}px ${fontFamily}`

      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 2
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1

      ctx.fillText(previewName, nameX, nameY)

      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Draw position indicators
      ctx.strokeStyle = '#ff4444'
      ctx.lineWidth = 2
      ctx.setLineDash([8, 4])

      ctx.beginPath()
      ctx.moveTo(Math.max(0, nameX - 120), nameY)
      ctx.lineTo(Math.min(canvas.width, nameX + 120), nameY)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(nameX, Math.max(0, nameY - 40))
      ctx.lineTo(nameX, Math.min(canvas.height, nameY + 40))
      ctx.stroke()

      ctx.setLineDash([])
      ctx.fillStyle = '#ff4444'
      ctx.beginPath()
      ctx.arc(nameX, nameY, 4, 0, 2 * Math.PI)
      ctx.fill()

      setPreviewError('')
    } catch (error) {
      console.error('Error drawing certificate:', error)
      setPreviewError('خطأ في رسم الشهادة')
    }
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !imageLoaded) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const newPositionX = x / canvas.width
    const newPositionY = y / canvas.height

    const clampedPositionX = Math.max(0.05, Math.min(0.95, newPositionX))
    const clampedPositionY = Math.max(0.15, Math.min(0.85, newPositionY))

    setSettings(prev => ({
      ...prev,
      namePositionX: clampedPositionX,
      namePositionY: clampedPositionY
    }))

    const ctx = canvas.getContext('2d')
    if (ctx) {
      const img = new Image()
      img.onload = () => drawCertificate(ctx, canvas, img, 0.6)
      img.src = `${certificateImageSrc}?t=${Date.now()}`
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/certificate-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          certificateTemplate: certificateImageSrc !== '/row-certificat.svg' ? certificateImageSrc : undefined,
          updatedBy: user?.name || 'admin'
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert('✅ تم حفظ إعدادات الشهادة بنجاح!\nسيتم تطبيقها على جميع الشهادات الجديدة لهذا الهاكاثون.')
        setSettings(result.settings)

        const canvas = canvasRef.current
        if (canvas && imageLoaded) {
          const ctx = canvas.getContext('2d')
          if (ctx) {
            const img = new Image()
            img.onload = () => drawCertificate(ctx, canvas, img, 0.6)
            img.src = `${certificateImageSrc}?t=${Date.now()}`
          }
        }
      } else {
        const error = await response.json()
        alert(`❌ خطأ في الحفظ: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('❌ حدث خطأ في حفظ الإعدادات')
    } finally {
      setSaving(false)
    }
  }

  const handleCertificateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('📤 Starting certificate upload:', file.name, file.size, file.type)

    const maxSize = 4 * 1024 * 1024 // 4MB
    if (file.size > maxSize) {
      alert('حجم الملف كبير جداً. الحد الأقصى المسموح 4 ميجابايت.')
      event.target.value = ''
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('نوع الملف غير مدعوم. يرجى اختيار صورة (JPG, PNG, WebP).')
      event.target.value = ''
      return
    }

    setUploadingCertificate(true)
    setPreviewError('')

    try {
      const formData = new FormData()
      formData.append('certificateTemplate', file)

      const response = await fetch(`/api/admin/hackathons/${hackathonId}/certificate-template`, {
        method: 'POST',
        body: formData
      })

      console.log('📡 Upload response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Upload successful:', data)

        const newImageSrc = `${data.filePath}?t=${Date.now()}`
        console.log('🖼️ New image source:', newImageSrc)

        setCertificateImageSrc(newImageSrc)
        
        // Update settings to include the new template
        setSettings(prev => ({
          ...prev,
          certificateTemplate: data.filePath
        }))

        alert('✅ تم رفع قالب الشهادة بنجاح!')

        // Reload settings to ensure consistency
        setTimeout(() => {
          console.log('🔄 Reloading settings and certificate image...')
          loadSettings()
        }, 500)

      } else {
        const errorData = await response.json()
        console.error('❌ Upload failed:', errorData)
        alert(`❌ خطأ في رفع قالب الشهادة: ${errorData.error}`)
        setPreviewError(`خطأ في الرفع: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error uploading certificate template:', error)
      alert('❌ حدث خطأ في رفع قالب الشهادة')
    } finally {
      setUploadingCertificate(false)
      event.target.value = ''
    }
  }

  const resetToDefault = async () => {
    if (!confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟ سيتم حذف القالب المخصص أيضاً.')) {
      return
    }

    try {
      // Delete custom template
      const deleteResponse = await fetch(`/api/admin/hackathons/${hackathonId}/certificate-template`, {
        method: 'DELETE'
      })

      if (deleteResponse.ok) {
        const defaultSettings = {
          namePositionY: 0.52,
          namePositionX: 0.50,
          nameFont: 'bold 48px Arial',
          nameColor: '#1a472a'
        }
        
        setSettings(defaultSettings)
        setCertificateImageSrc('/row-certificat.svg')
        
        // Save default settings
        const response = await fetch(`/api/admin/hackathons/${hackathonId}/certificate-settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...defaultSettings,
            updatedBy: user?.name || 'admin'
          })
        })

        if (response.ok) {
          alert('✅ تم إعادة تعيين الإعدادات إلى القيم الافتراضية')
          loadCertificateImage()
        }
      }
    } catch (error) {
      console.error('Error resetting settings:', error)
      alert('❌ حدث خطأ في إعادة تعيين الإعدادات')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0fdf4]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => router.push('/admin/certificate-settings/select-hackathon')}
              className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#c3e956] to-[#3ab666] rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-[#01645e] to-[#3ab666] p-6 rounded-full shadow-2xl w-24 h-24 flex items-center justify-center">
                <Settings className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#01645e] via-[#3ab666] to-[#c3e956] bg-clip-text text-transparent mb-2">
            🏆 إعدادات الشهادة
          </h1>
          {hackathon && (
            <h2 className="text-2xl font-bold text-[#01645e] mb-4">{hackathon.title}</h2>
          )}
          <p className="text-[#8b7632] text-lg">اضغط على الشهادة لتحديد موضع الاسم</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Certificate Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl">
              <h2 className="text-xl font-bold text-[#01645e] mb-4">معاينة الشهادة</h2>
              <p className="text-sm text-[#8b7632] mb-4">
                💡 اضغط في أي مكان على الشهادة لتحديد موضع الاسم
              </p>
              
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="border border-gray-300 rounded-lg shadow-lg cursor-crosshair hover:shadow-xl transition-shadow"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>

              {/* Loading State */}
              {!imageLoaded && !previewError && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01645e] mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل الشهادة...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {previewError && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <p className="text-red-600 font-medium">{previewError}</p>
                    <button
                      onClick={() => {
                        setPreviewError('')
                        loadCertificateImage()
                      }}
                      className="mt-4 px-4 py-2 bg-[#01645e] text-white rounded-lg hover:bg-[#01645e]/90 transition-colors"
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Settings Panel */}
          <div className="space-y-6">
            {/* Position Settings */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl">
              <h3 className="text-lg font-bold text-[#01645e] mb-4">إعدادات الموضع</h3>
              
              <div className="space-y-4">
                {/* Vertical Position */}
                <div>
                  <label className="block text-sm font-medium text-[#01645e] mb-2">
                    الموضع العمودي: {(settings.namePositionY * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.2"
                    max="0.8"
                    step="0.01"
                    value={settings.namePositionY}
                    onChange={(e) => {
                      const newPosition = parseFloat(e.target.value)
                      setSettings(prev => ({ ...prev, namePositionY: newPosition }))

                      const canvas = canvasRef.current
                      if (canvas && imageLoaded) {
                        const ctx = canvas.getContext('2d')
                        if (ctx) {
                          const img = new Image()
                          img.onload = () => drawCertificate(ctx, canvas, img, 0.6)
                          img.src = `${certificateImageSrc}?t=${Date.now()}`
                        }
                      }
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Horizontal Position */}
                <div>
                  <label className="block text-sm font-medium text-[#01645e] mb-2">
                    الموضع الأفقي: {(settings.namePositionX * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.01"
                    value={settings.namePositionX}
                    onChange={(e) => {
                      const newPosition = parseFloat(e.target.value)
                      setSettings(prev => ({ ...prev, namePositionX: newPosition }))

                      const canvas = canvasRef.current
                      if (canvas && imageLoaded) {
                        const ctx = canvas.getContext('2d')
                        if (ctx) {
                          const img = new Image()
                          img.onload = () => drawCertificate(ctx, canvas, img, 0.6)
                          img.src = `${certificateImageSrc}?t=${Date.now()}`
                        }
                      }
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium text-[#01645e] mb-2">
                    لون الاسم
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.nameColor}
                      onChange={(e) => {
                        const newColor = e.target.value
                        setSettings(prev => ({ ...prev, nameColor: newColor }))

                        const canvas = canvasRef.current
                        if (canvas && imageLoaded) {
                          const ctx = canvas.getContext('2d')
                          if (ctx) {
                            const img = new Image()
                            img.onload = () => drawCertificate(ctx, canvas, img, 0.6)
                            img.src = `${certificateImageSrc}?t=${Date.now()}`
                          }
                        }
                      }}
                      className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">{settings.nameColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#01645e] mb-2">
                    اسم المعاينة
                  </label>
                  <input
                    type="text"
                    value={previewName}
                    onChange={(e) => {
                      setPreviewName(e.target.value)
                      
                      const canvas = canvasRef.current
                      if (canvas && imageLoaded) {
                        const ctx = canvas.getContext('2d')
                        if (ctx) {
                          const img = new Image()
                          img.onload = () => drawCertificate(ctx, canvas, img, 0.6)
                          img.src = `${certificateImageSrc}?t=${Date.now()}`
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01645e] focus:border-transparent"
                    placeholder="أدخل اسم للمعاينة"
                  />
                </div>
              </div>
            </div>

            {/* Certificate Template Upload */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl">
              <h3 className="text-lg font-bold text-[#01645e] mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                رفع قالب شهادة مخصص
              </h3>

              <div className="space-y-4">
                {/* Current Template Info */}
                {certificateImageSrc !== '/row-certificat.svg' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-green-800">✅ قالب مخصص نشط</h4>
                        <p className="text-sm text-green-600">يتم استخدام قالب شهادة مخصص لهذا الهاكاثون</p>
                      </div>
                      <button
                        onClick={resetToDefault}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                      >
                        حذف القالب
                      </button>
                    </div>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#01645e] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCertificateUpload}
                    className="hidden"
                    id="certificate-upload"
                    disabled={uploadingCertificate}
                  />
                  <label htmlFor="certificate-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-[#01645e] font-medium">
                          {uploadingCertificate ? 'جاري رفع الشهادة...' : 'اضغط لاختيار صورة الشهادة أو اسحب الملف هنا'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          الملفات المدعومة: JPG, PNG, WebP
                        </p>
                        <p className="text-xs text-gray-500">
                          الحد الأقصى لحجم الملف: 4 ميجابايت
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>• سيتم استخدام هذا القالب لجميع الشهادات في هذا الهاكاثون فقط</p>
                  <p>• الأبعاد المقترحة: 1920x1080 بكسل أو أكبر</p>
                  <p>• تأكد من وجود مساحة كافية لكتابة الاسم</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl">
              <h3 className="text-lg font-bold text-[#01645e] mb-4">الإجراءات</h3>
              
              <div className="space-y-3">
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-4 py-3 rounded-lg font-bold shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                </button>

                <button
                  onClick={resetToDefault}
                  className="w-full bg-gradient-to-r from-[#8b7632] to-[#c3e956] text-white px-4 py-3 rounded-lg font-bold shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  إعادة تعيين
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
