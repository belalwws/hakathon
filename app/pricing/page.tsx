'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { AnimatedSection } from '@/components/animated-section'
import { HoverCard } from '@/components/hover-card'
import { RippleButton } from '@/components/ripple-button'
import { BackgroundAnimations } from '@/components/background-animations'
import { Badge } from '@/components/ui/badge'
import { 
  Check,
  X,
  Zap,
  Building2,
  Rocket,
  Crown,
  ArrowRight
} from 'lucide-react'

export default function PricingPage() {
  const { language } = useLanguage()
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const plans = [
    {
      name: language === 'ar' ? 'البداية' : 'Starter',
      description: language === 'ar' ? 'للمسابقات الصغيرة' : 'For small hackathons',
      icon: <Zap className="h-8 w-8" />,
      monthlyPrice: 0,
      yearlyPrice: 0,
      color: 'blue',
      popular: false,
      features: [
        { name: language === 'ar' ? '1 منظمة' : '1 Organization', included: true },
        { name: language === 'ar' ? 'حتى 50 مشارك' : 'Up to 50 participants', included: true },
        { name: language === 'ar' ? '3 حكام' : '3 Judges', included: true },
        { name: language === 'ar' ? 'تقارير أساسية' : 'Basic reports', included: true },
        { name: language === 'ar' ? 'دعم عبر البريد' : 'Email support', included: true },
        { name: language === 'ar' ? 'شهادات رقمية' : 'Digital certificates', included: false },
        { name: language === 'ar' ? 'تخصيص العلامة التجارية' : 'Brand customization', included: false },
        { name: language === 'ar' ? 'دعم ذو أولوية' : 'Priority support', included: false }
      ]
    },
    {
      name: language === 'ar' ? 'الاحترافي' : 'Professional',
      description: language === 'ar' ? 'للمنظمات المتنامية' : 'For growing organizations',
      icon: <Building2 className="h-8 w-8" />,
      monthlyPrice: 99,
      yearlyPrice: 990,
      color: 'indigo',
      popular: true,
      features: [
        { name: language === 'ar' ? '3 منظمات' : '3 Organizations', included: true },
        { name: language === 'ar' ? 'حتى 500 مشارك' : 'Up to 500 participants', included: true },
        { name: language === 'ar' ? '20 حكم' : '20 Judges', included: true },
        { name: language === 'ar' ? 'تقارير متقدمة' : 'Advanced reports', included: true },
        { name: language === 'ar' ? 'دعم عبر البريد' : 'Email support', included: true },
        { name: language === 'ar' ? 'شهادات رقمية' : 'Digital certificates', included: true },
        { name: language === 'ar' ? 'تخصيص العلامة التجارية' : 'Brand customization', included: true },
        { name: language === 'ar' ? 'دعم ذو أولوية' : 'Priority support', included: false }
      ]
    },
    {
      name: language === 'ar' ? 'المؤسسات' : 'Enterprise',
      description: language === 'ar' ? 'للمنظمات الكبيرة' : 'For large organizations',
      icon: <Rocket className="h-8 w-8" />,
      monthlyPrice: 299,
      yearlyPrice: 2990,
      color: 'purple',
      popular: false,
      features: [
        { name: language === 'ar' ? 'منظمات غير محدودة' : 'Unlimited organizations', included: true },
        { name: language === 'ar' ? 'مشاركين غير محدودين' : 'Unlimited participants', included: true },
        { name: language === 'ar' ? 'حكام غير محدودين' : 'Unlimited judges', included: true },
        { name: language === 'ar' ? 'تقارير مخصصة' : 'Custom reports', included: true },
        { name: language === 'ar' ? 'دعم 24/7' : '24/7 Support', included: true },
        { name: language === 'ar' ? 'شهادات رقمية' : 'Digital certificates', included: true },
        { name: language === 'ar' ? 'تخصيص كامل' : 'Full customization', included: true },
        { name: language === 'ar' ? 'مدير حساب مخصص' : 'Dedicated account manager', included: true }
      ]
    },
    {
      name: language === 'ar' ? 'مخصص' : 'Custom',
      description: language === 'ar' ? 'حلول مخصصة' : 'Custom solutions',
      icon: <Crown className="h-8 w-8" />,
      monthlyPrice: null,
      yearlyPrice: null,
      color: 'amber',
      popular: false,
      features: [
        { name: language === 'ar' ? 'كل ميزات المؤسسات' : 'All Enterprise features', included: true },
        { name: language === 'ar' ? 'تطوير مخصص' : 'Custom development', included: true },
        { name: language === 'ar' ? 'استضافة خاصة' : 'Private hosting', included: true },
        { name: language === 'ar' ? 'اتفاقية SLA' : 'SLA agreement', included: true },
        { name: language === 'ar' ? 'تدريب متخصص' : 'Specialized training', included: true },
        { name: language === 'ar' ? 'دمج مع أنظمتك' : 'Integration with your systems', included: true },
        { name: language === 'ar' ? 'استشارات مجانية' : 'Free consultations', included: true },
        { name: language === 'ar' ? 'أولوية قصوى' : 'Highest priority', included: true }
      ]
    }
  ]

  const faqs = [
    {
      question: language === 'ar' ? 'هل يمكنني تغيير الخطة لاحقاً؟' : 'Can I change my plan later?',
      answer: language === 'ar' 
        ? 'نعم، يمكنك ترقية أو تخفيض خطتك في أي وقت. سيتم احتساب الفرق بشكل تناسبي.'
        : 'Yes, you can upgrade or downgrade your plan at any time. The difference will be prorated.'
    },
    {
      question: language === 'ar' ? 'هل هناك رسوم إضافية؟' : 'Are there any additional fees?',
      answer: language === 'ar'
        ? 'لا، جميع الميزات المدرجة في خطتك متضمنة في السعر. لا توجد رسوم خفية.'
        : 'No, all features listed in your plan are included in the price. No hidden fees.'
    },
    {
      question: language === 'ar' ? 'ماذا يحدث إذا تجاوزت الحد؟' : 'What happens if I exceed the limit?',
      answer: language === 'ar'
        ? 'سنتواصل معك لترقية خطتك. لن يتم إيقاف خدمتك فجأة.'
        : 'We will contact you to upgrade your plan. Your service will not be stopped suddenly.'
    },
    {
      question: language === 'ar' ? 'هل يمكنني الإلغاء في أي وقت؟' : 'Can I cancel at any time?',
      answer: language === 'ar'
        ? 'نعم، يمكنك إلغاء اشتراكك في أي وقت. لن يتم تحصيل رسوم للفترة القادمة.'
        : 'Yes, you can cancel your subscription at any time. You will not be charged for the next period.'
    }
  ]

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
                  {language === 'ar' ? 'أسعار شفافة' : 'Transparent Pricing'}
                </span>
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                {language === 'ar' ? 'خطط تناسب احتياجاتك' : 'Plans That Fit Your Needs'}
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {language === 'ar' 
                  ? 'اختر الخطة المناسبة لك وابدأ في تنظيم مسابقاتك اليوم'
                  : 'Choose the right plan for you and start organizing your hackathons today'}
              </motion.p>

              {/* Billing Toggle */}
              <motion.div
                className="inline-flex items-center gap-4 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-6 py-3 rounded-full font-medium transition-all ${
                    billingPeriod === 'monthly'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {language === 'ar' ? 'شهري' : 'Monthly'}
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`px-6 py-3 rounded-full font-medium transition-all relative ${
                    billingPeriod === 'yearly'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {language === 'ar' ? 'سنوي' : 'Yearly'}
                  <Badge className="absolute -top-2 -right-2 bg-green-500 text-white">
                    {language === 'ar' ? 'وفر 17%' : 'Save 17%'}
                  </Badge>
                </button>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <AnimatedSection key={index} delay={index * 0.1} direction="up">
                <HoverCard intensity={plan.popular ? 25 : 15}>
                  <div className={`relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border-2 h-full flex flex-col ${
                    plan.popular 
                      ? 'border-indigo-500 dark:border-indigo-400' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1">
                          {language === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
                        </Badge>
                      </div>
                    )}

                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br from-${plan.color}-500 to-${plan.color}-600 text-white mb-6 w-fit`}>
                      {plan.icon}
                    </div>

                    <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {plan.description}
                    </p>

                    <div className="mb-8">
                      {plan.monthlyPrice !== null ? (
                        <>
                          <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold text-gray-900 dark:text-white">
                              ${billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {billingPeriod === 'monthly' 
                                ? (language === 'ar' ? '/شهر' : '/month')
                                : (language === 'ar' ? '/سنة' : '/year')}
                            </span>
                          </div>
                          {billingPeriod === 'yearly' && plan.monthlyPrice > 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                              {language === 'ar' 
                                ? `${Math.round(plan.yearlyPrice / 12)}$ شهرياً`
                                : `$${Math.round(plan.yearlyPrice / 12)}/month`}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {language === 'ar' ? 'اتصل بنا' : 'Contact Us'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 mb-8 flex-grow">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={`text-sm ${
                            feature.included 
                              ? 'text-gray-700 dark:text-gray-300' 
                              : 'text-gray-400 dark:text-gray-600'
                          }`}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    <RippleButton
                      className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                      }`}
                    >
                      {plan.monthlyPrice !== null 
                        ? (language === 'ar' ? 'ابدأ الآن' : 'Get Started')
                        : (language === 'ar' ? 'تواصل معنا' : 'Contact Sales')}
                      <ArrowRight className={`h-5 w-5 ${language === 'ar' ? 'mr-2' : 'ml-2'}`} />
                    </RippleButton>
                  </div>
                </HoverCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 bg-white dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                {language === 'ar' ? 'أسئلة شائعة' : 'Frequently Asked Questions'}
              </h2>
            </div>
          </AnimatedSection>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <HoverCard>
                  <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {faq.answer}
                    </p>
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
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {language === 'ar' ? 'لا تزال لديك أسئلة؟' : 'Still Have Questions?'}
              </h2>
              <p className="text-xl mb-8 opacity-90">
                {language === 'ar'
                  ? 'تواصل مع فريقنا للحصول على استشارة مجانية'
                  : 'Contact our team for a free consultation'}
              </p>
              <motion.a
                href="/contact"
                className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-full font-semibold text-lg hover:shadow-2xl transition-all hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
              </motion.a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
