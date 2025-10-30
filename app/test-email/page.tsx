'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<any>(null)

  const sendTestEmail = async () => {
    if (!email) {
      alert('يرجى إدخال البريد الإلكتروني')
      return
    }

    setSending(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        alert('تم إرسال الإيميل بنجاح!')
      } else {
        alert('فشل في إرسال الإيميل: ' + data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      setResult({ success: false, error: 'Network error' })
      alert('حدث خطأ في الشبكة')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>اختبار إرسال الإيميل</CardTitle>
            <CardDescription>
              اختبر إعدادات Gmail للتأكد من أن الإيميلات تُرسل بشكل صحيح
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                البريد الإلكتروني
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل البريد الإلكتروني للاختبار"
                className="w-full"
              />
            </div>

            <Button
              onClick={sendTestEmail}
              disabled={sending}
              className="w-full bg-[#01645e] hover:bg-[#01645e]/90"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  جاري الإرسال...
                </>
              ) : (
                'إرسال إيميل اختبار'
              )}
            </Button>

            {result && (
              <div className="mt-4 p-4 rounded-lg bg-gray-100">
                <h3 className="font-medium mb-2">نتيجة الاختبار:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
