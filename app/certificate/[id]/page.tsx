'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Download, Printer, Share } from 'lucide-react'

interface ParticipantData {
  name: string
  email: string
  hackathonTitle: string
  teamName: string
  rank: number
  isWinner: boolean
  totalScore: number
  date?: string
}

export default function CertificatePage() {
  const params = useParams()
  const participantId = params.id as string
  const [participant, setParticipant] = useState<ParticipantData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (participantId) {
      fetchParticipantData()
    }
  }, [participantId])

  const fetchParticipantData = async () => {
    try {
      const response = await fetch(`/api/participants/${participantId}/certificate`)
      if (response.ok) {
        const data = await response.json()
        setParticipant(data)
      } else {
        setError('لم يتم العثور على بيانات المشارك')
      }
    } catch (error) {
      console.error('Error fetching participant data:', error)
      setError('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const downloadCertificate = async () => {
    if (!participant) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      // Draw participant name
      ctx.font = 'bold 48px Arial'
      ctx.fillStyle = '#01645e'
      ctx.textAlign = 'center'
      ctx.fillText(participant.name, canvas.width / 2, canvas.height / 2)

      const link = document.createElement('a')
      link.download = `certificate-${participant.name.replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL()
      link.click()
    }

    img.src = '/row-certificat.png'
  }

  const shareCertificate = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `شهادة تقدير - ${participant?.name}`,
          text: `شهادة تقدير من ${participant?.hackathonTitle}`,
          url: window.location.href
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#01645e]/20 border-t-[#01645e] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#01645e] font-semibold">جاري تحميل الشهادة...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-[#01645e] mb-2">خطأ في تحميل الشهادة</h1>
          <p className="text-[#8b7632]">{error}</p>
        </div>
      </div>
    )
  }

  if (!participant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#8b7632] text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-[#01645e] mb-2">لم يتم العثور على الشهادة</h1>
          <p className="text-[#8b7632]">تأكد من صحة الرابط</p>
        </div>
      </div>
    )
  }

  const currentDate = new Date().toLocaleDateString('ar-SA')

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c3e956]/10 to-[#3ab666]/10 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#01645e] mb-2">شهادة تقدير</h1>
          <p className="text-[#8b7632] text-lg">
            تهانينا {participant.name} على مشاركتك في {participant.hackathonTitle}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={downloadCertificate}
            className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            تحميل الشهادة
          </button>
          
          <button
            onClick={() => window.print()}
            className="bg-gradient-to-r from-[#3ab666] to-[#c3e956] text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <Printer className="w-5 h-5" />
            طباعة
          </button>
          
          <button
            onClick={shareCertificate}
            className="bg-gradient-to-r from-[#c3e956] to-[#01645e] text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <Share className="w-5 h-5" />
            مشاركة
          </button>
        </div>

        {/* Certificate */}
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="relative">
              <img 
                src="/row-certificat.svg" 
                alt="شهادة تقدير" 
                className="w-full max-w-4xl mx-auto"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-4xl font-bold text-[#01645e] mb-4">
                    {participant.name}
                  </h2>
                  <p className="text-xl text-[#8b7632]">
                    {participant.hackathonTitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Participant Info */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-[#01645e] mb-4">تفاصيل المشارك</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
              <div>
                <span className="font-semibold text-[#01645e]">الاسم:</span>
                <br />
                {participant.name}
              </div>
              <div>
                <span className="font-semibold text-[#01645e]">الإيميل:</span>
                <br />
                {participant.email}
              </div>
              <div>
                <span className="font-semibold text-[#01645e]">الهاكاثون:</span>
                <br />
                {participant.hackathonTitle}
              </div>
              <div>
                <span className="font-semibold text-[#01645e]">التاريخ:</span>
                <br />
                {participant.date || currentDate}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

