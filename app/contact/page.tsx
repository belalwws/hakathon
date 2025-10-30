'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { AnimatedSection } from '@/components/animated-section'
import { HoverCard } from '@/components/hover-card'
import { RippleButton } from '@/components/ripple-button'
import { BackgroundAnimations } from '@/components/background-animations'
import { useAnalytics } from '@/lib/analytics'
import { 
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  HeadphonesIcon,
  Globe
} from 'lucide-react'

export default function ContactPage() {
  const { language } = useLanguage()
  const analytics = useAnalytics()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    // Track form submission attempt
    analytics.trackFormSubmit('contact_form', true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('Form submitted:', formData)
    setSubmitting(false)
    // Reset form
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    alert(language === 'ar' ? 'تم إرسال رسالتك بنجاح!' : 'Your message has been sent successfully!')
  }

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: language === 'ar' ? 'البريد الإلكتروني' : 'Email',
      value: 'info@hackpro.com',
      href: 'mailto:info@hackpro.com',
      color: 'blue'
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: language === 'ar' ? 'الهاتف' : 'Phone',
      value: '+1 (555) 123-4567',
      href: 'tel:+15551234567',
      color: 'green'
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: language === 'ar' ? 'العنوان' : 'Address',
      value: language === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt',
      href: 'https://maps.google.com',
      color: 'red'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: language === 'ar' ? 'ساعات العمل' : 'Working Hours',
      value: language === 'ar' ? 'السبت - الخميس: 9 ص - 6 م' : 'Sat - Thu: 9 AM - 6 PM',
      href: null,
      color: 'purple'
    }
  ]

  const offices = [
    {
      city: language === 'ar' ? 'القاهرة' : 'Cairo',
      country: language === 'ar' ? 'مصر' : 'Egypt',
      address: language === 'ar' ? 'شارع التحرير، وسط البلد' : 'Tahrir Street, Downtown',
      phone: '+20 2 1234 5678'
    },
    {
      city: language === 'ar' ? 'دبي' : 'Dubai',
      country: language === 'ar' ? 'الإمارات' : 'UAE',
      address: language === 'ar' ? 'شارع الشيخ زايد' : 'Sheikh Zayed Road',
      phone: '+971 4 1234 5678'
    },
    {
      city: language === 'ar' ? 'الرياض' : 'Riyadh',
      country: language === 'ar' ? 'السعودية' : 'Saudi Arabia',
      address: language === 'ar' ? 'طريق الملك فهد' : 'King Fahd Road',
      phone: '+966 11 1234 567'
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
                <MessageSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {language === 'ar' ? 'نحن هنا للمساعدة' : "We're Here to Help"}
                </span>
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                {language === 'ar' ? 'تواصل معنا' : 'Get in Touch'}
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-gray-600 dark:text-gray-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {language === 'ar' 
                  ? 'لديك سؤال؟ نحن نحب أن نسمع منك. أرسل لنا رسالة وسنرد عليك في أقرب وقت ممكن'
                  : 'Have a question? We would love to hear from you. Send us a message and we will respond as soon as possible'}
              </motion.p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {contactInfo.map((info, index) => (
              <AnimatedSection key={index} delay={index * 0.1} direction="up">
                <HoverCard>
                  <a 
                    href={info.href || '#'}
                    className="block bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
                  >
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br from-${info.color}-500 to-${info.color}-600 text-white mb-4`}>
                      {info.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {info.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {info.value}
                    </p>
                  </a>
                </HoverCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* Contact Form */}
            <AnimatedSection direction="left">
              <HoverCard>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                      {language === 'ar' ? 'أرسل لنا رسالة' : 'Send Us a Message'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {language === 'ar' 
                        ? 'املأ النموذج وسنعود إليك خلال 24 ساعة'
                        : 'Fill out the form and we will get back to you within 24 hours'}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {language === 'ar' ? 'الاسم' : 'Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder={language === 'ar' ? 'اسمك الكامل' : 'Your full name'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder={language === 'ar' ? 'your@email.com' : 'your@email.com'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder={language === 'ar' ? '+20 123 456 7890' : '+1 234 567 8900'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {language === 'ar' ? 'الموضوع' : 'Subject'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder={language === 'ar' ? 'موضوع الرسالة' : 'Message subject'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {language === 'ar' ? 'الرسالة' : 'Message'}
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                        placeholder={language === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                      />
                    </div>

                    <RippleButton
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting 
                        ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...')
                        : (
                          <>
                            <Send className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                            {language === 'ar' ? 'إرسال الرسالة' : 'Send Message'}
                          </>
                        )
                      }
                    </RippleButton>
                  </form>
                </div>
              </HoverCard>
            </AnimatedSection>

            {/* Offices */}
            <AnimatedSection direction="right">
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
                  <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                    {language === 'ar' ? 'مكاتبنا' : 'Our Offices'}
                  </h2>
                  
                  <div className="space-y-6">
                    {offices.map((office, index) => (
                      <motion.div
                        key={index}
                        className="pb-6 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white">
                            <MapPin className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                              {office.city}, {office.country}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                              {office.address}
                            </p>
                            <a 
                              href={`tel:${office.phone}`}
                              className="text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              {office.phone}
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Support Card */}
                <HoverCard>
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-3xl shadow-xl text-white">
                    <HeadphonesIcon className="h-12 w-12 mb-4" />
                    <h3 className="text-2xl font-bold mb-4">
                      {language === 'ar' ? 'دعم على مدار الساعة' : '24/7 Support'}
                    </h3>
                    <p className="opacity-90 mb-6">
                      {language === 'ar'
                        ? 'فريق الدعم لدينا متاح على مدار الساعة لمساعدتك في أي استفسار'
                        : 'Our support team is available 24/7 to help you with any questions'}
                    </p>
                    <a 
                      href="mailto:support@hackpro.com"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-full font-semibold hover:shadow-xl transition-all"
                    >
                      <Mail className="h-5 w-5" />
                      support@hackpro.com
                    </a>
                  </div>
                </HoverCard>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                {language === 'ar' ? 'موقعنا على الخريطة' : 'Find Us on Map'}
              </h2>
              <div className="bg-gray-200 dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl" style={{ height: '500px' }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27632.267707393888!2d31.233333!3d30.044444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14583fa60b21beeb%3A0x79dfb296e8423bba!2sCairo%2C%20Egypt!5e0!3m2!1sen!2s!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
