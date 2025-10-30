"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, Eye, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface FormDesign {
  id?: string
  hackathonId: string
  isEnabled: boolean
  template: string
  htmlContent: string
  cssContent: string
  jsContent: string
  settings: {
    theme: string
    backgroundColor: string
    primaryColor: string
    secondaryColor: string
    fontFamily: string
    borderRadius: string
    showHackathonInfo: boolean
    showProgressBar: boolean
    enableAnimations: boolean
  }
}

export default function RegisterFormDesignPageSimple({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params)
  const hackathonId = resolvedParams.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hackathon, setHackathon] = useState<any>(null)
  const [design, setDesign] = useState<FormDesign>({
    hackathonId,
    isEnabled: false,
    template: 'modern',
    htmlContent: '',
    cssContent: '',
    jsContent: '',
    settings: {
      theme: 'modern',
      backgroundColor: '#f8f9fa',
      primaryColor: '#01645e',
      secondaryColor: '#667eea',
      fontFamily: 'Cairo',
      borderRadius: '12px',
      showHackathonInfo: true,
      showProgressBar: true,
      enableAnimations: true
    }
  })

  useEffect(() => {
    console.log('🔍 Component mounted, hackathonId:', hackathonId)
    fetchHackathon()
    fetchDesign()
  }, [hackathonId])

  const fetchHackathon = async () => {
    try {
      console.log('📊 Fetching hackathon...')
      const response = await fetch(`/api/hackathons/${hackathonId}`)
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Hackathon loaded:', data.hackathon?.title)
        setHackathon(data.hackathon)
      } else {
        console.error('❌ Failed to fetch hackathon:', response.status)
      }
    } catch (error) {
      console.error('❌ Error fetching hackathon:', error)
    }
  }

  const fetchDesign = async () => {
    try {
      console.log('📊 Fetching design...')
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/register-form-design`)
      if (response.ok) {
        const data = await response.json()
        if (data.design) {
          console.log('✅ Design loaded:', data.design.template)
          setDesign(data.design)
        } else {
          console.log('⚠️ No design found, using default')
        }
      } else {
        console.error('❌ Failed to fetch design:', response.status)
      }
    } catch (error) {
      console.error('❌ Error fetching design:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveDesign = async () => {
    setSaving(true)
    try {
      console.log('💾 Saving design...')
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/register-form-design`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(design)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Design saved:', result.message)
        alert('تم حفظ التصميم بنجاح!')
      } else {
        console.error('❌ Failed to save design:', response.status)
        alert('خطأ في حفظ التصميم')
      }
    } catch (error) {
      console.error('❌ Error saving design:', error)
      alert('خطأ في الاتصال')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل محرر تصميم الفورم...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/admin/hackathons/${hackathonId}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  العودة
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  🎨 محرر تصميم فورم التسجيل
                </h1>
                <p className="text-gray-600 mt-1">
                  {hackathon?.title || 'جاري التحميل...'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={saveDesign} disabled={saving}>
                <Save className="w-4 h-4 ml-2" />
                {saving ? 'جاري الحفظ...' : 'حفظ التصميم'}
              </Button>
              <Link href={`/api/form/${hackathonId}`} target="_blank">
                <Button variant="outline">
                  <Eye className="w-4 h-4 ml-2" />
                  معاينة
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>⚙️ إعدادات التصميم</CardTitle>
                <CardDescription>
                  تخصيص شكل ومظهر فورم التسجيل
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enable/Disable */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="enabled">تفعيل التصميم المخصص</Label>
                  <Switch
                    id="enabled"
                    checked={design.isEnabled}
                    onCheckedChange={(checked) => 
                      setDesign(prev => ({ ...prev, isEnabled: checked }))
                    }
                  />
                </div>

                {/* Template Selection */}
                <div className="space-y-2">
                  <Label>القالب</Label>
                  <select
                    value={design.template}
                    onChange={(e) => setDesign(prev => ({ ...prev, template: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="modern">عصري</option>
                    <option value="dark">داكن</option>
                    <option value="creative">إبداعي</option>
                  </select>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>اللون الأساسي</Label>
                    <Input
                      type="color"
                      value={design.settings.primaryColor}
                      onChange={(e) => setDesign(prev => ({
                        ...prev,
                        settings: { ...prev.settings, primaryColor: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>اللون الثانوي</Label>
                    <Input
                      type="color"
                      value={design.settings.secondaryColor}
                      onChange={(e) => setDesign(prev => ({
                        ...prev,
                        settings: { ...prev.settings, secondaryColor: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Code Editor */}
            <Card>
              <CardHeader>
                <CardTitle>💻 محرر الكود</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="html" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="html">HTML</TabsTrigger>
                    <TabsTrigger value="css">CSS</TabsTrigger>
                    <TabsTrigger value="js">JavaScript</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="html" className="space-y-2">
                    <Label>HTML Content</Label>
                    <Textarea
                      value={design.htmlContent}
                      onChange={(e) => setDesign(prev => ({ ...prev, htmlContent: e.target.value }))}
                      placeholder="أدخل كود HTML هنا..."
                      className="min-h-[200px] font-mono"
                    />
                  </TabsContent>
                  
                  <TabsContent value="css" className="space-y-2">
                    <Label>CSS Styles</Label>
                    <Textarea
                      value={design.cssContent}
                      onChange={(e) => setDesign(prev => ({ ...prev, cssContent: e.target.value }))}
                      placeholder="أدخل كود CSS هنا..."
                      className="min-h-[200px] font-mono"
                    />
                  </TabsContent>
                  
                  <TabsContent value="js" className="space-y-2">
                    <Label>JavaScript</Label>
                    <Textarea
                      value={design.jsContent}
                      onChange={(e) => setDesign(prev => ({ ...prev, jsContent: e.target.value }))}
                      placeholder="أدخل كود JavaScript هنا..."
                      className="min-h-[200px] font-mono"
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>👁️ معاينة مباشرة</CardTitle>
                <CardDescription>
                  معاينة فورية للتصميم
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-white min-h-[400px]">
                  <div className="text-center text-gray-500">
                    <p>معاينة التصميم ستظهر هنا</p>
                    <p className="text-sm mt-2">
                      القالب الحالي: <strong>{design.template}</strong>
                    </p>
                    <p className="text-sm">
                      الحالة: <strong>{design.isEnabled ? 'مفعل' : 'معطل'}</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
