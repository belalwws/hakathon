"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
// Temporarily using native select due to Select component import issues
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Save, Eye, ArrowLeft, Settings, Palette, Code, Monitor, Smartphone, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { ImageUploader } from '@/components/admin/ImageUploader'

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
    coverImage?: string | null
  }
}

export default function RegisterFormDesignPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params)
  const hackathonId = resolvedParams.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hackathon, setHackathon] = useState<any>(null)
  const [design, setDesign] = useState<FormDesign>({
    hackathonId,
    isEnabled: true,
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
      enableAnimations: true,
      coverImage: null
    }
  })
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')

  useEffect(() => {
    console.log('🔍 Component mounted, hackathonId:', hackathonId)
    fetchHackathon()
    fetchDesign()
  }, [hackathonId])

  // Generate modern template when hackathon data is loaded and no existing design
  useEffect(() => {
    if (hackathon && (!design.htmlContent || design.htmlContent.length < 100) && design.template === 'modern') {
      console.log('🎨 Auto-generating modern template...')
      generateModernTemplate()
    }
  }, [hackathon, design.htmlContent])

  // Auto-save when design changes and has content
  useEffect(() => {
    if (design.htmlContent && design.htmlContent.length > 100 && design.isEnabled) {
      console.log('💾 Auto-saving design changes...')
      const timeoutId = setTimeout(() => {
        handleSave()
      }, 2000) // Auto-save after 2 seconds of no changes
      
      return () => clearTimeout(timeoutId)
    }
  }, [design.htmlContent, design.settings, design.isEnabled])

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
      console.error('Error fetching design:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/register-form-design`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(design)
      })

      if (response.ok) {
        alert('✅ تم حفظ تصميم الفورم بنجاح!')
      } else {
        const error = await response.json()
        alert(`❌ خطأ في الحفظ: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving design:', error)
      alert('❌ حدث خطأ في الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const generateModernTemplate = () => {
    const template = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تسجيل - ${hackathon?.title || 'الهاكاثون'}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: '${design.settings.fontFamily}', Arial, sans-serif;
            background: linear-gradient(135deg, ${design.settings.primaryColor} 0%, ${design.settings.secondaryColor} 100%);
            min-height: 100vh;
            direction: rtl;
            padding: 2rem 1rem;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: ${design.settings.borderRadius};
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
            ${design.settings.enableAnimations ? 'animation: slideUp 0.6s ease-out;' : ''}
        }
        
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .header {
            ${design.settings.coverImage
              ? `background: url('${design.settings.coverImage}') center/cover;`
              : `background: linear-gradient(135deg, ${design.settings.primaryColor} 0%, ${design.settings.secondaryColor} 100%);`
            }
            color: white;
            padding: 3rem 2rem;
            text-align: center;
            position: relative;
            overflow: hidden;
            min-height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            ${design.settings.coverImage
              ? 'background: rgba(0,0,0,0.4);'
              : `background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');`
            }
            opacity: 0.3;
        }
        
        .header-content {
            position: relative;
            z-index: 2;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.95;
        }
        
        .form-container {
            padding: 3rem 2rem;
        }
        
        .form-group {
            margin-bottom: 2rem;
        }
        
        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #333;
            font-size: 1.1rem;
        }
        
        .form-input {
            width: 100%;
            padding: 1rem;
            border: 2px solid #e1e5e9;
            border-radius: ${design.settings.borderRadius};
            font-size: 1rem;
            font-family: inherit;
            transition: all 0.3s ease;
            background: #f8f9fa;
        }
        
        .form-input:focus {
            outline: none;
            border-color: ${design.settings.primaryColor};
            background: white;
            box-shadow: 0 0 0 3px ${design.settings.primaryColor}20;
        }
        
        .form-textarea {
            min-height: 120px;
            resize: vertical;
        }
        
        .form-select {
            appearance: none;
            background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6,9 12,15 18,9"></polyline></svg>');
            background-repeat: no-repeat;
            background-position: left 1rem center;
            background-size: 1rem;
            padding-left: 3rem;
        }
        
        .checkbox-group, .radio-group {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .checkbox-item, .radio-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: ${design.settings.borderRadius};
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .checkbox-item:hover, .radio-item:hover {
            background: #e9ecef;
            transform: translateY(-2px);
        }
        
        .submit-btn {
            background: linear-gradient(135deg, ${design.settings.primaryColor} 0%, ${design.settings.secondaryColor} 100%);
            color: white;
            border: none;
            padding: 1.25rem 3rem;
            font-size: 1.2rem;
            font-weight: 600;
            border-radius: ${design.settings.borderRadius};
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
            width: 100%;
        }
        
        .submit-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.3);
        }
        
        .progress-bar {
            height: 4px;
            background: #e1e5e9;
            position: relative;
            margin-bottom: 2rem;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, ${design.settings.primaryColor}, ${design.settings.secondaryColor});
            width: 0%;
            transition: width 0.3s ease;
        }
        
        .error-message {
            color: #dc3545;
            font-size: 0.9rem;
            margin-top: 0.5rem;
        }
        
        .success-message {
            background: #d4edda;
            color: #155724;
            padding: 1rem;
            border-radius: ${design.settings.borderRadius};
            margin-bottom: 2rem;
            border: 1px solid #c3e6cb;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            body { padding: 1rem 0.5rem; }
            .header { padding: 2rem 1rem; }
            .header h1 { font-size: 2rem; }
            .form-container { padding: 2rem 1rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <h1><i class="fas fa-rocket"></i> ${hackathon?.title || 'الهاكاثون'}</h1>
                <p>انضم إلينا في رحلة الإبداع والابتكار</p>
            </div>
        </div>
        
        ${design.settings.showProgressBar ? '<div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>' : ''}
        
        <div class="form-container">
            <div id="formContent">
                <!-- سيتم إدراج محتوى الفورم هنا -->
            </div>
        </div>
    </div>
    
    <script>
        // تحديث شريط التقدم
        function updateProgress() {
            if (!document.getElementById('progressFill')) return;
            
            const inputs = document.querySelectorAll('input, select, textarea');
            let filled = 0;
            
            inputs.forEach(input => {
                if (input.value && input.value.trim() !== '') {
                    filled++;
                }
            });
            
            const progress = (filled / inputs.length) * 100;
            document.getElementById('progressFill').style.width = progress + '%';
        }
        
        // إضافة مستمعي الأحداث
        document.addEventListener('DOMContentLoaded', function() {
            const inputs = document.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('input', updateProgress);
                input.addEventListener('change', updateProgress);
            });
            
            updateProgress();
        });
        
        // تأثيرات الأنيميشن
        ${design.settings.enableAnimations ? `
        document.addEventListener('DOMContentLoaded', function() {
            const formGroups = document.querySelectorAll('.form-group');
            formGroups.forEach((group, index) => {
                group.style.opacity = '0';
                group.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    group.style.transition = 'all 0.6s ease';
                    group.style.opacity = '1';
                    group.style.transform = 'translateY(0)';
                }, index * 100);
            });
        });
        ` : ''}
    </script>
