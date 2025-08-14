"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Trophy, Users, Target, Lightbulb, Cog, TrendingUp, Presentation, Star, CheckCircle, Play, X, LogIn } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const [showDemo, setShowDemo] = useState(false)
  const router = useRouter()
  if (showDemo) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-[#01645e]">شاهد الشرح التوضيحي</h2>
              <button onClick={() => setShowDemo(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-block bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10 border border-[#01645e]/20 rounded-full px-6 py-3 mb-6">
                  <span className="text-[#01645e] font-semibold">📚 دليل الاستخدام</span>
                </div>
                <h3 className="text-2xl font-bold text-[#01645e] mb-4">كيفية استخدام نظام التقييم</h3>
                <p className="text-[#8b7632] text-lg">تعلم كيفية استخدام النظام خطوة بخطوة</p>
              </div>

              {/* Evaluation Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-3d rounded-3xl p-8 border border-[#01645e]/20 mb-8">
                <div className="text-center mb-6">
                  <div className="inline-block bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-6 py-3 rounded-full mb-4">
                    <span className="font-bold">🎯 معايير التقييم</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#01645e] mb-2">خمسة معايير أساسية للتقييم</h3>
                  <p className="text-[#8b7632]">سيتم تقييم كل فريق بناءً على هذه المعايير المحددة</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "الجدوى", weight: "20%", color: "#01645e" },
                    { name: "ابتكارية الفكرة", weight: "25%", color: "#3ab666" },
                    { name: "قابلية التطبيق", weight: "25%", color: "#c3e956" },
                    { name: "التأثير على المؤسسة", weight: "20%", color: "#8b7632" },
                    { name: "مهارات العرض", weight: "10%", color: "#01645e" },
                  ].map((criterion, index) => (
                    <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }} className="glass rounded-2xl p-4 border border-white/20 text-center">
                      <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold" style={{ backgroundColor: criterion.color }}>
                        {criterion.weight}
                      </div>
                      <h4 className="font-bold text-[#01645e] text-sm">{criterion.name}</h4>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Steps Guide */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { step: "1", title: "تسجيل الدخول", desc: "ادخل بيانات المقيم للوصول إلى لوحة التقييم", icon: LogIn, color: "#01645e" },
                  { step: "2", title: "إدخال بيانات الفرق", desc: "أضف أسماء الفرق المشاركة في الهاكاثون", icon: Users, color: "#3ab666" },
                  { step: "3", title: "بدء التقييم", desc: "قيم كل فريق حسب المعايير الخمسة المحددة", icon: Star, color: "#c3e956" },
                  { step: "4", title: "عرض النتائج", desc: "شاهد النتائج النهائية مرتبة حسب الدرجات", icon: Trophy, color: "#8b7632" },
                ].map((item, index) => (
                  <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="glass rounded-2xl p-6 border border-white/20">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg" style={{ backgroundColor: item.color }}>
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <item.icon className="w-5 h-5" style={{ color: item.color }} />
                          <h4 className="font-bold text-[#01645e]">{item.title}</h4>
                        </div>
                        <p className="text-[#8b7632] text-sm">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center pt-6">
                <motion.button onClick={() => { setShowDemo(false); router.push("/login") }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-8 py-4 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  ابدأ التقييم الآن
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 relative overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-[#c3e956]/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex items-center space-x-4 rtl:space-x-reverse">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Copy%20of%20%D8%A7%D9%84%D9%87%D9%88%D9%8A%D8%A9%20%D8%A7%D9%84%D9%85%D8%B4%D8%AA%D8%B1%D9%83%D8%A9%20%D9%84%D9%87%D8%A7%D9%83%D8%A7%D8%AB%D9%88%D9%86%20%D8%A7%D9%84%D8%A7%D8%A8%D8%AA%D9%83%D8%A7%D8%B1%20%D9%81%D9%89%20%D8%A7%D9%84%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%A7%D9%84%D8%AD%D9%83%D9%88%D9%85%D9%8A%D8%A9%20%20_20250811_071941_0000-mhYmT6CBMBAiGfKtW6ODkUAWW0nPfS.png"
                alt="هاكاثون الابتكار في الخدمات الحكومية"
                className="h-16 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-[#01645e]">هاكاثون الابتكار الحكومي</h1>
                <p className="text-sm text-[#8b7632]">نظام التقييم الاحترافي المتطور</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
              <nav className="flex space-x-8 rtl:space-x-reverse">
                <a href="#features" className="text-[#01645e] hover:text-[#3ab666] font-medium transition-colors">المميزات</a>
                <a href="#criteria" className="text-[#01645e] hover:text-[#3ab666] font-medium transition-colors">معايير التقييم</a>
              </nav>
              <Link href="/login" className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-5 py-2.5 rounded-xl font-semibold shadow hover:from-[#014a46] hover:to-[#2d8f52]">
                تسجيل الدخول
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center lg:text-right">
              <div className="mb-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring", stiffness: 200 }} className="inline-block">
                  <div className="bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10 border border-[#01645e]/20 rounded-full px-6 py-3 mb-6">
                    <span className="text-[#01645e] font-semibold text-lg">🏆 المنصة الرسمية للتقييم</span>
                  </div>
                </motion.div>

                <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-[#01645e] to-[#3ab666] bg-clip-text text-transparent">نظام تقييم</span>
                  <br />
                  <span className="bg-gradient-to-r from-[#3ab666] to-[#c3e956] bg-clip-text text-transparent">هاكاثون الابتكار</span>
                  <br />
                  <span className="bg-gradient-to-r from-[#c3e956] to-[#8b7632] bg-clip-text text-transparent">الحكومي</span>
                </h1>

                <p className="text-xl md:text-2xl text-[#8b7632] mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  منصة احترافية وتفاعلية مدعومة بأحدث التقنيات لتقييم وترتيب فرق الهاكاثون باستخدام معايير دقيقة ونظام تقييم متقدم يضمن العدالة والشفافية
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <motion.button onClick={() => setShowDemo(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-white/10 backdrop-blur-sm border border-white/20 text-[#01645e] px-10 py-5 text-xl font-bold rounded-2xl shadow-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-3">
                    <Play className="w-6 h-6" />
                    شاهد الشرح التوضيحي
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Image */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1000%20%D9%85%D9%8A%D8%AD%D8%A7-OcJeqRH84ElCNSZ3bbGOFHaUtukCye.png" alt="فريق هاكاثون الابتكار يعمل في بيئة تقنية متطورة" className="w-full h-auto object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#01645e]/20 to-transparent" />

                {/* Floating Stats */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.6 }} className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#01645e]">نشط الآن</div>
                      <div className="text-sm text-[#8b7632]">جلسة تقييم مباشرة</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.6 }} className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#01645e] to-[#3ab666] rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#01645e]">4.9/5</div>
                      <div className="text-sm text-[#8b7632]">تقييم المستخدمين</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-[#01645e]/20 to-[#3ab666]/20 rounded-full blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-[#3ab666]/20 to-[#c3e956]/20 rounded-full blur-xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10 border border-[#01645e]/20 rounded-full px-6 py-3 mb-6">
              <span className="text-[#01645e] font-semibold">✨ لماذا نظامنا الأفضل؟</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#01645e] mb-6">مميزات تجعلنا <span className="text-[#3ab666]">الخيار الأول</span></h2>
            <p className="text-xl text-[#8b7632] max-w-3xl mx-auto leading-relaxed">نوفر تجربة تقييم شاملة ومتقدمة تضمن العدالة والشفافية مع أحدث التقنيات والمعايير العالمية</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Trophy, title: "تقييم احترافي", desc: "نظام تقييم متقدم بمعايير واضحة ومحددة وفقاً لأفضل الممارسات العالمية", gradient: "from-[#01645e] to-[#3ab666]" },
              { icon: Users, title: "إدارة الفرق", desc: "تنظيم وإدارة فرق الهاكاثون بسهولة مع إمكانية تتبع الأداء والتقدم", gradient: "from-[#3ab666] to-[#c3e956]" },
              { icon: Target, title: "معايير دقيقة", desc: "5 معايير أساسية مع أوزان محددة تضمن تقييماً عادلاً وشاملاً", gradient: "from-[#c3e956] to-[#8b7632]" },
              { icon: Star, title: "تجربة تفاعلية", desc: "واجهة سهلة الاستخدام وتفاعلية مع تصميم عصري ومتجاوب", gradient: "from-[#8b7632] to-[#01645e]" },
            ].map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.6 }} whileHover={{ scale: 1.05, y: -10 }} className="group relative">
                <div className="glass rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border border-white/20 relative overflow-hidden">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                  <div className="relative z-10">
                    <div className="flex justify-center mb-6">
                      <div className={`p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-[#01645e] mb-4 text-center group-hover:text-[#3ab666] transition-colors">{feature.title}</h3>
                    <p className="text-[#8b7632] text-center leading-relaxed">{feature.desc}</p>
                  </div>

                  {/* Decorative Corner */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-3xl" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Criteria Section */}
      <section id="criteria" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10 border border-[#01645e]/20 rounded-full px-6 py-3 mb-6">
              <span className="text-[#01645e] font-semibold">📊 معايير التقييم</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#01645e] mb-6">
              <span className="text-[#3ab666]">خمسة معايير</span> أساسية
            </h2>
            <p className="text-xl text-[#8b7632] max-w-3xl mx-auto">
              نظام تقييم شامل ومتوازن يغطي جميع جوانب المشروع من الفكرة إلى التنفيذ
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "الجدوى",
                weight: "20%",
                color: "#01645e",
                icon: Target,
                desc:
                  "مدى قدرة الفكرة على تحقيق قيمة واضحة وعائد ملموس للمؤسسة، مع قابلية استدامتها على المدى الطويل، وتوازن التكلفة مع الفوائد المتوقعة.",
              },
              {
                title: "ابتكارية الفكرة",
                weight: "25%",
                color: "#3ab666",
                icon: Lightbulb,
                desc:
                  "مدى إبداع الفكرة وجديدتها. هل تقدم الفكرة حلولًا مبتكرة لتحديات أو احتياجات قائمة؟ هل هناك تفكير متجدد يعكس تميز الفكرة ويعزز من فعالية العمليات في المؤسسة؟",
              },
              {
                title: "قابلية التطبيق",
                weight: "25%",
                color: "#c3e956",
                icon: Cog,
                desc:
                  "إمكانية تنفيذ الفكرة باستخدام الموارد المتاحة ضمن المعايير والقيود المحددة. هل يمكن تطبيق الفكرة في الإطار الزمني والمالي المحدد؟ وهل الفكرة قابلة للتنفيذ ضمن البيئات والظروف المتاحة؟",
              },
              {
                title: "التأثير على المؤسسة",
                weight: "20%",
                color: "#8b7632",
                icon: TrendingUp,
                desc:
                  "يركز هذا المعيار على تأثير الفكرة في تحسين أداء المؤسسة. هل ستسهم الفكرة في تعزيز كفاءة العمل ورفع الإنتاجية داخل المؤسسة؟ وهل سيكون لها تأثير إيجابي على العمليات والنتائج التشغيلية؟",
              },
              {
                title: "مهارات العرض",
                weight: "10%",
                color: "#01645e",
                icon: Presentation,
                desc:
                  "يتم تقييم طريقة تقديم الفكرة من قبل الفريق. كيف يعرض الفريق فكرته بشكل احترافي ومقنع؟ هل العرض واضح ومنظم بطريقة تسهل فهم الفكرة من قبل المعنيين في المؤسسة؟",
              },
            ].map((criterion, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.6 }} className="glass rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border border-white/20 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg" style={{ backgroundColor: criterion.color }}>
                    {criterion.weight}
                  </div>
                  <h3 className="text-xl font-bold text-[#01645e]">{criterion.title}</h3>
                </div>
                <p className="text-[#8b7632]">{criterion.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Link href="/login" className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-10 py-5 text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center justify-center">
            ابدأ التقييم الآن
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md shadow-inner border-t border-[#c3e956]/30 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-[#8b7632]">
            جميع الحقوق محفوظة &copy; {new Date().getFullYear()} هاكاثون الابتكار الحكومي
          </p>
        </div>
      </footer>

      {/* Background Circles */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#c3e956]/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/4" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#01645e]/10 rounded-full blur-[150px] translate-x-1/2 translate-y-1/4" />
    </div>
  )
}
