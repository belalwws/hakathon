'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, User, Key, AlertTriangle, CheckCircle } from 'lucide-react'

export default function EmergencyAdminPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createEmergencyAdmin = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/emergency-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data.message)
      } else {
        setError(data.error || 'حدث خطأ')
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-red-200"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">
            🚨 استرداد الأدمن الطارئ
          </h1>
          <p className="text-red-600 text-sm">
            استخدم هذه الصفحة فقط في حالة فقدان حساب الأدمن
          </p>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">تحذير مهم:</p>
              <p>هذه الوظيفة تنشئ حساب أدمن جديد فقط إذا لم يكن موجود. لا تستخدمها إلا في حالات الطوارئ.</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={createEmergencyAdmin}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 mb-6"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              جاري إنشاء الأدمن...
            </>
          ) : (
            <>
              <User className="w-5 h-5" />
              إنشاء أدمن طارئ
            </>
          )}
        </button>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-semibold mb-2">✅ تم بنجاح!</p>
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="font-semibold">البريد الإلكتروني:</span>
                  </div>
                  <p className="text-green-900 font-mono bg-green-50 px-2 py-1 rounded">
                    admin@hackathon.com
                  </p>
                  
                  <div className="flex items-center gap-2 mt-3 mb-2">
                    <Key className="w-4 h-4 text-green-600" />
                    <span className="font-semibold">كلمة المرور:</span>
                  </div>
                  <p className="text-green-900 font-mono bg-green-50 px-2 py-1 rounded">
                    admin123456
                  </p>
                </div>
                <p className="mt-3 text-xs text-green-700">
                  احفظ هذه البيانات في مكان آمن واحذف هذه الصفحة بعد الانتهاء
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">❌ خطأ:</p>
                <p>{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">📋 التعليمات:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. اضغط على "إنشاء أدمن طارئ"</li>
            <li>2. احفظ بيانات تسجيل الدخول</li>
            <li>3. سجل دخول بالبيانات الجديدة</li>
            <li>4. احذف هذه الصفحة من المتصفح</li>
          </ol>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            🔒 هذه الصفحة آمنة ولا تحفظ أي بيانات
          </p>
        </div>
      </motion.div>
    </div>
  )
}