</body>
</html>`;

    setDesign(prev => ({
      ...prev,
      htmlContent: template,
      template: 'modern'
    }))
  }

  const templates = [
    { id: 'modern', name: 'عصري', description: 'تصميم عصري مع تدرجات وتأثيرات' },
    { id: 'minimal', name: 'بسيط', description: 'تصميم بسيط ونظيف' },
    { id: 'dark', name: 'داكن', description: 'تصميم داكن أنيق' },
    { id: 'creative', name: 'إبداعي', description: 'تصميم إبداعي مع تأثيرات متقدمة' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/admin/hackathons/${hackathonId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                العودة
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">تصميم فورم التسجيل</h1>
              <p className="text-gray-600">{hackathon?.title}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={design.isEnabled}
                onCheckedChange={(checked) => setDesign(prev => ({ ...prev, isEnabled: checked }))}
              />
              <Label>تفعيل التصميم المخصص</Label>
            </div>
            
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
            
            <Button variant="outline" asChild>
              <Link href={`/hackathons/${hackathonId}/register-form`} target="_blank">
                <Eye className="w-4 h-4 mr-2" />
                معاينة
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  إعدادات التصميم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cover Image */}
                <ImageUploader
                  label="صورة الغلاف"
                  value={design.settings.coverImage || null}
                  onChange={(url) => setDesign(prev => ({
                    ...prev,
                    settings: { ...prev.settings, coverImage: url }
                  }))}
                  folder="registration-forms"
                  aspectRatio="21/9"
                  maxSizeMB={5}
                />

                <div>
                  <Label>القالب</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {templates.map(template => (
                      <Button
                        key={template.id}
                        variant={design.template === template.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setDesign(prev => ({ ...prev, template: template.id }))
                          if (template.id === 'modern') generateModernTemplate()
                        }}
                      >
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
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
                  <div>
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
                
                <div>
                  <Label>الخط</Label>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={design.settings.fontFamily}
                    onChange={(e) => setDesign(prev => ({
                      ...prev,
                      settings: { ...prev.settings, fontFamily: e.target.value }
                    }))}
                  >
                    <option value="Cairo">Cairo</option>
                    <option value="Tajawal">Tajawal</option>
                    <option value="Amiri">Amiri</option>
                    <option value="Noto Sans Arabic">Noto Sans Arabic</option>
                  </select>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>عرض معلومات الهاكاثون</Label>
                    <Switch
                      checked={design.settings.showHackathonInfo}
                      onCheckedChange={(checked) => setDesign(prev => ({
                        ...prev,
                        settings: { ...prev.settings, showHackathonInfo: checked }
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>شريط التقدم</Label>
                    <Switch
                      checked={design.settings.showProgressBar}
                      onCheckedChange={(checked) => setDesign(prev => ({
                        ...prev,
                        settings: { ...prev.settings, showProgressBar: checked }
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>تفعيل الأنيميشن</Label>
                    <Switch
                      checked={design.settings.enableAnimations}
                      onCheckedChange={(checked) => setDesign(prev => ({
                        ...prev,
                        settings: { ...prev.settings, enableAnimations: checked }
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="html" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="css">CSS</TabsTrigger>
                <TabsTrigger value="js">JavaScript</TabsTrigger>
              </TabsList>
              
              <TabsContent value="html">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      HTML
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={design.htmlContent}
                      onChange={(e) => setDesign(prev => ({ ...prev, htmlContent: e.target.value }))}
                      rows={20}
                      className="font-mono text-sm"
                      placeholder="اكتب HTML هنا..."
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="css">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      CSS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={design.cssContent}
                      onChange={(e) => setDesign(prev => ({ ...prev, cssContent: e.target.value }))}
                      rows={20}
                      className="font-mono text-sm"
                      placeholder="اكتب CSS هنا..."
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="js">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      JavaScript
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={design.jsContent}
                      onChange={(e) => setDesign(prev => ({ ...prev, jsContent: e.target.value }))}
                      rows={20}
                      className="font-mono text-sm"
                      placeholder="اكتب JavaScript هنا..."
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    معاينة
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={previewMode === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('desktop')}
                    >
                      <Monitor className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={previewMode === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('mobile')}
                    >
                      <Smartphone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`border rounded-lg overflow-hidden ${
                  previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
                }`}>
                  <iframe
                    srcDoc={design.htmlContent}
                    className={`w-full border-0 ${
                      previewMode === 'mobile' ? 'h-[600px]' : 'h-[800px]'
                    }`}
                    title="Form Preview"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
