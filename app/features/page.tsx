'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { AnimatedSection } from '@/components/animated-section'
import { HoverCard } from '@/components/hover-card'
import { BackgroundAnimations } from '@/components/background-animations'
import { Badge } from '@/components/ui/badge'
import { 
  Building2,
  Users,
  Award,
  BarChart3,
  Shield,
  Globe,
  Zap,
  Clock,
  Database,
  Code2,
  Brain,
  Target,
  CheckCircle2,
  Mail,
  FileText,
  Calendar,
  UserCheck,
  TrendingUp,
  Lock,
  Smartphone,
  Cloud
} from 'lucide-react'

export default function FeaturesPage() {
  const { language } = useLanguage()
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = [
    { id: 'all', label: language === 'ar' ? 'الكل' : 'All' },
    { id: 'management', label: language === 'ar' ? 'الإدارة' : 'Management' },
    { id: 'automation', label: language === 'ar' ? 'الأتمتة' : 'Automation' },
    { id: 'analytics', label: language === 'ar' ? 'التحليلات' : 'Analytics' },
    { id: 'security', label: language === 'ar' ? 'الأمان' : 'Security' }
  ]

  const features = [
    {
      icon: <Building2 className="h-10 w-10" />,
      title: language === 'ar' ? 'تعدد المؤسسات' : 'Multi-Tenancy',
      description: language === 'ar' 
        ? 'دعم عدة منظمات على نفس المنصة مع عزل كامل للبيانات'
        : 'Support multiple organizations on the same platform with complete data isolation',
      category: 'management',
      color: 'indigo',
      features: [
        language === 'ar' ? 'عزل كامل للبيانات' : 'Complete data isolation',
        language === 'ar' ? 'إدارة مستقلة لكل منظمة' : 'Independent management per organization',
        language === 'ar' ? 'تخصيص العلامة التجارية' : 'Brand customization'
      ]
    },
    {
      icon: <Users className="h-10 w-10" />,
      title: language === 'ar' ? 'إدارة المشاركين' : 'Participant Management',
      description: language === 'ar'
        ? 'إدارة شاملة للمشاركين مع نظام تسجيل متقدم'
        : 'Comprehensive participant management with advanced registration system',
      category: 'management',
      color: 'purple',
      features: [
        language === 'ar' ? 'تسجيل سهل للمشاركين' : 'Easy participant registration',
        language === 'ar' ? 'إدارة الفرق' : 'Team management',
        language === 'ar' ? 'تتبع الحضور' : 'Attendance tracking'
      ]
    },
    {
      icon: <Award className="h-10 w-10" />,
      title: language === 'ar' ? 'نظام التقييم' : 'Evaluation System',
      description: language === 'ar'
        ? 'نظام تقييم متطور للحكام مع معايير قابلة للتخصيص'
        : 'Advanced evaluation system for judges with customizable criteria',
      category: 'management',
      color: 'amber',
      features: [
        language === 'ar' ? 'معايير تقييم مخصصة' : 'Custom evaluation criteria',
        language === 'ar' ? 'تقييم متعدد المراحل' : 'Multi-stage evaluation',
        language === 'ar' ? 'حساب تلقائي للنتائج' : 'Automatic results calculation'
      ]
    },
    {
      icon: <Mail className="h-10 w-10" />,
      title: language === 'ar' ? 'نظام الإشعارات' : 'Notification System',
      description: language === 'ar'
        ? 'إرسال إشعارات تلقائية عبر البريد الإلكتروني'
        : 'Automatic email notifications and alerts',
      category: 'automation',
      color: 'blue',
      features: [
        language === 'ar' ? 'إشعارات بريد إلكتروني' : 'Email notifications',
        language === 'ar' ? 'قوالب قابلة للتخصيص' : 'Customizable templates',
        language === 'ar' ? 'جدولة الإشعارات' : 'Scheduled notifications'
      ]
    },
    {
      icon: <BarChart3 className="h-10 w-10" />,
      title: language === 'ar' ? 'التقارير والتحليلات' : 'Reports & Analytics',
      description: language === 'ar'
        ? 'تقارير تفصيلية وتحليلات في الوقت الفعلي'
        : 'Detailed reports and real-time analytics',
      category: 'analytics',
      color: 'green',
      features: [
        language === 'ar' ? 'لوحات معلومات تفاعلية' : 'Interactive dashboards',
        language === 'ar' ? 'تصدير البيانات' : 'Data export',
        language === 'ar' ? 'تحليلات متقدمة' : 'Advanced analytics'
      ]
    },
    {
      icon: <Shield className="h-10 w-10" />,
      title: language === 'ar' ? 'الأمان والخصوصية' : 'Security & Privacy',
      description: language === 'ar'
        ? 'حماية متقدمة للبيانات والخصوصية'
        : 'Advanced data protection and privacy',
      category: 'security',
      color: 'red',
      features: [
        language === 'ar' ? 'تشفير شامل' : 'End-to-end encryption',
        language === 'ar' ? 'مصادقة ثنائية' : 'Two-factor authentication',
        language === 'ar' ? 'نسخ احتياطي تلقائي' : 'Automatic backups'
      ]
    },
    {
      icon: <Calendar className="h-10 w-10" />,
      title: language === 'ar' ? 'جدولة النماذج' : 'Form Scheduling',
      description: language === 'ar'
        ? 'جدولة فتح وإغلاق النماذج تلقائياً'
        : 'Automatic form opening and closing scheduling',
      category: 'automation',
      color: 'violet',
      features: [
        language === 'ar' ? 'جدولة تلقائية' : 'Automatic scheduling',
        language === 'ar' ? 'تنبيهات زمنية' : 'Time-based alerts',
        language === 'ar' ? 'عد تنازلي' : 'Countdown timers'
      ]
    },
    {
      icon: <FileText className="h-10 w-10" />,
      title: language === 'ar' ? 'الشهادات الرقمية' : 'Digital Certificates',
      description: language === 'ar'
        ? 'إصدار شهادات رقمية قابلة للتخصيص تلقائياً'
        : 'Automatically issue customizable digital certificates',
      category: 'automation',
      color: 'pink',
      features: [
        language === 'ar' ? 'تصميم قابل للتخصيص' : 'Customizable design',
        language === 'ar' ? 'إصدار جماعي' : 'Bulk issuance',
        language === 'ar' ? 'تحقق من الصحة' : 'Verification system'
      ]
    },
    {
      icon: <Smartphone className="h-10 w-10" />,
      title: language === 'ar' ? 'متوافق مع الجوال' : 'Mobile Responsive',
      description: language === 'ar'
        ? 'تجربة مثالية على جميع الأجهزة'
        : 'Perfect experience on all devices',
      category: 'management',
      color: 'cyan',
      features: [
        language === 'ar' ? 'تصميم متجاوب' : 'Responsive design',
        language === 'ar' ? 'تطبيق PWA' : 'PWA support',
        language === 'ar' ? 'وضع بلا اتصال' : 'Offline mode'
      ]
    },
    {
      icon: <Cloud className="h-10 w-10" />,
      title: language === 'ar' ? 'تخزين سحابي' : 'Cloud Storage',
      description: language === 'ar'
        ? 'تخزين آمن وسريع للملفات والعروض'
        : 'Secure and fast file and presentation storage',
      category: 'management',
      color: 'sky',
      features: [
        language === 'ar' ? 'رفع سريع' : 'Fast uploads',
        language === 'ar' ? 'تخزين آمن' : 'Secure storage',
        language === 'ar' ? 'مشاركة سهلة' : 'Easy sharing'
      ]
    },
    {
      icon: <Globe className="h-10 w-10" />,
      title: language === 'ar' ? 'دعم متعدد اللغات' : 'Multi-Language Support',
      description: language === 'ar'
        ? 'دعم كامل للغة العربية والإنجليزية'
        : 'Full Arabic and English language support',
      category: 'management',
      color: 'teal',
      features: [
        language === 'ar' ? 'عربي وإنجليزي' : 'Arabic & English',
        language === 'ar' ? 'RTL/LTR' : 'RTL/LTR support',
        language === 'ar' ? 'ترجمة كاملة' : 'Complete translation'
      ]
    },
    {
      icon: <TrendingUp className="h-10 w-10" />,
      title: language === 'ar' ? 'قابل للتوسع' : 'Scalable',
      description: language === 'ar'
        ? 'منصة قابلة للتوسع لتلبية احتياجاتك المتنامية'
        : 'Scalable platform to meet your growing needs',
      category: 'analytics',
      color: 'orange',
      features: [
        language === 'ar' ? 'بنية قابلة للتوسع' : 'Scalable architecture',
        language === 'ar' ? 'أداء عالي' : 'High performance',
        language === 'ar' ? 'دعم آلاف المستخدمين' : 'Support thousands of users'
      ]
    }
  ]

  const filteredFeatures = activeCategory === 'all' 
    ? features 
    : features.filter(f => f.category === activeCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 transition-colors">
      <BackgroundAnimations />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection direction="fade">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {language === 'ar' ? 'ميزات قوية' : 'Powerful Features'}
                </span>
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                {language === 'ar' ? 'كل ما تحتاجه في مكان واحد' : 'Everything You Need in One Place'}
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-gray-600 dark:text-gray-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {language === 'ar' 
                  ? 'اكتشف مجموعة واسعة من الميزات القوية التي تجعل إدارة المسابقات أسهل من أي وقت مضى'
                  : 'Discover a wide range of powerful features that make hackathon management easier than ever'}
              </motion.p>
            </div>
          </AnimatedSection>

          {/* Category Filters */}
          <AnimatedSection delay={0.4}>
            <div className="flex flex-wrap justify-center gap-3 mt-12">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-6 py-3 rounded-full font-medium transition-all ${
                    activeCategory === category.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredFeatures.map((feature, index) => (
              <AnimatedSection key={index} delay={index * 0.05} direction="up">
                <HoverCard>
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600 text-white mb-6 w-fit`}>
                      {feature.icon}
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                      {feature.description}
                    </p>
                    
                    <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {feature.features.map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2 className={`h-5 w-5 text-${feature.color}-600 dark:text-${feature.color}-400 flex-shrink-0 mt-0.5`} />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </HoverCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto text-white">
              <Target className="h-16 w-16 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {language === 'ar' ? 'جرب جميع الميزات مجاناً' : 'Try All Features for Free'}
              </h2>
              <p className="text-xl mb-8 opacity-90">
                {language === 'ar'
                  ? 'ابدأ تجربتك المجانية اليوم واكتشف كيف يمكن لمنصتنا تحويل طريقة إدارة المسابقات'
                  : 'Start your free trial today and discover how our platform can transform your hackathon management'}
              </p>
              <motion.a
                href="/register"
                className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-full font-semibold text-lg hover:shadow-2xl transition-all hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {language === 'ar' ? 'ابدأ مجاناً' : 'Start Free Trial'}
              </motion.a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
