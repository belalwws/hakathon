'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  Download, 
  Palette, 
  Zap, 
  Star,
  Smartphone,
  Monitor,
  Code
} from 'lucide-react'
import { toast } from 'sonner'

interface Template {
  id: string
  name: string
  description: string
  category: 'modern' | 'minimal' | 'creative' | 'corporate'
  preview: string
  files: {
    id: string
    name: string
    type: 'html' | 'css' | 'js'
    content: string
    isMain?: boolean
  }[]
  features: string[]
  responsive: boolean
  animations: boolean
}

const templates: Template[] = [
  {
    id: 'modern-gradient',
    name: 'متدرج عصري',
    description: 'تصميم عصري مع خلفيات متدرجة وتأثيرات بصرية',
    category: 'modern',
    preview: '/templates/modern-gradient.jpg',
    responsive: true,
    animations: true,
    features: ['تأثيرات متدرجة', 'أزرار تفاعلية', 'عداد تنازلي', 'تأثيرات حركية'],
    files: [
      {
        id: 'main-html',
        name: 'index.html',
        type: 'html',
        isMain: true,
        content: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{HACKATHON_TITLE}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
    </div>
    
    <header class="hero">
        <div class="hero-content">
            <h1 class="hero-title fade-in">{{HACKATHON_TITLE}}</h1>
            <p class="hero-subtitle fade-in">{{HACKATHON_DESCRIPTION}}</p>
            
            <div class="countdown-container fade-in">
                <h3>يبدأ الهاكاثون خلال:</h3>
                <div class="countdown" id="countdown">
                    <div class="time-unit">
                        <span class="number" id="days">00</span>
                        <span class="label">يوم</span>
                    </div>
                    <div class="time-unit">
                        <span class="number" id="hours">00</span>
                        <span class="label">ساعة</span>
                    </div>
                    <div class="time-unit">
                        <span class="number" id="minutes">00</span>
                        <span class="label">دقيقة</span>
                    </div>
                    <div class="time-unit">
                        <span class="number" id="seconds">00</span>
                        <span class="label">ثانية</span>
                    </div>
                </div>
            </div>
            
            <div class="hero-buttons fade-in">
                <button class="btn-primary pulse" onclick="registerNow()">
                    <i class="fas fa-rocket"></i>
                    سجل الآن
                </button>
                <button class="btn-secondary" onclick="scrollToInfo()">
                    <i class="fas fa-info-circle"></i>
                    اعرف المزيد
                </button>
            </div>
        </div>
    </header>
    
    <section id="info" class="info-section">
        <div class="container">
            <h2 class="section-title slide-in-left">عن الهاكاثون</h2>
            <div class="info-grid">
                <div class="info-card slide-in-left">
                    <i class="fas fa-trophy"></i>
                    <h3>جوائز قيمة</h3>
                    <p>جوائز نقدية ومعنوية للفائزين</p>
                </div>
                <div class="info-card slide-in-up">
                    <i class="fas fa-users"></i>
                    <h3>فرق متنوعة</h3>
                    <p>انضم لفريق أو كون فريقك الخاص</p>
                </div>
                <div class="info-card slide-in-right">
                    <i class="fas fa-lightbulb"></i>
                    <h3>أفكار مبتكرة</h3>
                    <p>حول أفكارك إلى مشاريع حقيقية</p>
                </div>
            </div>
        </div>
    </section>
    
    <script src="script.js"></script>
</body>
</html>`
      },
      {
        id: 'main-css',
        name: 'styles.css',
        type: 'css',
        content: `@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Cairo', Arial, sans-serif;
    direction: rtl;
    overflow-x: hidden;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.floating-shapes {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
}

.shape {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float 6s ease-in-out infinite;
}

.shape-1 {
    width: 80px;
    height: 80px;
    top: 20%;
    left: 10%;
    animation-delay: 0s;
}

.shape-2 {
    width: 120px;
    height: 120px;
    top: 60%;
    right: 15%;
    animation-delay: 2s;
}

.shape-3 {
    width: 60px;
    height: 60px;
    top: 80%;
    left: 20%;
    animation-delay: 4s;
}

@keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
}

.hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: white;
    position: relative;
    z-index: 2;
}

.hero-content {
    max-width: 800px;
    padding: 2rem;
}

.hero-title {
    font-size: 4rem;
    font-weight: 700;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    background: linear-gradient(45deg, #fff, #f0f0f0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero-subtitle {
    font-size: 1.5rem;
    margin-bottom: 3rem;
    opacity: 0.9;
}

.countdown-container {
    background: rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 3rem;
    backdrop-filter: blur(10px);
}

.countdown {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 1rem;
}

.time-unit {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.number {
    font-size: 3rem;
    font-weight: bold;
    color: #ff6b6b;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.label {
    font-size: 1rem;
    opacity: 0.8;
    margin-top: 0.5rem;
}

.hero-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
    padding: 15px 30px;
    font-size: 18px;
    border-radius: 50px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'Cairo', Arial, sans-serif;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-primary {
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
    color: white;
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.btn-secondary {
    background: transparent;
    color: white;
    border: 2px solid white;
}

.btn-primary:hover, .btn-secondary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
}

.pulse {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3); }
    50% { box-shadow: 0 4px 25px rgba(255, 107, 107, 0.6); }
    100% { box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3); }
}

.info-section {
    padding: 5rem 0;
    background: white;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

.section-title {
    text-align: center;
    font-size: 3rem;
    margin-bottom: 3rem;
    color: #333;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.info-card {
    text-align: center;
    padding: 2rem;
    border-radius: 15px;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.info-card:hover {
    transform: translateY(-5px);
}

.info-card i {
    font-size: 3rem;
    color: #667eea;
    margin-bottom: 1rem;
}

.info-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #333;
}

.info-card p {
    color: #666;
    line-height: 1.6;
}

/* Animation Classes */
.fade-in {
    opacity: 0;
    animation: fadeIn 1s ease forwards;
}

.fade-in:nth-child(1) { animation-delay: 0.2s; }
.fade-in:nth-child(2) { animation-delay: 0.4s; }
.fade-in:nth-child(3) { animation-delay: 0.6s; }
.fade-in:nth-child(4) { animation-delay: 0.8s; }

@keyframes fadeIn {
    to { opacity: 1; }
}

.slide-in-left {
    opacity: 0;
    transform: translateX(-50px);
    animation: slideInLeft 1s ease forwards;
}

.slide-in-right {
    opacity: 0;
    transform: translateX(50px);
    animation: slideInRight 1s ease forwards;
}

.slide-in-up {
    opacity: 0;
    transform: translateY(50px);
    animation: slideInUp 1s ease forwards;
}

@keyframes slideInLeft {
    to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInRight {
    to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInUp {
    to { opacity: 1; transform: translateY(0); }
}

/* Responsive Design */
@media (max-width: 768px) {
    .hero-title {
        font-size: 2.5rem;
    }
    
    .hero-subtitle {
        font-size: 1.2rem;
    }
    
    .countdown {
        gap: 1rem;
    }
    
    .number {
        font-size: 2rem;
    }
    
    .hero-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .btn-primary, .btn-secondary {
        width: 100%;
        max-width: 300px;
    }
    
    .info-grid {
        grid-template-columns: 1fr;
    }
}`
      },
      {
        id: 'main-js',
        name: 'script.js',
        type: 'js',
        content: `// دوال التسجيل
function registerNow() {
    window.location.href = '/hackathons/{{HACKATHON_ID}}/register-form';
}

function scrollToInfo() {
    document.getElementById('info').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// العداد التنازلي
function startCountdown() {
    // تاريخ بداية الهاكاثون (يجب تعديله)
    const startDate = new Date('2024-12-31T00:00:00').getTime();
    
    const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = startDate - now;
        
        if (distance < 0) {
            clearInterval(timer);
            document.getElementById('countdown').innerHTML = '<h2 style="color: #ff6b6b;">بدأ الهاكاثون!</h2>';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }, 1000);
}

// تأثيرات التمرير
function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationDelay = '0s';
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.slide-in-left, .slide-in-right, .slide-in-up').forEach(el => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });
}

// تأثيرات الماوس للأزرار
function addButtonEffects() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05) translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) translateY(0)';
        });
        
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

