'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

interface Testimonial {
  name: string
  role: string
  company: string
  content: string
  rating: number
  avatar: string
}

const testimonials: Record<'ar' | 'en', Testimonial[]> = {
  ar: [
    {
      name: 'د. أحمد السيد',
      role: 'عميد كلية الحاسبات',
      company: 'جامعة القاهرة',
      content: 'منصة رائعة ساعدتنا في تنظيم أكبر هاكاثون في الجامعة بكل سهولة واحترافية. نظام التقييم مذهل!',
      rating: 5,
      avatar: 'AS'
    },
    {
      name: 'سارة محمد',
      role: 'مديرة الابتكار',
      company: 'شركة تك للحلول',
      content: 'استخدمنا HackPro لتنظيم 3 هاكاثونات حتى الآن. التجربة كانت ممتازة والدعم الفني سريع جداً.',
      rating: 5,
      avatar: 'SM'
    },
    {
      name: 'محمد علي',
      role: 'منسق البرامج',
      company: 'مركز الابتكار التقني',
      content: 'نظام Multi-Tenancy مثالي لاحتياجاتنا. نستطيع إدارة عدة هاكاثونات في نفس الوقت بكل سهولة.',
      rating: 5,
      avatar: 'MA'
    },
    {
      name: 'نور حسن',
      role: 'رئيسة قسم التطوير',
      company: 'مؤسسة المستقبل',
      content: 'التقارير والإحصائيات المتقدمة ساعدتنا كثيراً في اتخاذ قرارات أفضل. منصة احترافية بكل المقاييس.',
      rating: 5,
      avatar: 'NH'
    }
  ],
  en: [
    {
      name: 'Dr. Ahmed Elsayed',
      role: 'Dean of Computer Science',
      company: 'Cairo University',
      content: 'Amazing platform that helped us organize the biggest hackathon at the university with ease and professionalism. The evaluation system is fantastic!',
      rating: 5,
      avatar: 'AS'
    },
    {
      name: 'Sara Mohamed',
      role: 'Innovation Manager',
      company: 'Tech Solutions Co.',
      content: 'We\'ve used HackPro for 3 hackathons so far. The experience has been excellent and technical support is very fast.',
      rating: 5,
      avatar: 'SM'
    },
    {
      name: 'Mohamed Ali',
      role: 'Programs Coordinator',
      company: 'Tech Innovation Center',
      content: 'The Multi-Tenancy system is perfect for our needs. We can manage multiple hackathons at the same time with ease.',
      rating: 5,
      avatar: 'MA'
    },
    {
      name: 'Nour Hassan',
      role: 'Head of Development',
      company: 'Future Foundation',
      content: 'The advanced reports and analytics helped us a lot in making better decisions. A professional platform by all standards.',
      rating: 5,
      avatar: 'NH'
    }
  ]
}

export function TestimonialsSection() {
  const { language } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentTestimonials = testimonials[language]

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % currentTestimonials.length)
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + currentTestimonials.length) % currentTestimonials.length)
  }

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [currentIndex])

  const current = currentTestimonials[currentIndex]

  return (
    <section className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950 relative overflow-hidden transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'ar' ? 'آراء عملائنا' : 'What Our Clients Say'}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {language === 'ar' 
              ? 'تجارب حقيقية من مستخدمي المنصة'
              : 'Real experiences from platform users'
            }
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-800"
            >
              <Quote className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mb-6" />
              
              <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
                "{current.content}"
              </p>

              <div className="flex items-center gap-2 mb-6">
                {[...Array(current.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                ))}
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {current.avatar}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">
                    {current.name}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {current.role}
                  </p>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">
                    {current.company}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 flex items-center justify-center hover:border-indigo-600 dark:hover:border-indigo-400 transition-colors"
            >
              {language === 'ar' ? (
                <ChevronRight className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            <div className="flex gap-2">
              {currentTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-indigo-600 dark:bg-indigo-400 w-8'
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-12 h-12 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 flex items-center justify-center hover:border-indigo-600 dark:hover:border-indigo-400 transition-colors"
            >
              {language === 'ar' ? (
                <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronRight className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
