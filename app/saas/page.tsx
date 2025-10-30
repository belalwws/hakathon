'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Check, 
  Rocket, 
  Users, 
  Trophy, 
  Zap, 
  Shield, 
  Cloud,
  BarChart3,
  Mail,
  Palette,
  Globe,
  Code,
  Star,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function SaaSLandingPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-slate-200 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#01645e] to-[#3ab666] rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#01645e] to-[#3ab666] bg-clip-text text-transparent">
                HackPro
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-[#01645e] transition">المميزات</a>
              <a href="#pricing" className="text-slate-600 hover:text-[#01645e] transition">الأسعار</a>
              <a href="#testimonials" className="text-slate-600 hover:text-[#01645e] transition">آراء العملاء</a>
              <Link href="/login">
                <Button variant="ghost" className="text-[#01645e]">تسجيل الدخول</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white">
                  ابدأ الآن مجاناً
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-12"
            {...fadeInUp}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#c3e956]/20 rounded-full mb-6">
              <Zap className="w-4 h-4 text-[#3ab666]" />
              <span className="text-sm font-medium text-[#01645e]">منصة إدارة الهاكاثونات الأولى عربياً</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#01645e] via-[#3ab666] to-[#c3e956] bg-clip-text text-transparent leading-tight">
              أدِر هاكاثوناتك<br />كالمحترفين
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              منصة متكاملة لإدارة الهاكاثونات من التسجيل حتى النتائج والشهادات. 
              وفّر الوقت وركّز على الابتكار.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white text-lg px-8 py-6">
                  <Rocket className="mr-2 w-5 h-5" />
                  ابدأ تجربتك المجانية
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-[#01645e] text-[#01645e]">
                <Play className="mr-2 w-5 h-5" />
                شاهد العرض التوضيحي
              </Button>
            </div>
            <p className="mt-4 text-sm text-slate-500">لا يتطلب بطاقة ائتمان • جرب مجاناً لمدة 14 يوم</p>
          </motion.div>

          {/* Hero Image/Stats */}
          <motion.div 
            className="mt-16 grid md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="p-6 text-center border-2 border-[#01645e]/20 hover:border-[#01645e] transition">
              <Users className="w-12 h-12 mx-auto mb-4 text-[#01645e]" />
              <h3 className="text-3xl font-bold text-[#01645e] mb-2">10K+</h3>
              <p className="text-slate-600">مشارك نشط</p>
            </Card>
            <Card className="p-6 text-center border-2 border-[#3ab666]/20 hover:border-[#3ab666] transition">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-[#3ab666]" />
              <h3 className="text-3xl font-bold text-[#3ab666] mb-2">500+</h3>
              <p className="text-slate-600">هاكاثون ناجح</p>
            </Card>
            <Card className="p-6 text-center border-2 border-[#c3e956]/20 hover:border-[#c3e956] transition">
              <Star className="w-12 h-12 mx-auto mb-4 text-[#3ab666]" />
              <h3 className="text-3xl font-bold text-[#3ab666] mb-2">4.9/5</h3>
              <p className="text-slate-600">تقييم المستخدمين</p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">كل ما تحتاجه في مكان واحد</h2>
            <p className="text-xl text-slate-600">أدوات قوية لإدارة هاكاثونات احترافية</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-10 h-10" />,
                title: 'إدارة المشاركين',
                description: 'نظام تسجيل ذكي مع فرز تلقائي للفرق وإرسال إشعارات فورية',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: <BarChart3 className="w-10 h-10" />,
                title: 'نظام تقييم متقدم',
                description: 'معايير مخصصة، تقييم بالنجوم، وتقارير تفصيلية للنتائج',
                color: 'from-[#01645e] to-[#3ab666]'
              },
              {
                icon: <Trophy className="w-10 h-10" />,
                title: 'شهادات تلقائية',
                description: 'توليد وإرسال شهادات PDF مخصصة للمشاركين والفائزين تلقائياً',
                color: 'from-amber-500 to-orange-500'
              },
              {
                icon: <Mail className="w-10 h-10" />,
                title: 'قوالب بريد إلكتروني',
                description: 'قوالب جاهزة قابلة للتخصيص للدعوات والإشعارات',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: <Palette className="w-10 h-10" />,
                title: 'تصميم مخصص',
                description: 'خصص ألوان وشعارات نماذج التسجيل والصفحات',
                color: 'from-rose-500 to-red-500'
              },
              {
                icon: <Globe className="w-10 h-10" />,
                title: 'صفحات هبوط مخصصة',
                description: 'أنشئ صفحات هبوط احترافية لكل هاكاثون بنقرات قليلة',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: <Code className="w-10 h-10" />,
                title: 'API للمطورين',
                description: 'واجهة برمجية قوية للتكامل مع أنظمتك الخاصة',
                color: 'from-indigo-500 to-blue-500'
              },
              {
                icon: <Shield className="w-10 h-10" />,
                title: 'أمان متقدم',
                description: 'حماية بيانات المشاركين مع نسخ احتياطي تلقائي',
                color: 'from-slate-600 to-slate-800'
              },
              {
                icon: <Cloud className="w-10 h-10" />,
                title: 'سحابي بالكامل',
                description: 'لا حاجة لخوادم أو صيانة، كل شيء على السحابة',
                color: 'from-sky-500 to-blue-600'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full hover:shadow-xl transition group">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">خطط أسعار تناسب الجميع</h2>
            <p className="text-xl text-slate-300">ابدأ مجاناً وتوسع حسب احتياجاتك</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card className="p-8 border-2 border-slate-700 bg-slate-800/50 backdrop-blur">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">مجاني</h3>
                <p className="text-slate-400">للتجربة والهاكاثونات الصغيرة</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">0</span>
                <span className="text-slate-400 mr-2">ر.س / شهرياً</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'هاكاثون واحد نشط',
                  'حتى 50 مشارك',
                  'نظام تقييم أساسي',
                  'شهادات PDF تلقائية',
                  '100 بريد إلكتروني/شهر',
                  '1 جيجا تخزين'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-300">
                    <Check className="w-5 h-5 text-[#3ab666]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white">
                ابدأ مجاناً
              </Button>
            </Card>

            {/* Pro Plan */}
            <Card className="p-8 border-4 border-[#3ab666] bg-gradient-to-br from-[#01645e] to-[#3ab666] relative overflow-hidden">
              <div className="absolute -top-3 -right-3 bg-[#c3e956] text-slate-900 px-4 py-1 rounded-bl-2xl font-bold text-sm">
                الأكثر شعبية
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">احترافي</h3>
                <p className="text-[#c3e956]">للمؤسسات والفعاليات الكبيرة</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">299</span>
                <span className="text-white/80 mr-2">ر.س / شهرياً</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  '10 هاكاثونات نشطة',
                  'مشاركين غير محدودين',
                  'نظام تقييم متقدم',
                  'شهادات مخصصة بالكامل',
                  '5000 بريد إلكتروني/شهر',
                  '50 جيجا تخزين',
                  'صفحات هبوط مخصصة',
                  'دعم فني مباشر',
                  'API للمطورين'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-white">
                    <Check className="w-5 h-5 text-[#c3e956]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-white text-[#01645e] hover:bg-[#c3e956] font-bold">
                ابدأ تجربة 14 يوم
              </Button>
            </Card>

            {/* Enterprise Plan */}
            <Card className="p-8 border-2 border-slate-700 bg-slate-800/50 backdrop-blur">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">مؤسسات</h3>
                <p className="text-slate-400">حلول مخصصة للمؤسسات الكبيرة</p>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-white">تواصل معنا</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'هاكاثونات غير محدودة',
                  'كل مميزات الخطة الاحترافية',
                  'نطاق مخصص',
                  'SSO وتسجيل دخول موحد',
                  'SLA مضمون 99.9%',
                  'مدير حساب مخصص',
                  'تدريب للفريق',
                  'تخصيص كامل للمنصة',
                  'أولوية في الدعم الفني'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-300">
                    <Check className="w-5 h-5 text-[#3ab666]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white">
                تواصل للعرض الخاص
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">ماذا يقول عملاؤنا</h2>
            <p className="text-xl text-slate-600">آراء حقيقية من منظمي هاكاثونات ناجحة</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'أحمد المالكي',
                role: 'مدير الابتكار - جامعة الملك سعود',
                content: 'HackPro غيّر طريقة تنظيمنا للهاكاثونات. وفرنا أكثر من 70% من الوقت والجهد.',
                rating: 5
              },
              {
                name: 'سارة الغامدي',
                role: 'مديرة المشاريع - شركة تقنية',
                content: 'نظام التقييم المتقدم ساعدنا في اختيار أفضل المشاريع بشفافية عالية.',
                rating: 5
              },
              {
                name: 'محمد القحطاني',
                role: 'منظم فعاليات تقنية',
                content: 'الدعم الفني ممتاز والمنصة سهلة الاستخدام حتى للمبتدئين.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-xl transition">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic">&ldquo;{testimonial.content}&rdquo;</p>
                <div>
                  <p className="font-bold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-600">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#01645e] to-[#3ab666]">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            جاهز لإطلاق هاكاثونك القادم؟
          </h2>
          <p className="text-xl text-white/90 mb-8">
            انضم إلى مئات المنظمين الذين يثقون بـ HackPro
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-[#01645e] hover:bg-[#c3e956] text-lg px-12 py-6 font-bold">
              ابدأ الآن مجاناً
              <ArrowRight className="mr-2 w-5 h-5" />
            </Button>
          </Link>
          <p className="mt-4 text-white/80">تجربة مجانية 14 يوم • لا يتطلب بطاقة ائتمان</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#01645e] to-[#3ab666] rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">HackPro</span>
              </div>
              <p className="text-slate-400">منصة إدارة الهاكاثونات الأولى عربياً</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">المنتج</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#features" className="hover:text-white transition">المميزات</a></li>
                <li><a href="#pricing" className="hover:text-white transition">الأسعار</a></li>
                <li><a href="#" className="hover:text-white transition">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">الشركة</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">من نحن</a></li>
                <li><a href="#" className="hover:text-white transition">المدونة</a></li>
                <li><a href="#" className="hover:text-white transition">الوظائف</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">الدعم</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">المساعدة</a></li>
                <li><a href="#" className="hover:text-white transition">تواصل معنا</a></li>
                <li><a href="#" className="hover:text-white transition">سياسة الخصوصية</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2025 HackPro. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Fix missing Play component
function Play({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
