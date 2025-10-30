'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, Code, Palette, Save, ExternalLink, Sparkles, Layout, Smartphone, Monitor } from 'lucide-react'

interface LandingPageData {
  id?: string
  hackathonId: string
  isEnabled: boolean
  customDomain?: string
  htmlContent: string
  cssContent: string
  jsContent: string
  seoTitle?: string
  seoDescription?: string
  template?: string
}

export default function AdvancedLandingPageEditor({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params)
  const [landingPage, setLandingPage] = useState<LandingPageData>({
    hackathonId: resolvedParams.id,
    isEnabled: false,
    htmlContent: '',
    cssContent: '',
    jsContent: '',
    template: 'complete'
  })
  const [hackathon, setHackathon] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState('desktop')
  const [activeTab, setActiveTab] = useState('complete')

  useEffect(() => {
    fetchHackathon()
    fetchLandingPage()
  }, [resolvedParams.id])

  const fetchHackathon = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setHackathon(data.hackathon)
      }
    } catch (error) {
      console.error('Error fetching hackathon:', error)
    }
  }

  const fetchLandingPage = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${resolvedParams.id}/landing-page`)
      if (response.ok) {
        const data = await response.json()
        if (data.landingPage) {
          setLandingPage(data.landingPage)
        }
      }
    } catch (error) {
      console.error('Error fetching landing page:', error)
    }
  }

  const saveLandingPage = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/hackathons/${resolvedParams.id}/landing-page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(landingPage)
      })

      if (response.ok) {
        alert('تم حفظ صفحة الهبوط بنجاح!')
      } else {
        alert('فشل في حفظ صفحة الهبوط')
      }
    } catch (error) {
      console.error('Error saving landing page:', error)
      alert('حدث خطأ في الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const loadTemplate = (templateName: string) => {
    const templates = {
      complete: {
        html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${hackathon?.title || 'هاكاثون'}</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Cairo', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            direction: rtl;
            text-align: right;
        }
        
        /* Hero Section */
        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }
        
        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        
        .hero-content {
            text-align: center;
            max-width: 800px;
            padding: 2rem;
            position: relative;
            z-index: 2;
        }
        
        .hero h1 {
            font-size: 4rem;
            margin-bottom: 1.5rem;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            animation: fadeInUp 1s ease-out;
        }
        
        .hero p {
            font-size: 1.4rem;
            margin-bottom: 2.5rem;
            opacity: 0.95;
            animation: fadeInUp 1s ease-out 0.2s both;
        }
        
        .cta-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            animation: fadeInUp 1s ease-out 0.4s both;
        }
        
        .btn-primary {
            background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
            color: white;
            border: none;
            padding: 18px 40px;
            font-size: 1.2rem;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
            text-decoration: none;
            display: inline-block;
        }
        
        .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 30px rgba(255, 107, 107, 0.4);
        }
        
        .btn-secondary {
            background: transparent;
            color: white;
            border: 2px solid white;
            padding: 16px 38px;
            font-size: 1.2rem;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn-secondary:hover {
            background: white;
            color: #667eea;
            transform: translateY(-3px);
        }
        
        /* Features Section */
        .features {
            padding: 100px 0;
            background: #f8f9fa;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        .section-title {
            text-align: center;
            font-size: 3rem;
            margin-bottom: 3rem;
            color: #333;
            font-weight: 700;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 3rem;
        }
        
        .feature-card {
            background: white;
            padding: 3rem 2rem;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .feature-card:hover {
            transform: translateY(-10px);
        }
        
        .feature-icon {
            font-size: 4rem;
            margin-bottom: 1.5rem;
            color: #667eea;
        }
        
        .feature-card h3 {
            font-size: 1.8rem;
            margin-bottom: 1rem;
            color: #333;
        }
        
        .feature-card p {
            color: #666;
            font-size: 1.1rem;
            line-height: 1.6;
        }
        
        /* Stats Section */
        .stats {
            padding: 80px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            text-align: center;
        }
        
        .stat-item h3 {
            font-size: 3rem;
            margin-bottom: 0.5rem;
            font-weight: 700;
        }
        
        .stat-item p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        /* Footer */
        .footer {
            background: #333;
            color: white;
            padding: 40px 0;
            text-align: center;
        }
        
        /* Animations */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .hero h1 { font-size: 2.5rem; }
            .hero p { font-size: 1.2rem; }
            .cta-buttons { flex-direction: column; align-items: center; }
            .section-title { font-size: 2rem; }
            .features-grid { grid-template-columns: 1fr; }
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
    </style>
</head>
<body>
    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
            <h1>${hackathon?.title || 'هاكاثون الإبداع'}</h1>
            <p>${hackathon?.description || 'انضم إلينا في رحلة الإبداع والابتكار التقني'}</p>
            <div class="cta-buttons">
                <button class="btn-primary" onclick="register()">
                    <i class="fas fa-rocket"></i> سجل الآن
                </button>
                <button class="btn-secondary" onclick="scrollToFeatures()">
                    <i class="fas fa-info-circle"></i> اعرف المزيد
                </button>
            </div>
        </div>
    </section>
    
    <!-- Features Section -->
    <section class="features" id="features">
        <div class="container">
            <h2 class="section-title">لماذا تشارك معنا؟</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <h3>جوائز قيمة</h3>
                    <p>جوائز مالية ومعنوية للفائزين مع فرص للتوظيف والاستثمار</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3>شبكة تواصل</h3>
                    <p>تواصل مع خبراء الصناعة ورواد الأعمال والمطورين المتميزين</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-lightbulb"></i>
                    </div>
                    <h3>تطوير المهارات</h3>
                    <p>ورش عمل ومحاضرات من خبراء لتطوير مهاراتك التقنية</p>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Stats Section -->
    <section class="stats">
        <div class="container">
            <div class="stats-grid">
                <div class="stat-item">
                    <h3>500+</h3>
                    <p>مشارك</p>
                </div>
                <div class="stat-item">
                    <h3>50+</h3>
                    <p>فريق</p>
                </div>
                <div class="stat-item">
                    <h3>100K+</h3>
                    <p>جائزة</p>
                </div>
                <div class="stat-item">
                    <h3>48</h3>
                    <p>ساعة</p>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 ${hackathon?.title || 'هاكاثون الإبداع'}. جميع الحقوق محفوظة.</p>
        </div>
    </footer>
    
    <script>
        function register() {
            window.location.href = '/hackathons/${resolvedParams.id}/register-form';
        }
        
        function scrollToFeatures() {
            document.getElementById('features').scrollIntoView({ 
                behavior: 'smooth' 
            });
        }
        
        // Add smooth scrolling for all anchor links
        document.addEventListener('DOMContentLoaded', function() {
            // Add loading animation
            document.body.style.opacity = '0';
            setTimeout(() => {
                document.body.style.transition = 'opacity 0.5s ease';
                document.body.style.opacity = '1';
            }, 100);
        });
    </script>
</body>
</html>`
      }
    }

    const template = templates[templateName as keyof typeof templates]
    if (template) {
      setLandingPage(prev => ({
        ...prev,
        htmlContent: template.html,
        cssContent: '',
        jsContent: '',
        template: templateName
      }))
    }
  }

  if (!hackathon) {
    return <div className="p-6">جاري التحميل...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#01645e]">محرر Landing Page المتقدم</h1>
              <p className="text-[#8b7632]">{hackathon.title}</p>
            </div>
            <div className="flex items-center gap-4">
              {landingPage.isEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/api/landing/${resolvedParams.id}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  معاينة مباشرة
                </Button>
              )}
              <Button onClick={saveLandingPage} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  إعدادات الصفحة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">تفعيل صفحة الهبوط</label>
                  <Switch
                    checked={landingPage.isEnabled}
                    onCheckedChange={(checked) => 
                      setLandingPage(prev => ({ ...prev, isEnabled: checked }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">قالب جاهز</label>
                  <Button
                    variant={landingPage.template === 'complete' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => loadTemplate('complete')}
                    className="w-full"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    صفحة كاملة متقدمة
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">وضع المعاينة</label>
                  <Select value={previewMode} onValueChange={setPreviewMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desktop">
                        <Monitor className="w-4 h-4 mr-2 inline" />
                        سطح المكتب
                      </SelectItem>
                      <SelectItem value="mobile">
                        <Smartphone className="w-4 h-4 mr-2 inline" />
                        الجوال
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">عنوان SEO</label>
                  <Input
                    value={landingPage.seoTitle || ''}
                    onChange={(e) => setLandingPage(prev => ({ 
                      ...prev, 
                      seoTitle: e.target.value 
                    }))}
                    placeholder={hackathon.title}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">وصف SEO</label>
                  <Textarea
                    value={landingPage.seoDescription || ''}
                    onChange={(e) => setLandingPage(prev => ({ 
                      ...prev, 
                      seoDescription: e.target.value 
                    }))}
                    placeholder={hackathon.description}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Code Editor */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="complete">
                  <Layout className="w-4 h-4 mr-2" />
                  HTML كامل
                </TabsTrigger>
                <TabsTrigger value="preview">
                  <Eye className="w-4 h-4 mr-2" />
                  معاينة
                </TabsTrigger>
              </TabsList>

              <TabsContent value="complete" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>HTML كامل مع CSS و JavaScript</CardTitle>
                    <CardDescription>
                      اكتب كود HTML كامل مع CSS و JavaScript في ملف واحد
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={landingPage.htmlContent}
                      onChange={(e) => setLandingPage(prev => ({ 
                        ...prev, 
                        htmlContent: e.target.value 
                      }))}
                      className="font-mono text-sm min-h-[600px]"
                      placeholder="<!DOCTYPE html>
<html>
<head>
    <style>
        /* CSS هنا */
    </style>
</head>
<body>
    <!-- HTML هنا -->
    <script>
        // JavaScript هنا
    </script>
</body>
</html>"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>معاينة الصفحة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`border rounded-lg overflow-hidden ${
                      previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
                    }`}>
                      <iframe
                        srcDoc={landingPage.htmlContent}
                        className={`w-full border-0 ${
                          previewMode === 'mobile' ? 'h-[600px]' : 'h-[800px]'
                        }`}
                        title="معاينة الصفحة"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
