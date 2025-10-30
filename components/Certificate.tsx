'use client'

import React, { useRef, useEffect, useState } from 'react'
import { drawCertificateText, DEFAULT_CERTIFICATE_CONFIG } from '@/lib/certificate-config'

interface CertificateProps {
  participantName: string
  hackathonTitle: string
  date: string
  rank?: number
  isWinner?: boolean
  hackathonId?: string
}

function Certificate({
  participantName,
  hackathonTitle,
  date,
  rank,
  isWinner = false,
  hackathonId
}: CertificateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_CERTIFICATE_CONFIG)
  const [certificateImageSrc, setCertificateImageSrc] = useState('/row-certificat.png')

  useEffect(() => {
    loadSettings()
    loadCertificateTemplate()
  }, [])

  // إعادة تحميل الإعدادات عند تغيير البيانات
  useEffect(() => {
    if (participantName) {
      loadSettings()
      loadCertificateTemplate()
    }
  }, [participantName, hackathonId])

  const loadSettings = async () => {
    try {
      // إضافة timestamp لتجنب التخزين المؤقت
      const response = await fetch(`/api/admin/certificate-settings?t=${Date.now()}`, {
        cache: 'no-store'
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Loaded certificate settings:', data)
        setSettings({
          ...DEFAULT_CERTIFICATE_CONFIG,
          namePositionY: data.namePositionY || data.namePosition || DEFAULT_CERTIFICATE_CONFIG.namePositionY,
          namePositionX: data.namePositionX || DEFAULT_CERTIFICATE_CONFIG.namePositionX,
          nameFont: data.nameFont || DEFAULT_CERTIFICATE_CONFIG.nameFont,
          nameColor: data.nameColor || DEFAULT_CERTIFICATE_CONFIG.nameColor
        })
      }
    } catch (error) {
      console.error('Error loading certificate settings:', error)
    }
  }

  const loadCertificateTemplate = async () => {
    if (!hackathonId) return

    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/certificate-template?t=${Date.now()}`, {
        cache: 'no-store'
      })
      if (response.ok) {
        const data = await response.json()
        if (data.templatePath) {
          // إضافة timestamp لتجنب التخزين المؤقت
          setCertificateImageSrc(`${data.templatePath}?t=${Date.now()}`)
        } else {
          setCertificateImageSrc(`/row-certificat.svg?t=${Date.now()}`)
        }
      }
    } catch (error) {
      console.error('Error loading certificate template:', error)
      setCertificateImageSrc(`/row-certificat.svg?t=${Date.now()}`)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !settings) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width
      canvas.height = img.height

      // Draw the base certificate image
      ctx.drawImage(img, 0, 0)

      // Draw certificate text using helper function with current settings
      drawCertificateText(ctx, canvas, {
        participantName,
        hackathonTitle,
        date,
        rank,
        isWinner
      }, settings)

      setImageLoaded(true)
    }

    img.onerror = () => {
      console.error('Failed to load certificate image')
    }

    img.src = certificateImageSrc
  }, [participantName, hackathonTitle, date, rank, isWinner, settings, certificateImageSrc])

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto border border-gray-300 rounded-lg shadow-lg"
        style={{ maxWidth: '800px' }}
      />
      {!imageLoaded && (
        <div className="flex items-center justify-center w-full h-64 bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01645e] mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل الشهادة...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Component for generating certificate as image/PDF
export function CertificateGenerator({
  participantName,
  hackathonTitle,
  date,
  rank,
  isWinner = false,
  hackathonId
}: CertificateProps) {
  const downloadCertificate = async () => {
    // Load current settings
    let currentSettings = DEFAULT_CERTIFICATE_CONFIG
    let certificateImageSrc = '/row-certificat.svg'

    try {
      const response = await fetch(`/api/admin/certificate-settings?t=${Date.now()}`, {
        cache: 'no-store'
      })
      if (response.ok) {
        const data = await response.json()
        currentSettings = {
          ...DEFAULT_CERTIFICATE_CONFIG,
          namePositionY: data.namePositionY || data.namePosition || DEFAULT_CERTIFICATE_CONFIG.namePositionY,
          namePositionX: data.namePositionX || DEFAULT_CERTIFICATE_CONFIG.namePositionX,
          nameFont: data.nameFont || DEFAULT_CERTIFICATE_CONFIG.nameFont,
          nameColor: data.nameColor || DEFAULT_CERTIFICATE_CONFIG.nameColor
        }
      }
    } catch (error) {
      console.error('Error loading settings for download:', error)
    }

    // Load certificate template if hackathonId is provided
    if (hackathonId) {
      try {
        const response = await fetch(`/api/admin/hackathons/${hackathonId}/certificate-template?t=${Date.now()}`, {
          cache: 'no-store'
        })
        if (response.ok) {
          const data = await response.json()
          if (data.templatePath) {
            // إضافة timestamp لتجنب التخزين المؤقت
            certificateImageSrc = `${data.templatePath}?t=${Date.now()}`
          }
        }
      } catch (error) {
        console.error('Error loading certificate template for download:', error)
      }
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width
      canvas.height = img.height

      // Draw the base certificate image
      ctx.drawImage(img, 0, 0)

      // Draw certificate text using helper function with current settings
      drawCertificateText(ctx, canvas, {
        participantName,
        hackathonTitle,
        date,
        rank,
        isWinner
      }, currentSettings)

      // Download the certificate
      const link = document.createElement('a')
      link.download = `certificate-${participantName.replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL()
      link.click()
    }

    img.src = certificateImageSrc
  }

  return (
    <div className="space-y-4">
      <Certificate 
        participantName={participantName}
        hackathonTitle={hackathonTitle}
        date={date}
        rank={rank}
        isWinner={isWinner}
      />
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={downloadCertificate}
          className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
        >
          تحميل الشهادة
        </button>
        
        <button
          onClick={() => window.print()}
          className="bg-gradient-to-r from-[#3ab666] to-[#c3e956] text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
        >
          طباعة الشهادة
        </button>
      </div>
    </div>
  )
}

export { Certificate }
