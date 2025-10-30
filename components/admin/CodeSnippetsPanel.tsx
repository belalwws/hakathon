'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Copy, 
  Code, 
  Palette, 
  MousePointer, 
  Smartphone,
  Users,
  Calendar,
  Award,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'

interface CodeSnippet {
  id: string
  title: string
  description: string
  code: string
  type: 'html' | 'css' | 'js'
  category: 'registration' | 'ui' | 'animation' | 'responsive' | 'integration'
}

const codeSnippets: CodeSnippet[] = [
  // Registration Snippets
  {
    id: 'register-button',
    title: 'زر التسجيل الأساسي',
    description: 'زر تسجيل بسيط مع تأثيرات hover',
    type: 'html',
    category: 'registration',
    code: `<button class="register-btn" onclick="registerNow()">
  <i class="fas fa-rocket"></i>
  سجل الآن
</button>

<style>
.register-btn {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 18px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Cairo', Arial, sans-serif;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}
</style>`
  },
  {
    id: 'registration-modal',
    title: 'نافذة التسجيل المنبثقة',
    description: 'فتح نموذج التسجيل في نافذة منبثقة',
    type: 'js',
    category: 'registration',
    code: `function openRegistrationModal() {
  const modal = window.open(
    '/hackathons/{{HACKATHON_ID}}/register-form',
    'registration',
    'width=900,height=700,scrollbars=yes,resizable=yes,centerscreen=yes'
  );
  
  // التحقق من إغلاق النافذة
  const checkClosed = setInterval(() => {
    if (modal.closed) {
      clearInterval(checkClosed);
      // يمكن إضافة كود هنا بعد إغلاق النافذة
      console.log('تم إغلاق نافذة التسجيل');
    }
  }, 1000);
}

// استخدام النافذة المنبثقة
function registerWithModal() {
  openRegistrationModal();
}`
  },
  {
    id: 'registration-status',
    title: 'فحص حالة التسجيل',
    description: 'التحقق من حالة تسجيل المستخدم',
    type: 'js',
    category: 'registration',
    code: `function checkRegistrationStatus() {
  const registered = localStorage.getItem('hackathon_registered_{{HACKATHON_ID}}');
  return registered === 'true';
}

function updateRegistrationButton() {
  const button = document.querySelector('.register-btn');
  if (checkRegistrationStatus()) {
    button.innerHTML = '<i class="fas fa-check"></i> مسجل بالفعل';
    button.style.background = '#27ae60';
    button.onclick = () => {
      alert('أنت مسجل بالفعل في هذا الهاكاثون!');
    };
  }
}

// تشغيل الفحص عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', updateRegistrationButton);`
  },
  
  // UI Components
  {
    id: 'hero-section',
    title: 'قسم البطل (Hero Section)',
    description: 'قسم رئيسي جذاب مع خلفية متدرجة',
    type: 'html',
    category: 'ui',
    code: `<section class="hero">
  <div class="hero-content">
    <h1 class="hero-title">{{HACKATHON_TITLE}}</h1>
    <p class="hero-description">{{HACKATHON_DESCRIPTION}}</p>
    <div class="hero-buttons">
      <button class="btn-primary" onclick="registerNow()">
        سجل الآن
      </button>
      <button class="btn-secondary" onclick="scrollToInfo()">
        اعرف المزيد
      </button>
    </div>
  </div>
</section>

<style>
.hero {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
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
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  padding: 2rem;
}

.hero-title {
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.hero-description {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
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
}

.btn-primary {
  background: #ff6b6b;
  color: white;
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
</style>`
  },
  {
    id: 'countdown-timer',
    title: 'عداد تنازلي',
    description: 'عداد تنازلي لبداية الهاكاثون',
    type: 'html',
    category: 'ui',
    code: `<div class="countdown-container">
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

<style>
.countdown-container {
  text-align: center;
  padding: 2rem;
  background: rgba(255,255,255,0.1);
  border-radius: 20px;
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
</style>

<script>
function startCountdown() {
  // تاريخ بداية الهاكاثون (يجب تعديله)
  const startDate = new Date('2024-12-31T00:00:00').getTime();
  
  const timer = setInterval(() => {
    const now = new Date().getTime();
    const distance = startDate - now;
    
    if (distance < 0) {
      clearInterval(timer);
      document.getElementById('countdown').innerHTML = '<h2>بدأ الهاكاثون!</h2>';
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

document.addEventListener('DOMContentLoaded', startCountdown);
</script>`
  },
  
  // Animation Snippets
  {
    id: 'fade-in-animation',
    title: 'تأثير الظهور التدريجي',
    description: 'تأثير ظهور العناصر عند التمرير',
    type: 'css',
    category: 'animation',
    code: `/* CSS للتأثيرات */
.fade-in {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease;
}

.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}

.slide-in-left {
  opacity: 0;
  transform: translateX(-50px);
  transition: all 0.6s ease;
}

.slide-in-left.visible {
  opacity: 1;
  transform: translateX(0);
}

.slide-in-right {
  opacity: 0;
  transform: translateX(50px);
  transition: all 0.6s ease;
}

.slide-in-right.visible {
  opacity: 1;
  transform: translateX(0);
}

/* JavaScript للتحكم في التأثيرات */
<script>
function observeElements() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // مراقبة جميع العناصر مع كلاسات التأثير
  document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
    observer.observe(el);
  });
}

document.addEventListener('DOMContentLoaded', observeElements);
</script>`
  },
  
  // Responsive Snippets
  {
    id: 'responsive-grid',
    title: 'شبكة متجاوبة',
    description: 'نظام شبكة متجاوب للمحتوى',
    type: 'css',
    category: 'responsive',
    code: `.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.grid-item {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.grid-item:hover {
  transform: translateY(-5px);
}

/* للشاشات الصغيرة */
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 1rem;
  }
  
  .grid-item {
    padding: 1.5rem;
  }
}

/* للشاشات الكبيرة جداً */
@media (min-width: 1200px) {
  .grid-container {
    max-width: 1200px;
    margin: 0 auto;
  }
}`
  }
]

interface CodeSnippetsPanelProps {
  onInsertCode: (code: string) => void
}

export default function CodeSnippetsPanel({ onInsertCode }: CodeSnippetsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('registration')

  const categories = [
    { id: 'registration', name: 'التسجيل', icon: Users },
    { id: 'ui', name: 'واجهة المستخدم', icon: Palette },
    { id: 'animation', name: 'التأثيرات', icon: MousePointer },
    { id: 'responsive', name: 'التجاوب', icon: Smartphone },
    { id: 'integration', name: 'التكامل', icon: ExternalLink }
  ]

  const filteredSnippets = codeSnippets.filter(snippet => 
    snippet.category === selectedCategory
  )

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('تم نسخ الكود')
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5" />
          مكتبة الأكواد المساعدة
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-4 w-full">
            {categories.slice(0, 4).map(category => {
              const Icon = category.icon
              return (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  <Icon className="w-3 h-3 mr-1" />
                  {category.name}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category.id} value={category.id} className="mt-4 px-4">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredSnippets.map(snippet => (
                  <div key={snippet.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-sm">{snippet.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{snippet.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {snippet.type.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(snippet.code)}
                        className="text-xs"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        نسخ
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onInsertCode(snippet.code)}
                        className="text-xs"
                      >
                        إدراج
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
