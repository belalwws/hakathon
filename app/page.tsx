"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BackgroundAnimations } from "@/components/background-animations"
import { FAQSection } from "@/components/faq-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { AnimatedSection } from "@/components/animated-section"
import { RippleButton } from "@/components/ripple-button"
import { HoverCard } from "@/components/hover-card"
import { AnimatedCounter, ParallaxSection, FloatingElement } from "@/components/advanced-animations"
import { 
  ArrowLeft,
  ArrowRight,
  Rocket, 
  Users, 
  Award, 
  TrendingUp,
  Zap,
  Shield,
  Globe,
  BarChart3,
  CheckCircle2,
  Star,
  Building2,
  Clock,
  Database,
  Sparkles,
  Code2,
  Brain,
  Target
} from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { theme } = useTheme()
  const { t, language } = useLanguage()

  console.log('🏠 [HomePage] Rendering - loading:', loading, 'user:', user?.email || 'none', 'role:', user?.role || 'none')

  if (loading) {
    console.log('⏳ [HomePage] Still loading auth...')
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 dark:border-indigo-800 dark:border-t-indigo-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-indigo-600 dark:text-indigo-400 font-semibold">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  // Helper function للـ redirect حسب الدور
  const handleDashboardClick = () => {
    if (!user) {
      router.push('/login')
      return
    }

    switch (user.role) {
      case 'master':
        router.push('/master')
        break
      case 'admin':
        router.push('/admin/dashboard')
        break
      case 'judge':
        router.push('/judge/dashboard')
        break
      case 'supervisor':
        router.push('/supervisor/dashboard')
        break
      case 'expert':
        router.push('/expert/dashboard')
        break
      case 'participant':
        router.push('/participant/dashboard')
        break
      default:
        router.push('/login')
    }
  }

  // Landing Page للجميع - مسجلين وغير مسجلين
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* Hero Section - Inspired by devino.ca */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Background Animations */}
        <div className="absolute inset-0">
          <BackgroundAnimations />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-32">
          <div className="max-w-6xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <Badge className="px-6 py-3 text-sm font-medium bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-lg backdrop-blur-sm">
                <Sparkles className="h-4 w-4 ml-2 inline animate-pulse" />
                {t('hero.badge')}
              </Badge>
            </motion.div>

            {/* Main Heading with Gradient Animation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center mb-8"
            >
              <h1 className={`text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight mb-6 ${
                language === 'ar' ? 'font-arabic' : ''
              }`}>
                <span className="block text-gray-900 dark:text-white mb-4">
                  {t('hero.title.1')}
                </span>
                <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto]">
                  {t('hero.title.2')}
                </span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl sm:text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 text-center mb-12 max-w-4xl mx-auto leading-relaxed font-light"
            >
              {t('hero.description')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            >
              {user ? (
                <Button 
                  size="lg" 
                  className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 dark:hover:from-indigo-600 dark:hover:to-purple-600 text-white px-12 py-7 text-lg rounded-2xl shadow-2xl hover:shadow-indigo-500/50 dark:shadow-indigo-900/50 transition-all transform hover:scale-105"
                  onClick={handleDashboardClick}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Rocket className={`h-6 w-6 ${language === 'ar' ? 'ml-2' : 'mr-2'} group-hover:animate-bounce`} />
                    {t('hero.cta.dashboard')}
                  </span>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity blur-xl"></div>
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 dark:hover:from-indigo-600 dark:hover:to-purple-600 text-white px-12 py-7 text-lg rounded-2xl shadow-2xl hover:shadow-indigo-500/50 dark:shadow-indigo-900/50 transition-all transform hover:scale-105"
                    onClick={() => router.push('/register')}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Rocket className={`h-6 w-6 ${language === 'ar' ? 'ml-2' : 'mr-2'} group-hover:animate-bounce`} />
                      {t('hero.cta.start')}
                    </span>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity blur-xl"></div>
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="px-12 py-7 text-lg rounded-2xl border-2 border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-gray-900 dark:text-white transition-all transform hover:scale-105"
                    onClick={() => router.push('/login')}
                  >
                    <span className="flex items-center gap-2">
                      {t('hero.cta.demo')}
                      {language === 'ar' ? (
                        <ArrowLeft className="h-5 w-5" />
                      ) : (
                        <ArrowRight className="h-5 w-5" />
                      )}
                    </span>
                  </Button>
                </>
              )}
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600 dark:text-gray-400"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
                <span>{t('hero.check.1')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
                <span>{t('hero.check.2')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
                <span>{t('hero.check.3')}</span>
              </div>
            </motion.div>

            {/* Floating Feature Cards */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-24"
            >
              <FloatingCard
                icon={<Code2 className="h-8 w-8" />}
                title={language === 'ar' ? 'واجهة حديثة' : 'Modern UI'}
                description={language === 'ar' ? 'تصميم عصري وسهل' : 'Beautiful & Easy'}
                delay={0.6}
              />
              <FloatingCard
                icon={<Brain className="h-8 w-8" />}
                title={language === 'ar' ? 'ذكاء اصطناعي' : 'AI Powered'}
                description={language === 'ar' ? 'تحليلات ذكية' : 'Smart Analytics'}
                delay={0.7}
              />
              <FloatingCard
                icon={<Shield className="h-8 w-8" />}
                title={language === 'ar' ? 'آمن 100%' : '100% Secure'}
                description={language === 'ar' ? 'حماية متقدمة' : 'Enterprise Security'}
                delay={0.8}
              />
              <FloatingCard
                icon={<Target className="h-8 w-8" />}
                title={language === 'ar' ? 'دقة عالية' : 'High Precision'}
                description={language === 'ar' ? 'نتائج موثوقة' : 'Reliable Results'}
                delay={0.9}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <AnimatedSection delay={0.1}>
              <StatCard number={t('stats.1.number')} label={t('stats.1.label')} isWhite />
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <StatCard number={t('stats.2.number')} label={t('stats.2.label')} isWhite />
            </AnimatedSection>
            <AnimatedSection delay={0.3}>
              <StatCard number={t('stats.3.number')} label={t('stats.3.label')} isWhite />
            </AnimatedSection>
            <AnimatedSection delay={0.4}>
              <StatCard number={t('stats.4.number')} label={t('stats.4.label')} isWhite />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 relative overflow-hidden transition-colors">
        <div className="absolute inset-0">
          <BackgroundAnimations />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
              {t('features.badge')}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('features.description')}
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatedSection delay={0.1}>
              <HoverCard>
                <FeatureCard 
                  icon={<Building2 className="h-8 w-8" />}
                  title={t('feature.1.title')}
                  description={t('feature.1.description')}
                  color="indigo"
                />
              </HoverCard>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <HoverCard>
                <FeatureCard 
                  icon={<Users className="h-8 w-8" />}
                  title={t('feature.2.title')}
                  description={t('feature.2.description')}
                  color="purple"
                />
              </HoverCard>
            </AnimatedSection>
            <AnimatedSection delay={0.3}>
              <HoverCard>
                <FeatureCard 
                  icon={<Award className="h-8 w-8" />}
                  title={t('feature.3.title')}
                  description={t('feature.3.description')}
                  color="pink"
                />
              </HoverCard>
            </AnimatedSection>
            <AnimatedSection delay={0.4}>
              <HoverCard>
                <FeatureCard 
                  icon={<BarChart3 className="h-8 w-8" />}
                  title={t('feature.4.title')}
                  description={t('feature.4.description')}
                  color="indigo"
                />
              </HoverCard>
            </AnimatedSection>
            <AnimatedSection delay={0.5}>
              <HoverCard>
                <FeatureCard 
                  icon={<Shield className="h-8 w-8" />}
                  title={t('feature.5.title')}
                  description={t('feature.5.description')}
                  color="purple"
                />
              </HoverCard>
            </AnimatedSection>
            <AnimatedSection delay={0.6}>
              <HoverCard>
                <FeatureCard 
                  icon={<Zap className="h-8 w-8" />}
                  title={t('feature.6.title')}
                  description={t('feature.6.description')}
                  color="pink"
                />
              </HoverCard>
            </AnimatedSection>
            <AnimatedSection delay={0.7}>
              <HoverCard>
                <FeatureCard 
                  icon={<Globe className="h-8 w-8" />}
                  title={t('feature.7.title')}
                  description={t('feature.7.description')}
                  color="indigo"
                />
              </HoverCard>
            </AnimatedSection>
            <AnimatedSection delay={0.8}>
              <HoverCard>
                <FeatureCard 
                  icon={<Database className="h-8 w-8" />}
                  title={t('feature.8.title')}
                  description={t('feature.8.description')}
                  color="purple"
                />
              </HoverCard>
            </AnimatedSection>
            <AnimatedSection delay={0.9}>
              <HoverCard>
                <FeatureCard 
                  icon={<Clock className="h-8 w-8" />}
                  title={t('feature.9.title')}
                  description={t('feature.9.description')}
                  color="pink"
                />
              </HoverCard>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden transition-colors">
        <div className="absolute inset-0">
          <BackgroundAnimations />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
              {t('pricing.badge')}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('pricing.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('pricing.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <PricingCard 
              name="Free"
              price={t('pricing.free')}
              description="للمبتدئين والتجربة"
              features={[
                "1 هاكاثون",
                "حتى 50 مشارك",
                "3 محكمين",
                "تقارير أساسية",
                "دعم Email"
              ]}
              color="gray"
              popular={false}
              language={language}
              t={t}
            />
            <PricingCard 
              name="Starter"
              price="$29"
              period={t('pricing.monthly')}
              description="للجامعات والمؤسسات الصغيرة"
              features={[
                "5 هاكاثونات",
                "حتى 200 مشارك",
                "10 محكمين",
                "تقارير متقدمة",
                "دعم Email + Chat",
                "شهادات مخصصة"
              ]}
              color="indigo"
              popular={false}
              language={language}
              t={t}
            />
            <PricingCard 
              name="Professional"
              price="$99"
              period={t('pricing.monthly')}
              description="للشركات والمؤسسات المتوسطة"
              features={[
                "هاكاثونات غير محدودة",
                "حتى 1000 مشارك",
                "محكمين غير محدود",
                "تقارير كاملة + AI",
                "دعم Priority",
                "API Access",
                "Custom Domain",
                "White Label"
              ]}
              color="purple"
              popular={true}
              language={language}
              t={t}
            />
            <PricingCard 
              name="Enterprise"
              price={t('pricing.custom')}
              description="للمؤسسات الكبيرة"
              features={[
                "كل شيء غير محدود",
                "SLA مضمون",
                "Dedicated Support",
                "On-premise متاح",
                "Custom Development",
                "Training Sessions",
                "Security Audit"
              ]}
              color="pink"
              popular={false}
              language={language}
              t={t}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 relative overflow-hidden transition-colors">
        <div className="absolute inset-0 opacity-20">
          <BackgroundAnimations />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('cta.title')}
            </h2>
            <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
              {t('cta.description')}
            </p>
            <RippleButton 
              size="lg"
              className="bg-white text-indigo-600 hover:bg-indigo-50 px-12 py-7 text-lg rounded-2xl shadow-2xl hover:shadow-white/20 transition-all transform hover:scale-105"
              onClick={() => router.push('/register')}
            >
              <Rocket className={`h-6 w-6 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
              {t('cta.button')}
            </RippleButton>
          </AnimatedSection>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-300 dark:text-gray-400 py-16 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">HackPro</span>
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {t('footer.tagline')}
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">{t('footer.product')}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.features')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.pricing')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.security')}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">{t('footer.company')}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.about')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.blog')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">{t('footer.legal')}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.license')}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 dark:border-gray-900 pt-8 text-center text-sm text-gray-400 dark:text-gray-500">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FloatingCard({
  icon,
  title,
  description,
  delay
}: {
  icon: React.ReactNode
  title: string
  description: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-400/5 dark:to-purple-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </motion.div>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  color 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  color: 'indigo' | 'purple' | 'pink'
}) {
  const colorClasses = {
    indigo: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400',
    purple: 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
    pink: 'bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400'
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 group">
      <div className={`w-14 h-14 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}

