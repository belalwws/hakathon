'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, Wrench } from 'lucide-react'

export default function FixUrlsPage() {
  const [fixing, setFixing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFix = async () => {
    try {
      setFixing(true)
      setError(null)
      setResult(null)

      const response = await fetch('/api/admin/fix-cloudinary-urls', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'فشل في إصلاح الروابط')
      }
    } catch (err) {
      console.error('Error fixing URLs:', err)
      setError('حدث خطأ في إصلاح الروابط')
    } finally {
      setFixing(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إصلاح روابط Cloudinary</h1>
        <p className="text-gray-600">
          إصلاح روابط ملفات PDF/PPT المرفوعة على Cloudinary
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            إصلاح الروابط
          </CardTitle>
          <CardDescription>
            هذه الأداة تقوم بإصلاح روابط Cloudinary للملفات PDF/PPT التي تم رفعها بشكل خاطئ.
            <br />
            سيتم تغيير <code className="bg-gray-100 px-1 rounded">/image/upload/</code> إلى <code className="bg-gray-100 px-1 rounded">/raw/upload/</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleFix} 
            disabled={fixing}
            className="w-full"
          >
            {fixing ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                جاري الإصلاح...
              </>
            ) : (
              <>
                <Wrench className="w-4 h-4 ml-2" />
                إصلاح الروابط الآن
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900">نجح الإصلاح!</AlertTitle>
          <AlertDescription className="text-green-800">
            {result.message}
          </AlertDescription>
        </Alert>
      )}

      {result && result.results && result.results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>النتائج التفصيلية</CardTitle>
            <CardDescription>
              تم إصلاح {result.fixedCount} رابط من أصل {result.totalTeams} فريق
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {result.results.map((item: any, index: number) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${
                    item.status === 'fixed' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {item.status === 'fixed' ? (
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm mb-1">{item.teamName}</p>
                      {item.status === 'fixed' && (
                        <>
                          <p className="text-xs text-gray-600 mb-1 break-all">
                            <span className="font-medium">قبل:</span> {item.oldUrl}
                          </p>
                          <p className="text-xs text-green-700 break-all">
                            <span className="font-medium">بعد:</span> {item.newUrl}
                          </p>
                        </>
                      )}
                      {item.status === 'failed' && (
                        <p className="text-xs text-red-700">
                          {item.error || 'فشل الإصلاح'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

