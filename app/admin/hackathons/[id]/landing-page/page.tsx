'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Save,
  Play,
  Eye,
  Plus,
  Trash2,
  FileText,
  Code,
  Palette,
  Settings,
  ExternalLink,
  Copy,
  Download,
  Upload,
  FolderOpen,
  Monitor,
  Smartphone,
  Tablet,
  BookOpen,
  Zap,
  Image,
  File,
  Folder,
  X,
  Check,
  AlertCircle,
  ImageIcon
} from 'lucide-react'
import { toast } from 'sonner'
import CodeSnippetsPanel from '@/components/admin/CodeSnippetsPanel'
import TemplateGallery from '@/components/admin/TemplateGallery'

interface FileItem {
  id: string
  name: string
  type: 'html' | 'css' | 'js' | 'json' | 'image'
  content: string
  isMain?: boolean
  url?: string // للصور
  size?: number // حجم الملف
  mimeType?: string // نوع الملف
}

interface LandingPageData {
  hackathonId: string
  isEnabled: boolean
  files: FileItem[]
  settings: {
    title?: string
    description?: string
    customDomain?: string
    seoTitle?: string
    seoDescription?: string
  }
}

export default function LandingPageEditor({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params)
  const [landingPage, setLandingPage] = useState<LandingPageData>({
    hackathonId: resolvedParams.id,
    isEnabled: false,
    files: [
      {
        id: 'main-html',
        name: 'index.html',
        type: 'html',
        content: '',
        isMain: true
      }
    ],
    settings: {}
  })

  const [hackathon, setHackathon] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [activeFile, setActiveFile] = useState('main-html')
  const [previewMode, setPreviewMode] = useState('desktop')
  const [showPreview, setShowPreview] = useState(false)
  const [showSnippets, setShowSnippets] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [showImageGallery, setShowImageGallery] = useState(false)

  useEffect(() => {
    fetchHackathon()
    fetchLandingPage()
  }, [resolvedParams.id])

  const fetchHackathon = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setHackathon(data.hackathon)
      }
    } catch (error) {
      console.error('Error fetching hackathon:', error)
    }
  }

  const fetchLandingPage = async () => {
    try {
      const response = await fetch(`/api/admin/hackathons/${resolvedParams.id}/landing-page-pro`)
      if (response.ok) {
        const data = await response.json()
        if (data.files && data.files.length > 0) {
          setLandingPage(data)
        } else {
          // Initialize with default template
          initializeDefaultTemplate()
        }
      }
    } catch (error) {
      console.error('Error fetching landing page:', error)
      initializeDefaultTemplate()
    }
  }

  const initializeDefaultTemplate = () => {
    const defaultHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${hackathon?.title || 'هاكاثون'}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <header class="hero">
            <h1>${hackathon?.title || 'هاكاثون'}</h1>
            <p>${hackathon?.description || 'انضم إلينا في رحلة الإبداع والابتكار'}</p>
            <button class="register-btn" onclick="registerNow()">
                سجل الآن
            </button>
        </header>
    </div>
    <script src="script.js"></script>
</body>
</html>`

    const defaultCss = `@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Cairo', Arial, sans-serif;
    direction: rtl;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.hero {
    text-align: center;
    padding: 4rem 0;
    color: white;
}

.hero h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.hero p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.register-btn {
    background: #ff6b6b;
    color: white;
    border: none;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'Cairo', Arial, sans-serif;
}

.register-btn:hover {
    background: #ff5252;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(255, 107, 107, 0.3);
}`

    const defaultJs = `function registerNow() {
    window.location.href = '/hackathons/${resolvedParams.id}/register-form';
}

function openRegistrationModal() {
    const modal = window.open(
        '/hackathons/${resolvedParams.id}/register-form',
        'registration',
        'width=800,height=600,scrollbars=yes,resizable=yes'
    );
}

document.addEventListener('DOMContentLoaded', function() {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});`

    setLandingPage(prev => ({
      ...prev,
      files: [
        { id: 'main-html', name: 'index.html', type: 'html', content: defaultHtml, isMain: true },
        { id: 'main-css', name: 'styles.css', type: 'css', content: defaultCss },
        { id: 'main-js', name: 'script.js', type: 'js', content: defaultJs }
      ]
    }))
  }

  const addNewFile = () => {
    const fileName = prompt('اسم الملف الجديد (مع الامتداد):')
    if (!fileName) return

    const extension = fileName.split('.').pop()?.toLowerCase()
    let fileType: 'html' | 'css' | 'js' | 'json' | 'image' = 'html'

    if (extension === 'css') fileType = 'css'
    else if (extension === 'js') fileType = 'js'
    else if (extension === 'json') fileType = 'json'
    else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) fileType = 'image'

    const newFile: FileItem = {
      id: `file-${Date.now()}`,
      name: fileName,
      type: fileType,
      content: ''
    }

    setLandingPage(prev => ({
      ...prev,
      files: [...prev.files, newFile]
    }))

    setActiveFile(newFile.id)
    toast.success(`تم إنشاء الملف ${fileName}`)
  }

  const handleFileUpload = async (files: FileList) => {
    setUploading(true)
    const uploadedFiles: FileItem[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      try {
        // تحويل الملف إلى base64
        const base64 = await fileToBase64(file)
        const extension = file.name.split('.').pop()?.toLowerCase()

        let fileType: 'html' | 'css' | 'js' | 'json' | 'image' = 'html'

        if (extension === 'css') fileType = 'css'
        else if (extension === 'js') fileType = 'js'
        else if (extension === 'json') fileType = 'json'
        else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) {
          fileType = 'image'
        }

        const newFile: FileItem = {
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          type: fileType,
          content: fileType === 'image' ? base64 : await fileToText(file),
          url: fileType === 'image' ? base64 : undefined,
          size: file.size,
          mimeType: file.type
        }

        uploadedFiles.push(newFile)

      } catch (error) {
        console.error('Error uploading file:', error)
        toast.error(`فشل في رفع الملف ${file.name}`)
      }
    }

    if (uploadedFiles.length > 0) {
      setLandingPage(prev => ({
        ...prev,
        files: [...prev.files, ...uploadedFiles]
      }))

      // تفعيل أول ملف مرفوع
      setActiveFile(uploadedFiles[0].id)
      toast.success(`تم رفع ${uploadedFiles.length} ملف بنجاح`)
    }

    setUploading(false)
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const fileToText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  const insertImageIntoCode = (imageFile: FileItem) => {
    if (!imageFile.url) return

    const activeFileData = landingPage.files.find(f => f.id === activeFile)
    if (!activeFileData) return

    let imageCode = ''

    if (activeFileData.type === 'html') {
      imageCode = `<img src="${imageFile.url}" alt="${imageFile.name}" class="responsive-image" />`
    } else if (activeFileData.type === 'css') {
      imageCode = `
.bg-image {
  background-image: url('${imageFile.url}');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}`
    } else if (activeFileData.type === 'js') {
      imageCode = `
// إدراج صورة ديناميكياً
const img = document.createElement('img');
img.src = '${imageFile.url}';
img.alt = '${imageFile.name}';
img.className = 'responsive-image';
document.body.appendChild(img);`
    }

    const currentContent = activeFileData.content
    const newContent = currentContent + '\n\n' + imageCode
    updateFileContent(activeFile, newContent)
    toast.success('تم إدراج الصورة في الكود')
  }

  const deleteFile = (fileId: string) => {
    const file = landingPage.files.find(f => f.id === fileId)
    if (file?.isMain) {
      toast.error('لا يمكن حذف الملف الرئيسي')
      return
    }

    if (confirm(`هل تريد حذف الملف ${file?.name}؟`)) {
      setLandingPage(prev => ({
        ...prev,
        files: prev.files.filter(f => f.id !== fileId)
      }))

      if (activeFile === fileId) {
        setActiveFile(landingPage.files[0]?.id || '')
      }

      toast.success('تم حذف الملف')
    }
  }

  const updateFileContent = (fileId: string, content: string) => {
    setLandingPage(prev => ({
      ...prev,
      files: prev.files.map(file =>
        file.id === fileId ? { ...file, content } : file
      )
    }))
  }

  const insertCodeSnippet = (code: string) => {
    const activeFileData = landingPage.files.find(f => f.id === activeFile)
    if (!activeFileData) return

    const currentContent = activeFileData.content
    const newContent = currentContent + '\n\n' + code
    updateFileContent(activeFile, newContent)
    toast.success('تم إدراج الكود')
  }

  const applyTemplate = (template: any) => {
    const processedFiles = template.files.map((file: any) => ({
      ...file,
      content: file.content
        .replace(/{{HACKATHON_TITLE}}/g, hackathon?.title || 'هاكاثون')
        .replace(/{{HACKATHON_DESCRIPTION}}/g, hackathon?.description || 'انضم إلينا في رحلة الإبداع والابتكار')
        .replace(/{{HACKATHON_ID}}/g, resolvedParams.id)
    }))

    setLandingPage(prev => ({
      ...prev,
      files: processedFiles
    }))

    const mainFile = processedFiles.find((f: any) => f.isMain)
    if (mainFile) {
      setActiveFile(mainFile.id)
    }
  }

  const saveLandingPage = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/hackathons/${resolvedParams.id}/landing-page-pro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(landingPage)
      })

      if (response.ok) {
        toast.success('تم حفظ الصفحة بنجاح!')
      } else {
        throw new Error('فشل في حفظ الصفحة')
      }
    } catch (error) {
      console.error('Error saving landing page:', error)
      toast.error('حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const generatePreview = () => {
    const mainHtml = landingPage.files.find(f => f.isMain)?.content || ''
    const cssFiles = landingPage.files.filter(f => f.type === 'css')
    const jsFiles = landingPage.files.filter(f => f.type === 'js')

    let processedHtml = mainHtml

    // Replace CSS file references with inline styles
    cssFiles.forEach(cssFile => {
      const cssLink = new RegExp(`<link[^>]*href=["']${cssFile.name}["'][^>]*>`, 'gi')
      processedHtml = processedHtml.replace(cssLink, `<style>${cssFile.content}</style>`)
    })

    // Replace JS file references with inline scripts
    jsFiles.forEach(jsFile => {
      const jsScript = new RegExp(`<script[^>]*src=["']${jsFile.name}["'][^>]*></script>`, 'gi')
      processedHtml = processedHtml.replace(jsScript, `<script>${jsFile.content}</script>`)
    })

    return processedHtml
  }

  const activeFileData = landingPage.files.find(f => f.id === activeFile)

  if (!hackathon) {
    return <div className="p-6">جاري التحميل...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              محرر الصفحات المتقدم
            </h1>
            <p className="text-gray-600 mt-1">
              {hackathon.title} - تطوير صفحة الهبوط
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enable-page"
                checked={landingPage.isEnabled}
                onChange={(e) => setLandingPage(prev => ({
                  ...prev,
                  isEnabled: e.target.checked
                }))}
                className="rounded"
              />
              <label htmlFor="enable-page" className="text-sm">تفعيل الصفحة</label>
            </div>

            {landingPage.isEnabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/api/landing-pro/${resolvedParams.id}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                معاينة مباشرة
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'إخفاء المعاينة' : 'معاينة'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSnippets(!showSnippets)}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              {showSnippets ? 'إخفاء الأكواد' : 'مكتبة الأكواد'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              <Palette className="w-4 h-4 mr-2" />
              {showTemplates ? 'إخفاء القوالب' : 'معرض القوالب'}
            </Button>

            <Button onClick={saveLandingPage} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* File Explorer */}
        <div className="w-80 bg-gray-900 text-white p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">مدير الملفات</h3>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={addNewFile}
                className="text-white hover:bg-gray-700"
                title="إنشاء ملف جديد"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="text-white hover:bg-gray-700"
                title="رفع ملفات"
                disabled={uploading}
              >
                {uploading ? <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full" /> : <Upload className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowImageGallery(!showImageGallery)}
                className="text-white hover:bg-gray-700"
                title="معرض الصور"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/*,.html,.css,.js,.json"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
          />

          {/* Drag & Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-4 mb-4 text-center transition-colors ${
              dragOver
                ? 'border-blue-400 bg-blue-900/20'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
            <p className="text-xs text-gray-400">
              اسحب الملفات هنا أو انقر لرفعها
            </p>
          </div>

          <div className="space-y-1 flex-1 overflow-y-auto">
            {landingPage.files.map(file => (
              <div
                key={file.id}
                className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-700 ${
                  activeFile === file.id ? 'bg-blue-600' : ''
                }`}
                onClick={() => setActiveFile(file.id)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {file.type === 'html' && <FileText className="w-4 h-4 text-orange-400 flex-shrink-0" />}
                  {file.type === 'css' && <Palette className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                  {file.type === 'js' && <Code className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
                  {file.type === 'json' && <Settings className="w-4 h-4 text-green-400 flex-shrink-0" />}
                  {file.type === 'image' && <Image className="w-4 h-4 text-purple-400 flex-shrink-0" />}

                  <div className="flex-1 min-w-0">
                    <span className="text-sm truncate block">{file.name}</span>
                    {file.size && (
                      <span className="text-xs text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </div>

                  {file.isMain && <Badge variant="secondary" className="text-xs">رئيسي</Badge>}

                  {file.type === 'image' && file.url && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        insertImageIntoCode(file)
                      }}
                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                      title="إدراج في الكود"
                    >
                      <Code className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                {!file.isMain && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteFile(file.id)
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Image Gallery */}
          {showImageGallery && (
            <div className="mt-4 border-t border-gray-700 pt-4">
              <h4 className="text-sm font-medium mb-2">معرض الصور</h4>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {landingPage.files
                  .filter(file => file.type === 'image' && file.url)
                  .map(imageFile => (
                    <div
                      key={imageFile.id}
                      className="relative group cursor-pointer"
                      onClick={() => insertImageIntoCode(imageFile)}
                    >
                      <img
                        src={imageFile.url}
                        alt={imageFile.name}
                        className="w-full h-16 object-cover rounded border border-gray-600 hover:border-blue-400 transition-colors"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                        <Code className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Code Snippets Panel */}
          {showSnippets && (
            <div className="mt-4 flex-1">
              <CodeSnippetsPanel onInsertCode={insertCodeSnippet} />
            </div>
          )}

          {/* Template Gallery */}
          {showTemplates && (
            <div className="mt-4 flex-1">
              <TemplateGallery onSelectTemplate={applyTemplate} />
            </div>
          )}
        </div>

        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          {activeFileData && (
            <>
              <div className="bg-gray-100 border-b px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {activeFileData.type === 'html' && <FileText className="w-4 h-4 text-orange-500" />}
                  {activeFileData.type === 'css' && <Palette className="w-4 h-4 text-blue-500" />}
                  {activeFileData.type === 'js' && <Code className="w-4 h-4 text-yellow-500" />}
                  {activeFileData.type === 'json' && <Settings className="w-4 h-4 text-green-500" />}
                  {activeFileData.type === 'image' && <Image className="w-4 h-4 text-purple-500" />}
                  <span className="font-medium">{activeFileData.name}</span>
                  {activeFileData.size && (
                    <Badge variant="outline" className="text-xs">
                      {(activeFileData.size / 1024).toFixed(1)} KB
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {activeFileData.type === 'image' && activeFileData.url && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => insertImageIntoCode(activeFileData)}
                      title="إدراج في الكود"
                    >
                      <Code className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const content = activeFileData.type === 'image' ? activeFileData.url || '' : activeFileData.content
                      navigator.clipboard.writeText(content)
                      toast.success('تم نسخ المحتوى')
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  {activeFileData.url && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = activeFileData.url!
                        link.download = activeFileData.name
                        link.click()
                      }}
                      title="تحميل الملف"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex-1">
                {activeFileData.type === 'image' && activeFileData.url ? (
                  // عارض الصور
                  <div className="h-full flex flex-col items-center justify-center bg-gray-50 p-8">
                    <div className="max-w-full max-h-full overflow-auto">
                      <img
                        src={activeFileData.url}
                        alt={activeFileData.name}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                      />
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600 mb-2">{activeFileData.name}</p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>الحجم: {activeFileData.size ? (activeFileData.size / 1024).toFixed(1) + ' KB' : 'غير معروف'}</span>
                        <span>النوع: {activeFileData.mimeType || 'غير معروف'}</span>
                      </div>
                      <div className="mt-4 flex gap-2 justify-center">
                        <Button
                          size="sm"
                          onClick={() => insertImageIntoCode(activeFileData)}
                        >
                          <Code className="w-4 h-4 mr-2" />
                          إدراج في الكود
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(activeFileData.url || '')
                            toast.success('تم نسخ رابط الصورة')
                          }}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          نسخ الرابط
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // محرر النصوص
                  <div className="flex-1 relative">
                    <textarea
                      value={activeFileData.content}
                      onChange={(e) => updateFileContent(activeFileData.id, e.target.value)}
                      className="w-full h-full p-4 font-mono text-sm border-none outline-none resize-none bg-gray-50"
                      placeholder={`اكتب كود ${activeFileData.type.toUpperCase()} هنا...`}
                      style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
                    />

                    {/* خط أرقام الأسطر */}
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-100 border-r border-gray-200 flex flex-col text-xs text-gray-400 pt-4">
                      {activeFileData.content.split('\n').map((_, index) => (
                        <div key={index} className="h-5 flex items-center justify-end pr-2">
                          {index + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="w-1/2 border-l bg-white">
            <div className="bg-gray-100 border-b px-4 py-2 flex items-center justify-between">
              <h3 className="font-medium">معاينة</h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                  onClick={() => setPreviewMode('desktop')}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                  onClick={() => setPreviewMode('tablet')}
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                  onClick={() => setPreviewMode('mobile')}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="h-full overflow-auto p-4">
              <div
                className={`mx-auto border rounded-lg overflow-hidden ${
                  previewMode === 'desktop' ? 'w-full' :
                  previewMode === 'tablet' ? 'w-[768px]' : 'w-[375px]'
                }`}
                style={{ height: 'calc(100vh - 200px)' }}
              >
                <iframe
                  srcDoc={generatePreview()}
                  className="w-full h-full border-none"
                  title="معاينة الصفحة"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
