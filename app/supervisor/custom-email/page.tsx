'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { TipTapEditor } from '@/components/admin/TipTapEditor'
import { RecipientSelector } from '@/components/admin/RecipientSelector'
import { FileUploader } from '@/components/admin/FileUploader'
import {
  Mail,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Paperclip,
  Users
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Recipient {
  id: string
  name: string
  email: string
  role?: string
  status?: string
}

interface UploadedFile {
  url: string
  name: string
  type: string
  size: number
  uploadedAt: Date
}

export default function CustomEmailPage() {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [attachments, setAttachments] = useState<UploadedFile[]>([])
  const [sending, setSending] = useState(false)
  const [showResultDialog, setShowResultDialog] = useState(false)
  const [sendResult, setSendResult] = useState<any>(null)

  const handleSend = async () => {
    // Validation
    if (!subject.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال موضوع الإيميل',
        variant: 'destructive'
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال محتوى الإيميل',
        variant: 'destructive'
      })
      return
    }

    if (recipients.length === 0) {
      toast({
        title: 'خطأ',
        description: 'يرجى تحديد مستلم واحد على الأقل',
        variant: 'destructive'
      })
      return
    }

    // Confirm before sending
    const confirmed = window.confirm(
      `هل أنت متأكد من إرسال الإيميل إلى ${recipients.length} مستلم؟`
    )

    if (!confirmed) return

    setSending(true)

    try {
      const response = await fetch('/api/admin/send-custom-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          subject,
          bodyHtml: content,
          recipients,
          attachments
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSendResult(data.results)
        setShowResultDialog(true)

        // Clear form if all sent successfully
        if (data.results.failed === 0) {
          setSubject('')
          setContent('')
          setRecipients([])
          setAttachments([])
        }

        toast({
          title: 'تم الإرسال',
          description: `تم إرسال ${data.results.sent} إيميل بنجاح من أصل ${data.results.total}`,
        })
      } else {
        throw new Error(data.error || 'فشل إرسال الإيميلات')
      }
    } catch (error: any) {
      console.error('Send error:', error)
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء إرسال الإيميلات',
        variant: 'destructive'
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Mail className="h-8 w-8 text-blue-600" />
          إرسال إيميل مخصص
        </h1>
        <p className="text-gray-600 mt-2">
          أنشئ وأرسل إيميلات مخصصة للمشاركين أو المحكمين أو الخبراء
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Composition - Left Side (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subject */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">موضوع الإيميل</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="أدخل موضوع الإيميل..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="text-lg"
              />
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">محتوى الإيميل</CardTitle>
              <CardDescription>
                استخدم المحرر لتنسيق الإيميل بشكل احترافي
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TipTapEditor
                content={content}
                onChange={setContent}
                placeholder="اكتب محتوى الإيميل هنا..."
                minHeight="500px"
              />
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Paperclip className="h-5 w-5" />
                المرفقات ({attachments.length})
              </CardTitle>
              <CardDescription>
                يمكنك إرفاق ملفات PDF أو صور (حد أقصى 5 ملفات)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader
                files={attachments}
                onFilesChange={setAttachments}
                maxFiles={5}
                accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx"
              />
            </CardContent>
          </Card>

          {/* Send Button */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">جاهز للإرسال؟</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    سيتم إرسال الإيميل إلى {recipients.length} مستلم
                  </p>
                </div>
                <Button
                  onClick={handleSend}
                  disabled={sending || recipients.length === 0}
                  size="lg"
                  className="gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      إرسال الإيميل
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recipients Selector - Right Side (1/3) */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <RecipientSelector
              selectedRecipients={recipients}
              onRecipientsChange={setRecipients}
            />
          </div>
        </div>
      </div>

      {/* Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {sendResult?.failed === 0 ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  تم الإرسال بنجاح
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-yellow-600" />
                  تم الإرسال مع بعض الأخطاء
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              نتائج إرسال الإيميلات
            </DialogDescription>
          </DialogHeader>

          {sendResult && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-blue-600">{sendResult.total}</div>
                    <div className="text-sm text-gray-600 mt-1">إجمالي</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-green-600">{sendResult.sent}</div>
                    <div className="text-sm text-gray-600 mt-1">نجح</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-red-600">{sendResult.failed}</div>
                    <div className="text-sm text-gray-600 mt-1">فشل</div>
                  </CardContent>
                </Card>
              </div>

              {/* Failed Emails */}
              {sendResult.failedEmails && sendResult.failedEmails.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-800 text-base">
                      الإيميلات الفاشلة ({sendResult.failedEmails.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {sendResult.failedEmails.map((failed: any, index: number) => (
                        <div key={index} className="bg-white p-3 rounded border border-red-200">
                          <div className="font-medium text-red-800">{failed.email}</div>
                          <div className="text-sm text-red-600 mt-1">{failed.error}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button onClick={() => setShowResultDialog(false)} className="w-full">
                إغلاق
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

