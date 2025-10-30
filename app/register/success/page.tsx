"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Mail, Calendar, Users, Home, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function RegistrationSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pb-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-6"
              >
                <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <CardTitle className="text-3xl font-bold text-[#01645e] mb-4">
                  تم التسجيل بنجاح! 🎉
                </CardTitle>
                <CardDescription className="text-lg text-[#8b7632]">
                  شكراً لك على التسجيل في منصة هاكاثون الابتكار التقني
                </CardDescription>
              </motion.div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10 rounded-lg p-6"
              >
                <h3 className="text-xl font-bold text-[#01645e] mb-4">ما الخطوات التالية؟</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className="w-8 h-8 bg-[#01645e] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#01645e] mb-1">تأكيد التسجيل</h4>
                      <p className="text-[#8b7632] text-sm">
                        تم حفظ بياناتك بنجاح في قاعدة البيانات وأصبحت جزءاً من مجتمع المبدعين
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className="w-8 h-8 bg-[#3ab666] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#01645e] mb-1">انتظار الهاكاثونات الجديدة</h4>
                      <p className="text-[#8b7632] text-sm">
                        سيتم إشعارك عبر البريد الإلكتروني عند إطلاق هاكاثونات جديدة
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className="w-8 h-8 bg-[#c3e956] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#01645e] mb-1">المشاركة في الهاكاثون</h4>
                      <p className="text-[#8b7632] text-sm">
                        عند إطلاق هاكاثون جديد، ستتمكن من المشاركة مباشرة دون الحاجة لإعادة التسجيل
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className="w-8 h-8 bg-[#8b7632] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#01645e] mb-1">ابدأ رحلة الابتكار</h4>
                      <p className="text-[#8b7632] text-sm">
                        استعد لتجربة مميزة من التعلم والإبداع والتطوير مع أفضل المواهب التقنية
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div className="text-center p-4 bg-white rounded-lg border">
                  <Mail className="w-8 h-8 text-[#01645e] mx-auto mb-2" />
                  <h4 className="font-semibold text-[#01645e] text-sm">تحقق من بريدك</h4>
                  <p className="text-xs text-[#8b7632] mt-1">ستصلك رسالة تأكيد قريباً</p>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg border">
                  <Calendar className="w-8 h-8 text-[#3ab666] mx-auto mb-2" />
                  <h4 className="font-semibold text-[#01645e] text-sm">احفظ التاريخ</h4>
                  <p className="text-xs text-[#8b7632] mt-1">لا تنس موعد بداية الهاكاثون</p>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg border">
                  <Users className="w-8 h-8 text-[#c3e956] mx-auto mb-2" />
                  <h4 className="font-semibold text-[#01645e] text-sm">تواصل معنا</h4>
                  <p className="text-xs text-[#8b7632] mt-1">لأي استفسارات أو مساعدة</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="flex flex-col sm:flex-row gap-4 pt-6"
              >
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Home className="w-4 h-4 ml-2" />
                    العودة للرئيسية
                  </Button>
                </Link>
                
                <Link href="/participant/dashboard" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52]">
                    <FileText className="w-4 h-4 ml-2" />
                    لوحة المشارك
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-center pt-4 border-t"
              >
                <p className="text-sm text-[#8b7632]">
                  هل تحتاج مساعدة؟ تواصل معنا على{' '}
                  <a href="mailto:support@hackathon.gov.sa" className="text-[#01645e] hover:underline">
                    support@hackathon.gov.sa
                  </a>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
