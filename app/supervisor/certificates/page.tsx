'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Settings, Save, RotateCcw, Upload, Loader2, Award, Info, Users, Gavel, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

type CertificateType = 'participant' | 'judge' | 'supervisor'

interface CertificateSettings {
  namePositionY: number
  namePositionX: number
  nameFont: string
  nameColor: string
  certificateTemplate?: string
}

interface Hackathon {
  id: string
  title: string
  description: string
  status: string
}

const CERTIFICATE_TYPES = [
  { value: 'participant' as CertificateType, label: 'شهادة المشاركين', icon: Users, color: 'blue' },
  { value: 'judge' as CertificateType, label: 'شهادة المحكمين', icon: Gavel, color: 'purple' },
  { value: 'supervisor' as CertificateType, label: 'شهادة المشرفين', icon: Shield, color: 'green' }
]

export default function SupervisorCertificatesPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [selectedHackathon, setSelectedHackathon] = useState<string>('')
  const [certificateType, setCertificateType] = useState<CertificateType>('participant')

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHackathons()
  }, [])

  useEffect(() => {
    if (selectedHackathon) {
      loadSettings()
    }
  }, [selectedHackathon, certificateType])

  useEffect(() => {
    if (imageLoaded) {
      redrawCertificate()
    }
  }, [settings.namePositionX, settings.namePositionY, settings.nameColor, previewName, imageLoaded])

  const loadHackathons = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/supervisor/hackathons', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setHackathons(data.hackathons || [])
      }
    } catch (error) {
      console.error('Error loading hackathons:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      const response = await fetch(
        `/api/admin/hackathons/${selectedHackathon}/certificate-settings?type=${certificateType}`,
        { credentials: 'include' }
      )
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        setCertificateImageSrc(data.certificateTemplate || '/row-certificat.svg')
        loadCertificateImage(data.certificateTemplate || '/row-certificat.svg')
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const loadCertificateImage = (imageSrc: string) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setImageLoaded(false)

    const img = new Image()
    img.onload = () => {
      const scale = 0.6
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      drawCertificate(ctx, canvas, img, scale)
      setImageLoaded(true)
    }

    img.onerror = () => {
      setImageLoaded(false)
      if (imageSrc !== '/row-certificat.svg') {
        setCertificateImageSrc('/row-certificat.svg')
      }
    }

    img.crossOrigin = 'anonymous'
    img.src = `${imageSrc}?t=${Date.now()}`
  }

  const drawCertificate = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, img: HTMLImageElement, scale: number) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    ctx.font = settings.nameFont
    ctx.fillStyle = settings.nameColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const x = canvas.width * settings.namePositionX
    const y = canvas.height * settings.namePositionY

    ctx.fillText(previewName, x, y)
  }

  const redrawCertificate = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      const scale = 0.6
      drawCertificate(ctx, canvas, img, scale)
    }
    img.crossOrigin = 'anonymous'
    img.src = `${certificateImageSrc}?t=${Date.now()}`
  }

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار ملف صورة',
        variant: 'destructive'
      })
      return
    }

    try {
      setUploadingCertificate(true)
      const formData = new FormData()
      formData.append('certificateImage', file)
      formData.append('hackathonId', selectedHackathon)
      formData.append('certificateType', certificateType)

      const response = await fetch(`/api/supervisor/certificate-template/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Certificate uploaded:', data.url)
        
        // Update settings with new template URL
        const newUrl = data.url
        setSettings(prev => ({
          ...prev,
          certificateTemplate: newUrl
        }))
        setCertificateImageSrc(newUrl)
        
        // Force reload the image with cache busting - longer delay to ensure Cloudinary has the image
        setImageLoaded(false)
        setTimeout(() => {
          loadCertificateImage(newUrl)
        }, 500)
        
        toast({
          title: 'نجح',
          description: 'تم رفع قالب الشهادة بنجاح'
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل رفع الملف')
      }
    } catch (error: any) {
      console.error('❌ Upload error:', error)
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء رفع الملف',
        variant: 'destructive'
      })
    } finally {
      setUploadingCertificate(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      // Update settings object with current certificateImageSrc before saving
      const settingsToSave = {
        ...settings,
        certificateTemplate: certificateImageSrc,
        type: certificateType
      }
      
      const response = await fetch(`/api/admin/hackathons/${selectedHackathon}/certificate-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsToSave),
        credentials: 'include'
      })

      if (response.ok) {
        // Update the settings state with the saved template URL
        setSettings(prev => ({
          ...prev,
          certificateTemplate: certificateImageSrc
        }))
        
        toast({
          title: 'نجح',
          description: `تم حفظ إعدادات ${CERTIFICATE_TYPES.find(t => t.value === certificateType)?.label} بنجاح`
        })
      } else {
        throw new Error('فشل الحفظ')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ الإعدادات',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings({
      namePositionY: 0.52,
      namePositionX: 0.50,
      nameFont: 'bold 48px Arial',
      nameColor: '#1a472a'
    })
    setCertificateImageSrc('/row-certificat.svg')
    loadCertificateImage('/row-certificat.svg')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
          <Award className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إعدادات الشهادات</h1>
          <p className="text-gray-600">رفع قوالب الشهادات وتعديل موضع الاسم</p>
        </div>
      </motion.div>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-5 w-5 text-blue-600" />
        <AlertTitle className="text-blue-900 font-semibold">ملاحظة مهمة</AlertTitle>
        <AlertDescription className="text-blue-800">
          هذه الصفحة مخصصة لرفع قوالب الشهادات (مشاركين، محكمين، مشرفين) وتعديل موضع الاسم فقط.
          <br />
          <strong>إرسال الشهادات يتم من صفحة الأدمن بعد إعلان النتائج.</strong>
        </AlertDescription>
      </Alert>

      {/* Hackathon Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            اختيار الهاكاثون
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedHackathon} onValueChange={setSelectedHackathon}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر هاكاثون" />
            </SelectTrigger>
            <SelectContent>
              {hackathons.map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  {h.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedHackathon && (
        <Tabs value={certificateType} onValueChange={(v) => setCertificateType(v as CertificateType)}>
          <TabsList className="grid w-full grid-cols-3">
            {CERTIFICATE_TYPES.map((type) => {
              const Icon = type.icon
              return (
                <TabsTrigger key={type.value} value={type.value} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {type.label}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {CERTIFICATE_TYPES.map((type) => (
            <TabsContent key={type.value} value={type.value} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Settings Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      رفع قالب {type.label}
                    </CardTitle>
                    <CardDescription>
                      ارفع صورة قالب الشهادة وعدّل موضع الاسم
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Upload Certificate */}
                    <div>
                      <Label>رفع قالب الشهادة</Label>
                      <div className="mt-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleCertificateUpload}
                          disabled={uploadingCertificate}
                        />
                      </div>
                      {uploadingCertificate && (
                        <p className="text-sm text-gray-500 mt-2">جاري الرفع...</p>
                      )}
                    </div>

                    {/* Position Y */}
                    <div>
                      <Label>موضع الاسم عمودياً (Y): {(settings.namePositionY * 100).toFixed(0)}%</Label>
                      <Input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={settings.namePositionY}
                        onChange={(e) => setSettings({ ...settings, namePositionY: parseFloat(e.target.value) })}
                        className="mt-2"
                      />
                    </div>

                    {/* Position X */}
                    <div>
                      <Label>موضع الاسم أفقياً (X): {(settings.namePositionX * 100).toFixed(0)}%</Label>
                      <Input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={settings.namePositionX}
                        onChange={(e) => setSettings({ ...settings, namePositionX: parseFloat(e.target.value) })}
                        className="mt-2"
                      />
                    </div>

                    {/* Color */}
                    <div>
                      <Label>لون الاسم</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="color"
                          value={settings.nameColor}
                          onChange={(e) => setSettings({ ...settings, nameColor: e.target.value })}
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          value={settings.nameColor}
                          onChange={(e) => setSettings({ ...settings, nameColor: e.target.value })}
                          placeholder="#1a472a"
                        />
                      </div>
                    </div>

                    {/* Preview Name */}
                    <div>
                      <Label>اسم المعاينة</Label>
                      <Input
                        type="text"
                        value={previewName}
                        onChange={(e) => setPreviewName(e.target.value)}
                        placeholder="محمد أحمد علي"
                        className="mt-2"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={saving} className="flex-1">
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                            جاري الحفظ...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 ml-2" />
                            حفظ الإعدادات
                          </>
                        )}
                      </Button>
                      <Button onClick={handleReset} variant="outline">
                        <RotateCcw className="w-4 h-4 ml-2" />
                        إعادة تعيين
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Preview Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>معاينة الشهادة</CardTitle>
                    <CardDescription>
                      معاينة مباشرة للشهادة مع الاسم
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <canvas
                        ref={canvasRef}
                        className="w-full h-auto border border-gray-300 rounded"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}