function StatCard({ number, label, isWhite = false }: { number: string; label: string; isWhite?: boolean }) {
  // Extract number from string like "50K+" -> 50000
  const cleanNumber = number.replace(/[^0-9]/g, '')
  const numericValue = cleanNumber ? parseInt(cleanNumber) : 0
  const suffix = number.replace(/[0-9]/g, '')
  
  const textColor = isWhite 
    ? "text-white" 
    : "text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
  
  const labelColor = isWhite
    ? "text-white/90"
    : "text-gray-600 dark:text-gray-400"
  
  return (
    <div className="group">
      {numericValue > 0 ? (
        <AnimatedCounter 
          end={numericValue} 
          suffix={suffix}
          className={`text-4xl md:text-5xl font-bold mb-2 transition-all duration-300 ${textColor}`}
        />
      ) : (
        <div className={`text-4xl md:text-5xl font-bold mb-2 transition-all duration-300 ${textColor}`}>
          {number}
        </div>
      )}
      <div className={`text-sm md:text-base font-medium ${labelColor}`}>{label}</div>
    </div>
  )
}

function PricingCard({ 
  name, 
  price, 
  period,
  description, 
  features, 
  color,
  popular,
  language,
  t
}: { 
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  color: 'gray' | 'indigo' | 'purple' | 'pink'
  popular: boolean
  language: 'ar' | 'en'
  t: (key: string) => string
}) {
  const colorClasses = {
    gray: {
      border: 'border-gray-200 dark:border-gray-800',
      badge: 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300',
      button: 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white'
    },
    indigo: {
      border: 'border-indigo-200 dark:border-indigo-800',
      badge: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300',
      button: 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white'
    },
    purple: {
      border: 'border-purple-200 dark:border-purple-800 ring-2 ring-purple-500 dark:ring-purple-600',
      badge: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300',
      button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 dark:hover:from-indigo-600 dark:hover:to-purple-600 text-white'
    },
    pink: {
      border: 'border-pink-200 dark:border-pink-800',
      badge: 'bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300',
      button: 'bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600 text-white'
    }
  }

  return (
    <div className={`relative bg-white dark:bg-gray-900 rounded-2xl p-8 border-2 ${colorClasses[color].border} hover:shadow-2xl transition-all duration-300 ${popular ? 'transform scale-105' : ''}`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white px-4 py-1 shadow-lg">
            <Star className={`h-3 w-3 ${language === 'ar' ? 'ml-1' : 'mr-1'} inline fill-current`} />
            {t('pricing.popular')}
          </Badge>
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{name}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{description}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">{price}</span>
          {period && <span className="text-gray-600 dark:text-gray-400">{period}</span>}
        </div>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      <Button 
        className={`w-full ${colorClasses[color].button}`}
        size="lg"
      >
        {t('pricing.cta')}
        {language === 'ar' ? (
          <ArrowLeft className="mr-2 h-4 w-4" />
        ) : (
          <ArrowRight className="ml-2 h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
