'use client'

import { useState } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface ImageUploaderProps {
  label: string
  value?: string | null
  onChange: (url: string | null) => void
  folder?: string
  aspectRatio?: string
  maxSizeMB?: number
}

export function ImageUploader({
  label,
  value,
  onChange,
  folder = 'hackathon',
  aspectRatio = '16/9',
  maxSizeMB = 5
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSizeMB) {
      setError(`حجم الملف يجب أن يكون أقل من ${maxSizeMB}MB`)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('يجب اختيار صورة')
      return
    }

    setError('')
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('فشل في رفع الصورة')
      }

      const data = await response.json()
      onChange(data.url)
    } catch (err) {
      console.error('Upload error:', err)
      setError('فشل في رفع الصورة')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    onChange(null)
    setError('')
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt={label}
            className="w-full rounded-lg border-2 border-gray-200 object-cover"
            style={{ aspectRatio }}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#01645e] transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id={`upload-${label}`}
          />
          <label
            htmlFor={`upload-${label}`}
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-12 h-12 text-[#01645e] animate-spin" />
                <p className="text-sm text-gray-600">جاري الرفع...</p>
              </>
            ) : (
              <>
                <ImageIcon className="w-12 h-12 text-gray-400" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">
                    اضغط لرفع صورة
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF حتى {maxSizeMB}MB
                  </p>
                </div>
              </>
            )}
          </label>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