// تشغيل جميع الوظائف عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    startCountdown();
    observeElements();
    addButtonEffects();
    
    // تأثير التحميل
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});`
      }
    ]
  },
  {
    id: 'minimal-clean',
    name: 'بسيط ونظيف',
    description: 'تصميم بسيط وأنيق مع تركيز على المحتوى',
    category: 'minimal',
    preview: '/templates/minimal-clean.jpg',
    responsive: true,
    animations: false,
    features: ['تصميم بسيط', 'سهولة القراءة', 'تحميل سريع', 'متجاوب'],
    files: [
      {
        id: 'main-html',
        name: 'index.html',
        type: 'html',
        isMain: true,
        content: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{HACKATHON_TITLE}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>{{HACKATHON_TITLE}}</h1>
            <p class="subtitle">{{HACKATHON_DESCRIPTION}}</p>
            <button class="register-btn" onclick="registerNow()">
                سجل الآن
            </button>
        </header>
        
        <section class="info">
            <div class="info-item">
                <h3>التاريخ</h3>
                <p>15-17 ديسمبر 2024</p>
            </div>
            <div class="info-item">
                <h3>المكان</h3>
                <p>الرياض، المملكة العربية السعودية</p>
            </div>
            <div class="info-item">
                <h3>الجوائز</h3>
                <p>100,000 ريال سعودي</p>
            </div>
        </section>
    </div>
    <script src="script.js"></script>
</body>
</html>`
      },
      {
        id: 'main-css',
        name: 'styles.css',
        type: 'css',
        content: `@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600&display=swap');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Cairo', Arial, sans-serif;
    direction: rtl;
    background: #f8f9fa;
    color: #333;
    line-height: 1.6;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.header {
    text-align: center;
    margin-bottom: 3rem;
}

.header h1 {
    font-size: 3rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #2c3e50;
}

.subtitle {
    font-size: 1.2rem;
    color: #7f8c8d;
    margin-bottom: 2rem;
}

.register-btn {
    background: #3498db;
    color: white;
    border: none;
    padding: 15px 40px;
    font-size: 18px;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s ease;
    font-family: 'Cairo', Arial, sans-serif;
}

.register-btn:hover {
    background: #2980b9;
}

.info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
}

.info-item {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.info-item h3 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
    color: #2c3e50;
}

.info-item p {
    color: #7f8c8d;
}

@media (max-width: 768px) {
    .header h1 {
        font-size: 2rem;
    }
    
    .info {
        grid-template-columns: 1fr;
    }
}`
      },
      {
        id: 'main-js',
        name: 'script.js',
        type: 'js',
        content: `function registerNow() {
    window.location.href = '/hackathons/{{HACKATHON_ID}}/register-form';
}

document.addEventListener('DOMContentLoaded', function() {
    // تأثير بسيط للتحميل
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '1';
    }, 100);
});`
      }
    ]
  }
]

