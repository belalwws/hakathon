'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code, Copy, CheckCircle2, Key, Globe, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

export default function APIDocsPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string>('')

  useEffect(() => {
    // Generate or fetch API key
    fetchAPIKey()
  }, [])

  const fetchAPIKey = async () => {
    try {
      const response = await fetch('/api/admin/api-key')
      if (response.ok) {
        const data = await response.json()
        setApiKey(data.apiKey)
      }
    } catch (error) {
      console.error('Error fetching API key:', error)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const baseURL = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'

  const endpoints = [
    {
      id: 'register',
      method: 'POST',
      path: '/api/external/register',
      title: 'تسجيل مشارك جديد',
      description: 'تسجيل مشارك في هاكاثون معين',
      request: {
        hackathonId: 'string (required)',
        name: 'string (required)',
        email: 'string (required)',
        phone: 'string (optional)',
        organization: 'string (optional)',
        preferredRole: 'string (optional)',
        customFields: 'object (optional) - حقول مخصصة حسب فورم التسجيل'
      },
      example: `{
  "hackathonId": "cmgibgctw0001js1eg67m5gcq",
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "phone": "0501234567",
  "organization": "جامعة الملك سعود",
  "preferredRole": "مطور",
  "customFields": {
    "university": "جامعة الملك سعود",
    "major": "علوم الحاسب",
    "experience": "متوسط"
  }
}`,
      response: `{
  "success": true,
  "message": "تم التسجيل بنجاح",
  "participant": {
    "id": "...",
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "status": "pending"
  }
}`
    },
    {
      id: 'countdown',
      method: 'GET',
      path: '/api/external/countdown/:hackathonId',
      title: 'الحصول على العد التنازلي',
      description: 'الحصول على معلومات العد التنازلي لهاكاثون معين',
      request: null,
      example: null,
      response: `{
  "success": true,
  "hackathon": {
    "id": "cmgibgctw0001js1eg67m5gcq",
    "title": "هاكاثون الباحة 2025",
    "startDate": "2025-02-15T09:00:00.000Z",
    "endDate": "2025-02-17T18:00:00.000Z",
    "status": "upcoming",
    "countdown": {
      "days": 15,
      "hours": 8,
      "minutes": 30,
      "seconds": 45,
      "totalSeconds": 1324245
    }
  }
}`
    },
    {
      id: 'hackathon-info',
      method: 'GET',
      path: '/api/external/hackathon/:hackathonId',
      title: 'معلومات الهاكاثون',
      description: 'الحصول على معلومات تفصيلية عن هاكاثون معين',
      request: null,
      example: null,
      response: `{
  "success": true,
  "hackathon": {
    "id": "cmgibgctw0001js1eg67m5gcq",
    "title": "هاكاثون الباحة 2025",
    "description": "...",
    "startDate": "2025-02-15T09:00:00.000Z",
    "endDate": "2025-02-17T18:00:00.000Z",
    "location": "الباحة",
    "maxParticipants": 100,
    "currentParticipants": 45,
    "status": "upcoming",
    "registrationOpen": true
  }
}`
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-[#01645e] mb-2">
            توثيق External API
          </h1>
          <p className="text-[#8b7632]">
            استخدم هذه الـ APIs لربط موقعك الخارجي بمنصة الهاكاثون
          </p>
        </motion.div>

        {/* API Key */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-[#01645e]" />
              API Key
            </CardTitle>
            <CardDescription>
              استخدم هذا المفتاح في جميع طلبات الـ API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-100 p-3 rounded-lg font-mono text-sm">
                {apiKey || 'جاري التحميل...'}
              </code>
              <Button
                onClick={() => copyToClipboard(apiKey, 'api-key')}
                variant="outline"
              >
                {copied === 'api-key' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              أضف هذا المفتاح في الـ Header: <code className="bg-gray-100 px-2 py-1 rounded">X-API-Key: {apiKey}</code>
            </p>
          </CardContent>
        </Card>

        {/* Base URL */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#01645e]" />
              Base URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-100 p-3 rounded-lg font-mono text-sm">
                {baseURL}
              </code>
              <Button
                onClick={() => copyToClipboard(baseURL, 'base-url')}
                variant="outline"
              >
                {copied === 'base-url' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <div className="space-y-6">
          {endpoints.map((endpoint) => (
            <Card key={endpoint.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-[#01645e]" />
                    {endpoint.title}
                  </CardTitle>
                  <Badge className={
                    endpoint.method === 'GET' 
                      ? 'bg-blue-600' 
                      : 'bg-green-600'
                  }>
                    {endpoint.method}
                  </Badge>
                </div>
                <CardDescription>{endpoint.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Path */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Endpoint:</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 p-3 rounded-lg font-mono text-sm">
                      {endpoint.method} {baseURL}{endpoint.path}
                    </code>
                    <Button
                      onClick={() => copyToClipboard(`${baseURL}${endpoint.path}`, `path-${endpoint.id}`)}
                      variant="outline"
                      size="sm"
                    >
                      {copied === `path-${endpoint.id}` ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Request Body */}
                {endpoint.request && (
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Request Body:</Label>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm font-mono">{endpoint.example}</pre>
                    </div>
                  </div>
                )}

                {/* Response */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Response:</Label>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm font-mono">{endpoint.response}</pre>
                  </div>
                </div>

                {/* cURL Example */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">cURL Example:</Label>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm font-mono">
{endpoint.method === 'GET' 
  ? `curl -X GET "${baseURL}${endpoint.path}" \\
  -H "X-API-Key: ${apiKey}"`
  : `curl -X POST "${baseURL}${endpoint.path}" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}" \\
  -d '${endpoint.example}'`
}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}

