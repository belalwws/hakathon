'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

interface FAQItem {
  question: string
  answer: string
}

const faqs: Record<'ar' | 'en', FAQItem[]> = {
  ar: [
    {
      question: 'ما هي منصة HackPro؟',
      answer: 'HackPro هي منصة SaaS متكاملة لإدارة وتنظيم الهاكاثونات والمسابقات التقنية مع نظام Multi-Tenant كامل ونظام تقييم احترافي.'
    },
    {
      question: 'كيف أبدأ باستخدام المنصة؟',
      answer: 'يمكنك البدء مجاناً من خلال إنشاء حساب جديد، ثم إنشاء مؤسستك الخاصة، وبعدها يمكنك إنشاء هاكاثونك الأول في دقائق.'
    },
    {
      question: 'هل يمكنني تخصيص معايير التقييم؟',
      answer: 'نعم! توفر المنصة نظام معايير تقييم مرن تماماً يمكنك من خلاله إنشاء وتخصيص معايير التقييم مع أوزان قابلة للتعديل.'
    },
    {
      question: 'ما هي الأدوار المتاحة في النظام؟',
      answer: 'النظام يدعم 6 أدوار: مشارك، محكّم، خبير، مشرف، مدير نظام، ومدير منصة (Master). كل دور له صلاحيات محددة.'
    },
    {
      question: 'هل البيانات آمنة؟',
      answer: 'نعم، نستخدم أحدث معايير الأمان مع تشفير البيانات وعزل كامل بين المؤسسات المختلفة لضمان خصوصية وأمان بياناتك.'
    },
    {
      question: 'هل يمكنني تصدير التقارير؟',
      answer: 'نعم، يمكنك تصدير جميع التقارير والإحصائيات بصيغة Excel أو PDF مع رسوم بيانية احترافية.'
    }
  ],
  en: [
    {
      question: 'What is HackPro?',
      answer: 'HackPro is a comprehensive SaaS platform for managing and organizing hackathons and technical competitions with a complete Multi-Tenant system and professional evaluation system.'
    },
    {
      question: 'How do I get started?',
      answer: 'You can start for free by creating a new account, then creating your organization, and then you can create your first hackathon in minutes.'
    },
    {
      question: 'Can I customize evaluation criteria?',
      answer: 'Yes! The platform provides a fully flexible evaluation criteria system that allows you to create and customize evaluation criteria with adjustable weights.'
    },
    {
      question: 'What roles are available?',
      answer: 'The system supports 6 roles: Participant, Judge, Expert, Supervisor, Admin, and Master. Each role has specific permissions.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use the latest security standards with data encryption and complete isolation between different organizations to ensure your data privacy and security.'
    },
    {
      question: 'Can I export reports?',
      answer: 'Yes, you can export all reports and statistics in Excel or PDF format with professional charts.'
    }
  ]
}

function FAQItem({ faq, index }: { faq: FAQItem; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="border-b border-gray-200 dark:border-gray-800 last:border-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-right hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <span className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 pr-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function FAQSection() {
  const { language, t } = useLanguage()
  const currentFaqs = faqs[language]

  return (
    <section className="py-24 bg-white dark:bg-gray-950 relative overflow-hidden transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {language === 'ar' 
              ? 'إجابات سريعة لأكثر الأسئلة شيوعاً'
              : 'Quick answers to the most common questions'
            }
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
          {currentFaqs.map((faq, index) => (
            <FAQItem key={index} faq={faq} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
