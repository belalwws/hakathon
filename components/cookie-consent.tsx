'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X } from 'lucide-react'
import { Button } from './ui/button'
import { useLanguage } from '@/contexts/language-context'

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const { language } = useLanguage()

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setTimeout(() => setShowBanner(true), 2000)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setShowBanner(false)
  }

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setShowBanner(false)
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-[150]"
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-800 p-6">
            <button
              onClick={declineCookies}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Cookie className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {language === 'ar' ? 'نستخدم ملفات تعريف الارتباط' : 'We use cookies'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar'
                    ? 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك على موقعنا. من خلال الاستمرار، فإنك توافق على استخدامنا لملفات تعريف الارتباط.'
                    : 'We use cookies to improve your experience on our site. By continuing, you agree to our use of cookies.'
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={acceptCookies}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 dark:hover:from-indigo-600 dark:hover:to-purple-600 text-white"
              >
                {language === 'ar' ? 'قبول' : 'Accept'}
              </Button>
              <Button
                onClick={declineCookies}
                variant="outline"
                className="flex-1 border-2 dark:border-gray-700"
              >
                {language === 'ar' ? 'رفض' : 'Decline'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
