"use client"

export default function TestInvitationPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600 mb-4">
            ✅ نجح الاختبار!
          </h1>
          <p className="text-gray-600 mb-4">
            إذا رأيت هذه الصفحة، فهذا يعني أن middleware يسمح بالوصول لمسارات الدعوة
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-700">
              <strong>المسار:</strong> /supervisor/invitation/test
            </p>
            <p className="text-sm text-green-700">
              <strong>الحالة:</strong> يعمل بدون إعادة توجيه لـ login
            </p>
          </div>
          <a 
            href="/supervisor/invitation/real-token-here"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            اختبار رابط دعوة حقيقي
          </a>
        </div>
      </div>
    </div>
  )
}