interface TemplateGalleryProps {
  onSelectTemplate: (template: Template) => void
}

export default function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', name: 'الكل' },
    { id: 'modern', name: 'عصري' },
    { id: 'minimal', name: 'بسيط' },
    { id: 'creative', name: 'إبداعي' },
    { id: 'corporate', name: 'مؤسسي' }
  ]

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          معرض القوالب
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Category Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {categories.map(category => (
            <Button
              key={category.id}
              size="sm"
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredTemplates.map(template => (
            <Card key={template.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                </div>
                <Badge variant="outline">{template.category}</Badge>
              </div>
              
              <div className="flex gap-2 mb-3 flex-wrap">
                {template.features.slice(0, 3).map(feature => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                {template.responsive && (
                  <div className="flex items-center gap-1">
                    <Smartphone className="w-3 h-3" />
                    <span>متجاوب</span>
                  </div>
                )}
                {template.animations && (
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>متحرك</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Code className="w-3 h-3" />
                  <span>{template.files.length} ملف</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    onSelectTemplate(template)
                    toast.success(`تم تطبيق قالب ${template.name}`)
                  }}
                  className="flex-1"
                >
                  <Download className="w-3 h-3 mr-1" />
                  استخدام القالب
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // يمكن إضافة معاينة هنا
                    toast.info('معاينة القالب قريباً')
                  }}
                >
                  <Eye className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
