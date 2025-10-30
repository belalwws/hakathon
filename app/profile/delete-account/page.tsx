'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { useLanguage } from '@/contexts/language-context'
import { motion } from 'framer-motion'
import { AlertTriangle, Trash2, Shield, Lock, ArrowLeft } from 'lucide-react'

export default function DeleteAccountPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { language } = useLanguage()
  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (confirmText !== 'DELETE') {
      setError(language === 'ar' ? 'يجب كتابة "DELETE" للتأكيد' : 'You must type "DELETE" to confirm')
      return
    }

    if (!password) {
      setError(language === 'ar' ? 'يجب إدخال كلمة المرور' : 'Password is required')
      return
    }

    const confirmed = confirm(
      language === 'ar' 
        ? 'هل أنت متأكد؟ هذا الإجراء لا يمكن التراجع عنه!'
        : 'Are you sure? This action cannot be undone!'
    )

    if (!confirmed) return

    setLoading(true)

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password,
          confirmText
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(language === 'ar' ? 'تم حذف حسابك بنجاح. سنفتقدك!' : 'Your account has been deleted successfully. We will miss you!')
        logout()
        router.push('/')
      } else {
        setError(data.error || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'))
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      setError(language === 'ar' ? 'حدث خطأ أثناء حذف الحساب' : 'An error occurred while deleting your account')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
      </div>
    )
  }

  // Prevent admin/master from deleting their accounts
  if (user.role === 'admin' || user.role === 'master') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-red-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="p-8 text-center">
            <Shield className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {language === 'ar' ? 'حساب محمي' : 'Protected Account'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {language === 'ar' 
                ? 'لا يمكن حذف حسابات الإدارة من هنا. يرجى التواصل مع الدعم الفني إذا كنت تريد حذف حسابك.'
                : 'Admin accounts cannot be deleted from here. Please contact support if you want to delete your account.'}
            </p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 ml-2" />
              {language === 'ar' ? 'رجوع' : 'Go Back'}
            </Button>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-red-950">
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            {language === 'ar' ? 'رجوع' : 'Back'}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8">
            {/* Warning Header */}
            <div className="bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h1 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">
                    {language === 'ar' ? 'حذف الحساب بشكل دائم' : 'Permanently Delete Account'}
                  </h1>
                  <p className="text-red-700 dark:text-red-300">
                    {language === 'ar' 
                      ? 'تحذير: هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك بشكل دائم.'
                      : 'Warning: This action cannot be undone. All your data will be permanently deleted.'}
                  </p>
                </div>
              </div>
            </div>

            {/* What will be deleted */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {language === 'ar' ? 'سيتم حذف ما يلي:' : 'The following will be deleted:'}
              </h2>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  {language === 'ar' ? 'حسابك ومعلوماتك الشخصية' : 'Your account and personal information'}
                </li>
                <li className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  {language === 'ar' ? 'جميع مشاركاتك في الهاكاثونات' : 'All your hackathon participations'}
                </li>
                <li className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  {language === 'ar' ? 'عضويتك في الفرق' : 'Your team memberships'}
                </li>
                <li className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  {language === 'ar' ? 'تقييماتك وإشرافك (إن وجدت)' : 'Your evaluations and supervisions (if any)'}
                </li>
                <li className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  {language === 'ar' ? 'جميع البيانات المرتبطة بحسابك' : 'All data associated with your account'}
                </li>
              </ul>
            </div>

            {/* Delete Form */}
            <form onSubmit={handleDeleteAccount} className="space-y-6">
              {/* Current User Info */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {language === 'ar' ? 'الحساب الذي سيتم حذفه:' : 'Account to be deleted:'}
                </p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Lock className="inline h-4 w-4 ml-1" />
                  {language === 'ar' ? 'أدخل كلمة المرور للتأكيد' : 'Enter your password to confirm'}
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={language === 'ar' ? 'كلمة المرور' : 'Password'}
                  className="w-full"
                  disabled={loading}
                  required
                />
              </div>

              {/* Confirmation Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' 
                    ? 'اكتب "DELETE" بالأحرف الكبيرة للتأكيد'
                    : 'Type "DELETE" in capital letters to confirm'}
                </label>
                <Input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full font-mono"
                  disabled={loading}
                  required
                />
                {confirmText && confirmText !== 'DELETE' && (
                  <p className="text-sm text-red-600 mt-1">
                    {language === 'ar' ? 'يجب كتابة "DELETE" بالضبط' : 'Must type "DELETE" exactly'}
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                  disabled={loading}
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={loading || confirmText !== 'DELETE'}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                      {language === 'ar' ? 'جاري الحذف...' : 'Deleting...'}
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 ml-2" />
                      {language === 'ar' ? 'حذف حسابي نهائياً' : 'Delete My Account Forever'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
