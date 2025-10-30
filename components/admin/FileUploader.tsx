'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, File, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

interface UploadedFile {
  url: string
  name: string
  type: string
  size: number
  uploadedAt: Date
}

interface FileUploaderProps {
  files: UploadedFile[]
  onFilesChange: (files: UploadedFile[]) => void
  maxFiles?: number
  accept?: string
}

export function FileUploader({ files, onFilesChange, maxFiles = 5, accept = 'image/*,application/pdf' }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return

    // Check max files
    if (files.length + selectedFiles.length > maxFiles) {
      toast.error(`الحد الأقصى للملفات هو ${maxFiles}`)
      return
    }

    setUploading(true)

    try {
      const uploadPromises = Array.from(selectedFiles).map(async (file) => {
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`الملف ${file.name} أكبر من 5 ميجابايت`)
          return null
        }

        // Validate file type
        const validTypes = accept.split(',').map(t => t.trim())
        const isValidType = validTypes.some(type => {
          if (type === 'image/*') return file.type.startsWith('image/')
          if (type === 'application/pdf') return file.type === 'application/pdf'
          return file.type === type
        })

        if (!isValidType) {
          toast.error(`نوع الملف ${file.name} غير مدعوم`)
          return null
        }

        // Create FormData
        const formData = new FormData()
        formData.append('file', file)

        // Upload to API
        const response = await fetch('/api/supervisor/upload-attachment', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`فشل رفع الملف ${file.name}`)
        }

        const data = await response.json()

        return {
          url: data.url,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date()
        } as UploadedFile
      })

      const results = await Promise.all(uploadPromises)
      const successfulUploads = results.filter((r): r is UploadedFile => r !== null)

      if (successfulUploads.length > 0) {
        onFilesChange([...files, ...successfulUploads])
        toast.success(`تم رفع ${successfulUploads.length} ملف بنجاح`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('حدث خطأ أثناء رفع الملفات')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onFilesChange(newFiles)
    toast.success('تم حذف الملف')
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const isImage = (type: string) => type.startsWith('image/')
  const isPDF = (type: string) => type === 'application/pdf'

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
            <p className="text-gray-600">جاري رفع الملفات...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="w-12 h-12 mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-semibold text-gray-700 mb-1">
                اسحب وأفلت الملفات هنا
              </p>
              <p className="text-sm text-gray-500">
                أو{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-500 hover:text-blue-600 underline"
                >
                  اختر من جهازك
                </button>
              </p>
            </div>
            <p className="text-xs text-gray-400">
              الملفات المدعومة: الصور (JPG, PNG, GIF) و PDF - الحد الأقصى: 5 ميجابايت لكل ملف
            </p>
            <p className="text-xs text-gray-400">
              عدد الملفات: {files.length} / {maxFiles}
            </p>
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">الملفات المرفقة ({files.length})</h3>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {files.map((file, index) => (
              <Card key={index} className="p-3 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0">
                    {isImage(file.type) ? (
                      <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-100">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : isPDF(file.type) ? (
                      <div className="w-16 h-16 rounded bg-red-50 flex items-center justify-center">
                        <File className="w-8 h-8 text-red-500" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center">
                        <File className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(file.size)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">تم الرفع بنجاح</span>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveFile(index)}
                    className="flex-shrink-0 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Preview Link */}
                {isImage(file.type) && (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-600 mt-2 inline-block"
                  >
                    معاينة الصورة ↗
                  </a>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
