'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trophy, Medal, Award, Users, Star, Download, Mail, FileText, Send, CheckCircle, XCircle, Clock, Eye, ArrowLeft, Upload, Settings, Loader2, Save } from 'lucide-react'
import { Certificate } from '@/components/Certificate'

type CertificateType = 'participant' | 'judge' | 'expert'

interface TeamResult {
  id: string
  teamNumber: number
  name: string
  ideaTitle?: string
  ideaDescription?: string
  participants: Array<{
    id: string
    user: { name: string, email: string }
    teamRole: string
  }>
  totalScore: number
  averageScore: number
  evaluationsCount: number
  rank: number
}

interface Hackathon {
  id: string
  title: string
  description: string
  status: string
  startDate: string
  endDate: string
}

interface EmailResult {
  email: string
  name: string
  team: string
  rank: number
  status: 'success' | 'failed'
  error?: string
}

interface CertificateSettings {
  namePositionY: number
  namePositionX: number
  nameFont: string
  nameColor: string
  certificateTemplate?: string
}

export default function SendCertificatesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null)
  const [results, setResults] = useState<TeamResult[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingEmails, setSendingEmails] = useState(false)
  const [sendingFeedbackLinks, setSendingFeedbackLinks] = useState(false)
  const [emailResults, setEmailResults] = useState<EmailResult[]>([])
  const [showEmailResults, setShowEmailResults] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [previewParticipant, setPreviewParticipant] = useState<any>(null)
  const [previewEmail, setPreviewEmail] = useState('')

  // Certificate settings states
  const [certificateType, setCertificateType] = useState<CertificateType>('participant')
  const [settings, setSettings] = useState<CertificateSettings>({
    namePositionY: 0.52,
    namePositionX: 0.50,
    nameFont: 'bold 48px Arial',
    nameColor: '#1a472a'
  })
  const [previewName, setPreviewName] = useState('محمد أحمد علي')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [uploadingCertificate, setUploadingCertificate] = useState(false)
  const [certificateImageSrc, setCertificateImageSrc] = useState('/row-certificat.svg')
  const [savingSettings, setSavingSettings] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [sendingTestEmail, setSendingTestEmail] = useState(false)

  // Judge and Expert states
  const [judgeApplications, setJudgeApplications] = useState<any[]>([])
  const [expertApplications, setExpertApplications] = useState<any[]>([])
  const [loadingJudgesExperts, setLoadingJudgesExperts] = useState(false)

  // Preview states for judges and experts
  const [previewJudgeExpert, setPreviewJudgeExpert] = useState<any>(null)
  const [previewJudgeExpertType, setPreviewJudgeExpertType] = useState<'judge' | 'expert' | null>(null)

  // Email preview and customization states
  const [showEmailPreview, setShowEmailPreview] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailContent, setEmailContent] = useState('')
  const [currentRecipient, setCurrentRecipient] = useState<any>(null)
  const [sendingCertificate, setSendingCertificate] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    if (user.role !== 'admin') {
      router.push('/admin/dashboard')
      return
    }
    fetchHackathons()
  }, [user, router])

  useEffect(() => {
    if (selectedHackathon) {
      loadCertificateSettings()
    }
  }, [selectedHackathon, certificateType])

  // Debounced redraw - only redraw after user stops changing settings for 300ms
  useEffect(() => {
    if (!imageLoaded) return

    const timeoutId = setTimeout(() => {
      redrawCertificate()
    }, 300) // Wait 300ms after last change

    return () => clearTimeout(timeoutId)
  }, [settings.namePositionX, settings.namePositionY, settings.nameColor, settings.nameFont, previewName, imageLoaded, previewJudgeExpert])

  // Immediate redraw for name font changes (visual feedback)
  useEffect(() => {
    if (!imageLoaded) return

    const timeoutId = setTimeout(() => {
      redrawCertificate()
    }, 100) // Faster for font changes

    return () => clearTimeout(timeoutId)
  }, [settings.nameFont])

  const fetchHackathons = async () => {
    try {
      const response = await fetch('/api/admin/hackathons')
      if (response.ok) {
        const data = await response.json()
        setHackathons(data.hackathons || [])
        if (data.hackathons?.length > 0) {
          setSelectedHackathon(data.hackathons[0])
          fetchResults(data.hackathons[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchResults = async (hackathonId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/evaluations`)
      if (response.ok) {
        const data = await response.json()
        const teamsWithRanks = data.teams
          .sort((a: TeamResult, b: TeamResult) => b.totalScore - a.totalScore)
          .map((team: TeamResult, index: number) => ({
            ...team,
            rank: index + 1
          }))
        setResults(teamsWithRanks)
      }
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchJudgesAndExperts = async (hackathonId: string) => {
    setLoadingJudgesExperts(true)
    try {
      // Fetch ALL judge applications (not just approved)
      const judgeResponse = await fetch(`/api/admin/judge-applications?hackathonId=${hackathonId}`)
      if (judgeResponse.ok) {
        const judgeData = await judgeResponse.json()
        setJudgeApplications(judgeData.applications || [])
        console.log(`✅ Loaded ${judgeData.applications?.length || 0} judge applications`)
      }

      // Fetch ALL expert applications (not just approved)
      const expertResponse = await fetch(`/api/admin/expert-applications?hackathonId=${hackathonId}`)
      if (expertResponse.ok) {
        const expertData = await expertResponse.json()
        setExpertApplications(expertData.applications || [])
        console.log(`✅ Loaded ${expertData.applications?.length || 0} expert applications`)
      }
    } catch (error) {
      console.error('Error fetching judges and experts:', error)
    } finally {
      setLoadingJudgesExperts(false)
    }
  }

  const loadCertificateSettings = async () => {
    if (!selectedHackathon) return
    try {
      const response = await fetch(
        `/api/admin/hackathons/${selectedHackathon.id}/certificate-settings?type=${certificateType}`,
        { credentials: 'include' }
      )
      if (response.ok) {
        const data = await response.json()

        // Ensure nameFont is in correct format 'bold XXpx Arial'
        let nameFont = data.nameFont || 'bold 48px Arial'
        if (!nameFont.includes('px')) {
          // If it's just a number like "48", convert to "bold 48px Arial"
          const fontSize = parseInt(nameFont) || 48
          nameFont = `bold ${fontSize}px Arial`
        }

        setSettings({
          ...data,
          nameFont // Use the corrected nameFont
        })
        setCertificateImageSrc(data.certificateTemplate || '/row-certificat.svg')
        loadCertificateImage(data.certificateTemplate || '/row-certificat.svg')
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const loadCertificateImage = (imageSrc: string) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setImageLoaded(false)

    const img = new Image()
    img.onload = () => {
      const scale = 0.6
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      drawCertificate(ctx, canvas, img, scale)
      setImageLoaded(true)
    }

    img.onerror = () => {
      setImageLoaded(false)
      if (imageSrc !== '/row-certificat.svg') {
        setCertificateImageSrc('/row-certificat.svg')
      }
    }

    img.crossOrigin = 'anonymous'
    img.src = `${imageSrc}?t=${Date.now()}`
  }

  const drawCertificate = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, img: HTMLImageElement, scale: number) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    ctx.font = settings.nameFont
    ctx.fillStyle = settings.nameColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const x = canvas.width * settings.namePositionX
    const y = canvas.height * settings.namePositionY

    // Use the appropriate name based on preview type
    const displayName = previewJudgeExpert ? previewJudgeExpert.name : previewName
    ctx.fillText(displayName, x, y)
  }

  const redrawCertificate = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      const scale = 0.6
      drawCertificate(ctx, canvas, img, scale)
    }
    img.crossOrigin = 'anonymous'
    img.src = `${certificateImageSrc}?t=${Date.now()}`
  }

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة')
      return
    }

    if (!selectedHackathon) {
      alert('يرجى اختيار هاكاثون أولاً')
      return
    }

    try {
      setUploadingCertificate(true)
      const formData = new FormData()
      formData.append('certificateImage', file)
      formData.append('hackathonId', selectedHackathon.id)
      formData.append('certificateType', certificateType)

      const response = await fetch(`/api/supervisor/certificate-template/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        const newUrl = data.url
        setSettings(prev => ({
          ...prev,
          certificateTemplate: newUrl
        }))
        setCertificateImageSrc(newUrl)

        setImageLoaded(false)
        setTimeout(() => {
          loadCertificateImage(newUrl)
        }, 500)

        alert('✅ تم رفع قالب الشهادة بنجاح')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل رفع الملف')
      }
    } catch (error: any) {
      console.error('❌ Upload error:', error)
      alert(`❌ حدث خطأ: ${error.message}`)
    } finally {
      setUploadingCertificate(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!selectedHackathon) return

    try {
      setSavingSettings(true)

      // Ensure nameFont is in correct format 'bold XXpx Arial'
      let nameFont = settings.nameFont
      if (!nameFont.includes('px')) {
        // If it's just a number like "48", convert to "bold 48px Arial"
        const fontSize = parseInt(nameFont) || 48
        nameFont = `bold ${fontSize}px Arial`
      }

      const settingsToSave = {
        ...settings,
        nameFont, // Use the corrected nameFont
        certificateTemplate: certificateImageSrc,
        type: certificateType
      }

      console.log('💾 Saving certificate settings:', {
        hackathonId: selectedHackathon.id,
        certificateType,
        certificateTemplate: certificateImageSrc,
        settings: settingsToSave
      })

      const response = await fetch(`/api/admin/hackathons/${selectedHackathon.id}/certificate-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsToSave),
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Settings saved successfully:', result)

        setSettings(prev => ({
          ...prev,
          certificateTemplate: certificateImageSrc
        }))

        alert('✅ تم حفظ إعدادات الشهادة بنجاح')
      } else {
        const error = await response.json()
        console.error('❌ Failed to save settings:', error)
        throw new Error('فشل الحفظ')
      }
    } catch (error) {
      console.error('❌ Error saving settings:', error)
      alert('❌ حدث خطأ أثناء حفظ الإعدادات')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleHackathonChange = (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon)
    fetchResults(hackathon.id)
    fetchJudgesAndExperts(hackathon.id)
    setShowEmailResults(false)
    setEmailResults([])
    setPreviewMode(false)
  }

  const sendTestEmail = async () => {
    if (!testEmail || !selectedHackathon) {
      alert('يرجى إدخال البريد الإلكتروني واختيار هاكاثون')
      return
    }

    try {
      setSendingTestEmail(true)
      const response = await fetch(`/api/admin/hackathons/${selectedHackathon.id}/send-test-certificate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          certificateType,
          previewName,
          hackathonTitle: selectedHackathon.title,
          hackathonDates: {
            start: selectedHackathon.startDate,
            end: selectedHackathon.endDate
          }
        }),
        credentials: 'include'
      })

      if (response.ok) {
        alert(`✅ تم إرسال الإيميل التجريبي إلى ${testEmail}`)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'فشل الإرسال')
      }
    } catch (error: any) {
      alert(`❌ حدث خطأ: ${error.message}`)
    } finally {
      setSendingTestEmail(false)
    }
  }

  const previewCertificateAndEmail = (participant: any, team: TeamResult) => {
    setPreviewParticipant({
      ...participant,
      team: team,
      hackathonTitle: selectedHackathon?.title || '',
      rank: team.rank,
      isWinner: team.rank <= 3,
      totalScore: team.totalScore,
      date: new Date().toLocaleDateString('ar-SA')
    })

    // Generate preview email with new template
    const hackathonTitle = selectedHackathon?.title || 'هاكاثون الصحة النفسية'
    const startDate = selectedHackathon?.startDate ? new Date(selectedHackathon.startDate).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' }) : '21 أكتوبر'
    const endDate = selectedHackathon?.endDate ? new Date(selectedHackathon.endDate).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }) : '23 أكتوبر 2025'

    const emailSubject = `شهادة مشاركة – ${hackathonTitle}`

    setPreviewEmail(`الموضوع: ${emailSubject}

السادة المشاركون في ${hackathonTitle}،

السلام عليكم ورحمة الله وبركاته،

نتوجه إليك بخالص الشكر والتقدير على مشاركتك الفاعلة في ${hackathonTitle}، الذي أُقيم خلال الفترة من ${startDate} إلى ${endDate}.

لقد كنت جزءًا مهمًا من رحلة ملهمة مليئة بالإبداع، التعاون، والرغبة الصادقة في إحداث أثر إيجابي في مجال الصحة النفسية.

يسعدنا أن نُرفق لك شهادة المشاركة تقديرًا لجهودك المتميزة، وأفكارك التي ساهمت في إثراء التجربة وإلهام الآخرين.

نؤمن أن هذه المشاركة ليست سوى بداية لمسارٍ مليء بالابتكار والعطاء.

نتمنى لك دوام النجاح والإبداع، على أمل أن نراك في فعاليات قادمة بإذن الله.

مع خالص التقدير،
فريق ${hackathonTitle}`)

    setPreviewMode(true)
  }

  const previewJudgeExpertCertificateAndEmail = (person: any, type: 'judge' | 'expert') => {
    if (!selectedHackathon) return

    setPreviewJudgeExpert(person)
    setPreviewJudgeExpertType(type)

    // Generate preview email
    const hackathonTitle = selectedHackathon.title
    const startDate = selectedHackathon.startDate ? new Date(selectedHackathon.startDate).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' }) : '21 أكتوبر'
    const endDate = selectedHackathon.endDate ? new Date(selectedHackathon.endDate).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }) : '23 أكتوبر 2025'

    const emailSubject = `شهادة تقدير – ${hackathonTitle}`

    if (type === 'judge') {
      setPreviewEmail(`الموضوع: ${emailSubject}

الأستاذ/ ${person.name} المحترم،

السلام عليكم ورحمة الله وبركاته،

يتقدم فريق ${hackathonTitle} بجزيل الشكر والتقدير لجهودكم المتميزة ومساهمتكم الفعّالة كعضو في لجنة التحكيم.

لقد كان لعطائكم وإرشادكم الأثر الكبير في تمكين الفرق المشاركة، وتوجيهها نحو تطوير أفكار مبتكرة قابلة للتنفيذ، بما يسهم في تعزيز الوعي بالصحة النفسية ودعم جودة الحياة.

يسعدنا أن نُرفق لكم شهادة التقدير، عرفانًا بدوركم المؤثر وإسهاماتكم القيمة خلال الفترة من ${startDate} إلى ${endDate}.

نتمنى لكم دوام التوفيق والعطاء، وأن تستمر مسيرتكم الحافلة بالتميز والإلهام.

مع خالص الشكر والتقدير،
اللجنة التنظيمية لـ ${hackathonTitle}`)
    } else {
      setPreviewEmail(`الموضوع: ${emailSubject}

الأستاذ/ ${person.name} المحترم،

السلام عليكم ورحمة الله وبركاته،

يتقدم فريق ${hackathonTitle} بخالص الشكر والتقدير لجهودكم القيّمة ومساهمتكم الفعّالة كعضو في لجنة الخبراء.

لقد كان لعطائكم وإرشادكم الأثر الكبير في تمكين الفرق المشاركة، وتوجيهها نحو تطوير أفكار مبتكرة قابلة للتنفيذ، بما يسهم في تعزيز الوعي بالصحة النفسية ودعم جودة الحياة.

يسعدنا أن نُرفق لكم شهادة التقدير، عرفانًا بدوركم الملهم وجهودكم المثمرة خلال الفترة من ${startDate} إلى ${endDate}.

نتمنى لكم دوام التوفيق والعطاء، وأن تستمر مسيرتكم الحافلة بالتميز والإلهام.

مع خالص التقدير،
اللجنة التنظيمية لـ ${hackathonTitle}`)
    }

    setPreviewMode(true)
  }

  const sendCertificatesAndEmails = async () => {
    if (!selectedHackathon) return

    const totalParticipants = results.reduce((total, team) => total + team.participants.length, 0)
    const winnersCount = results.filter(team => team.rank <= 3).reduce((total, team) => total + team.participants.length, 0)
    const regularCount = totalParticipants - winnersCount

    // تأكيد الإرسال
    const confirmMessage = `
🎯 هل أنت متأكد من إرسال الشهادات والرسائل؟

📊 الإحصائيات:
• إجمالي المشاركين: ${totalParticipants}
• الفائزون (مراكز 1-3): ${winnersCount}
• المشاركون العاديون: ${regularCount}

📧 سيتم إرسال:
• رسائل تهنئة + شهادات فوز للفائزين
• رسائل شكر + شهادات مشاركة للباقي

⚠️ هذه العملية لا يمكن التراجع عنها!
    `

    if (!confirm(confirmMessage)) {
      return
    }

    setSendingEmails(true)
    setShowEmailResults(false)

    try {
      const response = await fetch(`/api/admin/hackathons/${selectedHackathon.id}/send-certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        setEmailResults(data.results || [])
        setShowEmailResults(true)

        // رسالة نجاح مفصلة
        const successMessage = `
✅ تم إرسال الشهادات والرسائل بنجاح!

📊 النتائج:
• تم الإرسال بنجاح: ${data.successCount}
• فشل في الإرسال: ${data.failureCount}
• إجمالي المحاولات: ${data.successCount + data.failureCount}

🎉 جميع المشاركين سيحصلون على شهاداتهم ورسائل التقدير!
        `
        alert(successMessage)
      } else {
        const error = await response.json()
        alert(`❌ حدث خطأ: ${error.error}`)
      }
    } catch (error) {
      console.error('Error sending certificates:', error)
      alert('❌ حدث خطأ في إرسال الشهادات. يرجى المحاولة مرة أخرى.')
    } finally {
      setSendingEmails(false)
    }
  }

  const sendFeedbackLinks = async () => {
    if (!selectedHackathon) return

    const totalParticipants = results.reduce((total, team) => total + team.participants.length, 0)

    const confirmMessage = `
🎯 هل أنت متأكد من إرسال روابط التقييم؟

📊 الإحصائيات:
• إجمالي المشاركين: ${totalParticipants}

📧 سيتم إرسال:
• رابط فورم التقييم لكل مشارك
• دعوة لتقييم تجربتهم في الهاكاثون

⚠️ تأكد من تفعيل فورم التقييم أولاً!
    `

    if (!confirm(confirmMessage)) {
      return
    }

    setSendingFeedbackLinks(true)

    try {
      const response = await fetch(`/api/admin/hackathons/${selectedHackathon.id}/send-feedback-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()

        const successMessage = `
✅ تم إرسال روابط التقييم بنجاح!

📊 النتائج:
• تم الإرسال بنجاح: ${data.successCount}
• فشل في الإرسال: ${data.failureCount}
• إجمالي المحاولات: ${data.totalCount}

🎉 جميع المشاركين سيتمكنون من تقييم تجربتهم!
        `
        alert(successMessage)
      } else {
        const error = await response.json()
        alert(`❌ حدث خطأ: ${error.error}`)
      }
    } catch (error) {
      console.error('Error sending feedback links:', error)
      alert('❌ حدث خطأ في إرسال روابط التقييم')
    } finally {
      setSendingFeedbackLinks(false)
    }
  }

  const sendJudgeExpertCertificates = async (type: 'judge' | 'expert') => {
    if (!selectedHackathon) return

    const typeName = type === 'judge' ? 'المحكمين' : 'الخبراء'

    const confirmMessage = `
🎯 هل أنت متأكد من إرسال شهادات ${typeName}؟

📧 سيتم إرسال:
• شهادات التقدير لجميع ${typeName} المعتمدين الذين سجلوا عبر الفورم

⚠️ هذه العملية لا يمكن التراجع عنها!
    `

    if (!confirm(confirmMessage)) {
      return
    }

    setSendingEmails(true)

    try {
      const response = await fetch(`/api/admin/hackathons/${selectedHackathon.id}/send-judge-expert-certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateType: type })
      })

      if (response.ok) {
        const data = await response.json()

        const successMessage = `
✅ تم إرسال شهادات ${typeName} بنجاح!

📊 النتائج:
• تم الإرسال بنجاح: ${data.successCount}
• فشل في الإرسال: ${data.failureCount}
• إجمالي المحاولات: ${data.successCount + data.failureCount}

🎉 جميع ${typeName} سيحصلون على شهادات التقدير!
        `
        alert(successMessage)
      } else {
        const error = await response.json()
        alert(`❌ حدث خطأ: ${error.error}`)
      }
    } catch (error) {
      console.error(`Error sending ${type} certificates:`, error)
      alert(`❌ حدث خطأ في إرسال شهادات ${typeName}`)
    } finally {
      setSendingEmails(false)
    }
  }

  // Email templates
  const getEmailTemplate = (recipientType: 'participant' | 'judge' | 'expert', recipientName: string, hackathonTitle: string) => {
    const templates = {
      participant: {
        subject: `شهادة مشاركة – ${hackathonTitle}`,
        content: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.8; color: #333; direction: rtl; max-width: 600px; margin: 0 auto; background: white;">

  <div style="padding: 30px;">
    <p style="font-size: 16px; margin-bottom: 20px;">السادة المشاركون في ${hackathonTitle}،</p>

    <p style="font-size: 16px; margin-bottom: 20px;">السلام عليكم ورحمة الله وبركاته،</p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      نتوجه إليك بخالص الشكر والتقدير على مشاركتك الفاعلة في ${hackathonTitle}.
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      لقد كنت جزءًا مهمًا من رحلة ملهمة مليئة بالإبداع، التعاون، والرغبة الصادقة في إحداث أثر إيجابي.
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      يسعدنا أن نُرفق لك شهادة المشاركة تقديرًا لجهودك المتميزة، وأفكارك التي ساهمت في إثراء التجربة وإلهام الآخرين.
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      نؤمن أن هذه المشاركة ليست سوى بداية لمسارٍ مليء بالابتكار والعطاء.
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      نتمنى لك دوام النجاح والإبداع، على أمل أن نراك في فعاليات قادمة بإذن الله.
    </p>

    <p style="font-size: 16px; margin-top: 30px;">مع خالص التقدير والاحترام،</p>
    <p style="font-size: 16px; font-weight: bold; color: #01645e;">فريق ${hackathonTitle}</p>
  </div>
</div>`
      },
      judge: {
        subject: `شهادة تقدير – ${hackathonTitle}`,
        content: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.8; color: #333; direction: rtl; max-width: 600px; margin: 0 auto; background: white;">

  <div style="padding: 30px;">
    <p style="font-size: 16px; margin-bottom: 20px;">الأستاذ/ة المحترم/ة <strong>${recipientName}</strong>،</p>

    <p style="font-size: 16px; margin-bottom: 20px;">السلام عليكم ورحمة الله وبركاته،</p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      يتقدم فريق ${hackathonTitle} بجزيل الشكر والتقدير لجهودكم المتميزة ومساهمتكم الفعّالة كعضو محترم في لجنة التحكيم.
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      خبرتكم وحكمتكم كانت عاملاً أساسياً في إنجاح هذا الحدث المميز، وقد ساهمت توجيهاتكم في رفع مستوى المشاريع المشاركة.
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      يسعدنا أن نُرفق لك شهادة التقدير تقديرًا لجهودك القيّمة ومساهمتك في تحقيق أهداف الهاكاثون.
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      نتطلع إلى تعاونكم المستمر في فعالياتنا القادمة، ونقدر دعمكم المتواصل للمبدعين والمبتكرين.
    </p>

    <p style="font-size: 16px; margin-top: 30px;">مع خالص الشكر والتقدير،</p>
    <p style="font-size: 16px; font-weight: bold; color: #01645e;">اللجنة التنظيمية لـ ${hackathonTitle}</p>
  </div>
</div>`
      },
      expert: {
        subject: `شهادة تقدير – ${hackathonTitle}`,
        content: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.8; color: #333; direction: rtl; max-width: 600px; margin: 0 auto; background: white;">

  <div style="padding: 30px;">
    <p style="font-size: 16px; margin-bottom: 20px;">الأستاذ/ة الخبير/ة <strong>${recipientName}</strong>،</p>

    <p style="font-size: 16px; margin-bottom: 20px;">السلام عليكم ورحمة الله وبركاته،</p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      يتقدم فريق ${hackathonTitle} بخالص الشكر والتقدير لجهودكم القيّمة ومساهمتكم الفعّالة كعضو مميز في لجنة الخبراء.
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      معرفتكم العميقة وتوجيهاتكم الحكيمة أثرت المشاركين وأضافت قيمة حقيقية للحدث، وساهمت في تطوير مهاراتهم وإلهامهم للإبداع.
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      يسعدنا أن نُرفق لك شهادة التقدير تقديرًا لخبرتك ومشاركتك الفعّالة في إنجاح هذا الحدث المميز.
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      نتطلع إلى استمرار تعاونكم معنا في المبادرات القادمة، ونقدر دعمكم للمواهب الشابة والمبدعة.
    </p>

    <p style="font-size: 16px; margin-top: 30px;">مع خالص التقدير والاحترام،</p>
    <p style="font-size: 16px; font-weight: bold; color: #01645e;">اللجنة التنظيمية لـ ${hackathonTitle}</p>
  </div>
</div>`
      }
    }

    return templates[recipientType]
  }

  const openEmailPreview = (recipientType: 'participant' | 'judge' | 'expert', recipientId: string | undefined, recipientName: string) => {
    if (!selectedHackathon) return

    const template = getEmailTemplate(recipientType, recipientName, selectedHackathon.title)
    setEmailSubject(template.subject)
    setEmailContent(template.content)
    setCurrentRecipient({ type: recipientType, id: recipientId, name: recipientName })
    setShowEmailPreview(true)
  }

  const sendCertificateWithCustomEmail = async () => {
    if (!currentRecipient || !selectedHackathon) return

    try {
      setSendingCertificate(true)

      const payload = {
        recipientType: currentRecipient.type,
        recipientId: currentRecipient.id,
        hackathonId: selectedHackathon.id,
        customEmail: {
          subject: emailSubject,
          content: emailContent
        }
      }

      console.log('📤 Sending certificate with custom email:', payload)

      const response = await fetch('/api/admin/send-individual-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const data = await response.json()
        alert(`✅ ${data.message}`)
        setShowEmailPreview(false)
      } else {
        const error = await response.json()
        alert(`❌ خطأ: ${error.error}`)
      }
    } catch (error) {
      console.error('❌ Error sending certificate:', error)
      alert('❌ حدث خطأ أثناء إرسال الشهادة')
    } finally {
      setSendingCertificate(false)
    }
  }

  const sendIndividualCertificate = async (recipientType: 'participant' | 'judge' | 'expert', recipientId: string | undefined, recipientName: string) => {
    if (!selectedHackathon) return

    console.log('🔍 sendIndividualCertificate called with:', { recipientType, recipientId, recipientName })

    if (!recipientId) {
      alert('❌ خطأ: معرف المستلم غير موجود')
      console.error('❌ recipientId is undefined or null')
      return
    }

    // Open email preview instead of direct send
    openEmailPreview(recipientType, recipientId, recipientName)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <div className="w-6 h-6 bg-[#01645e] rounded-full flex items-center justify-center text-white text-xs font-bold">{rank}</div>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0fdf4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#01645e] mx-auto"></div>
          <p className="mt-4 text-[#01645e] text-xl">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  if (previewMode && (previewParticipant || previewJudgeExpert)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0fdf4]">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => {
                setPreviewMode(false)
                setPreviewJudgeExpert(null)
                setPreviewJudgeExpertType(null)
              }}
              className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة
            </button>
            <h1 className="text-3xl font-bold text-[#01645e]">
              معاينة الشهادة والإيميل - {previewJudgeExpert ? (previewJudgeExpertType === 'judge' ? 'محكم' : 'خبير') : 'مشارك'}
            </h1>
          </div>

          {/* Certificate Settings Section */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl mb-8">
            <h2 className="text-xl font-bold text-[#01645e] mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              إعدادات قالب الشهادة
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Certificate Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع الشهادة</label>
                <select
                  value={certificateType}
                  onChange={(e) => setCertificateType(e.target.value as CertificateType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01645e] focus:border-transparent"
                >
                  <option value="participant">شهادة مشارك</option>
                  <option value="judge">شهادة محكم</option>
                  <option value="expert">شهادة خبير</option>
                </select>
              </div>

              {/* Upload Certificate Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رفع قالب الشهادة</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCertificateUpload}
                  disabled={uploadingCertificate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01645e] focus:border-transparent"
                />
                {uploadingCertificate && <p className="text-sm text-gray-500 mt-1">جاري الرفع...</p>}
              </div>

              {/* Preview Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم المعاينة</label>
                <input
                  type="text"
                  value={previewName}
                  onChange={(e) => setPreviewName(e.target.value)}
                  placeholder="محمد أحمد علي"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01645e] focus:border-transparent"
                />
              </div>

              {/* Position Y - Simple & Powerful */}
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <label className="block text-sm font-bold text-blue-900 mb-3">
                  📍 موضع الاسم عمودياً (Y)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">أدخل النسبة المئوية (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={(settings.namePositionY * 100).toFixed(1)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        setSettings({ ...settings, namePositionY: Math.min(100, Math.max(0, val)) / 100 })
                      }}
                      className="w-full px-3 py-2 text-lg font-bold border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setSettings({ ...settings, namePositionY: Math.max(0, settings.namePositionY - 0.01) })}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-lg transition-all"
                    >
                      ⬆️ أعلى
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, namePositionY: Math.min(1, settings.namePositionY + 0.01) })}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-lg transition-all"
                    >
                      ⬇️ أسفل
                    </button>
                  </div>
                </div>
              </div>

              {/* Position X - Simple & Powerful */}
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <label className="block text-sm font-bold text-green-900 mb-3">
                  📍 موضع الاسم أفقياً (X)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">أدخل النسبة المئوية (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={(settings.namePositionX * 100).toFixed(1)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        setSettings({ ...settings, namePositionX: Math.min(100, Math.max(0, val)) / 100 })
                      }}
                      className="w-full px-3 py-2 text-lg font-bold border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setSettings({ ...settings, namePositionX: Math.max(0, settings.namePositionX - 0.01) })}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-lg transition-all"
                    >
                      ⬅️ يسار
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, namePositionX: Math.min(1, settings.namePositionX + 0.01) })}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-lg transition-all"
                    >
                      ➡️ يمين
                    </button>
                  </div>
                </div>
              </div>

              {/* Font Size - Simple & Powerful */}
              <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                <label className="block text-sm font-bold text-purple-900 mb-3">
                  🔤 حجم الخط
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">أدخل الحجم بالبكسل (10-200)</label>
                    <input
                      type="number"
                      min="10"
                      max="200"
                      step="1"
                      value={(() => {
                        // Extract number from 'bold 48px Arial' format
                        const match = settings.nameFont.match(/(\d+)/)
                        return match ? parseInt(match[1]) : 48
                      })()}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 48
                        const newSize = Math.min(200, Math.max(10, val))
                        setSettings({ ...settings, nameFont: `bold ${newSize}px Arial` })
                      }}
                      className="w-full px-3 py-2 text-lg font-bold border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        const match = settings.nameFont.match(/(\d+)/)
                        const currentSize = match ? parseInt(match[1]) : 48
                        const newSize = Math.min(200, currentSize + 5)
                        setSettings({ ...settings, nameFont: `bold ${newSize}px Arial` })
                      }}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-lg transition-all"
                    >
                      ➕ أكبر
                    </button>
                    <button
                      onClick={() => {
                        const match = settings.nameFont.match(/(\d+)/)
                        const currentSize = match ? parseInt(match[1]) : 48
                        const newSize = Math.max(10, currentSize - 5)
                        setSettings({ ...settings, nameFont: `bold ${newSize}px Arial` })
                      }}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-lg transition-all"
                    >
                      ➖ أصغر
                    </button>
                  </div>
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">لون الاسم</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.nameColor}
                    onChange={(e) => setSettings({ ...settings, nameColor: e.target.value })}
                    className="w-16 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={settings.nameColor}
                    onChange={(e) => setSettings({ ...settings, nameColor: e.target.value })}
                    placeholder="#1a472a"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01645e] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Save Settings Button */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="bg-gradient-to-r from-[#01645e] to-[#3ab666] text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
              >
                {savingSettings ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    حفظ إعدادات الشهادة
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Email Preview */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl">
              <h2 className="text-xl font-bold text-[#01645e] mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6" />
                معاينة الإيميل
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                  {previewEmail}
                </pre>
              </div>

              {/* Test Email & Individual Send Section */}
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">إرسال إيميل تجريبي</h3>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="أدخل البريد الإلكتروني"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01645e] focus:border-transparent text-sm"
                  />
                  <button
                    onClick={sendTestEmail}
                    disabled={sendingTestEmail || !testEmail}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 text-sm"
                  >
                    {sendingTestEmail ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        إرسال...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        إرسال تجريبي
                      </>
                    )}
                  </button>
                </div>

                {/* Individual Send Button - للمحكمين والخبراء */}
                {previewJudgeExpert && previewJudgeExpertType && (
                  <div className="pt-3 border-t border-gray-200">
                    <button
                      onClick={() => sendIndividualCertificate(
                        previewJudgeExpertType,
                        previewJudgeExpert.id,
                        previewJudgeExpert.name
                      )}
                      className={`w-full ${
                        previewJudgeExpertType === 'judge'
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-cyan-600 hover:bg-cyan-700'
                      } text-white px-6 py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl`}
                    >
                      <Send className="w-5 h-5" />
                      إرسال شهادة {previewJudgeExpertType === 'judge' ? 'المحكم' : 'الخبير'} - {previewJudgeExpert.name}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Certificate Preview */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl">
              <h2 className="text-xl font-bold text-[#01645e] mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                معاينة الشهادة
              </h2>
              <div className="border rounded-lg p-4 bg-gray-50">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center gap-6 mt-8">
            {/* Main Send Button */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#c3e956] to-[#3ab666] rounded-2xl blur-xl opacity-50 animate-pulse"></div>
              <button
                onClick={sendCertificatesAndEmails}
                disabled={sendingEmails || !selectedHackathon || results.length === 0}
                className="relative bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#014a46] hover:to-[#2d8f52] text-white px-12 py-4 rounded-2xl font-bold shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-lg"
              >
                {sendingEmails ? (
                  <>
                    <Clock className="w-6 h-6 animate-spin" />
                    جاري إرسال الشهادات والرسائل...
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    📧 إرسال الشهادات والرسائل لجميع المشاركين
                  </>
                )}
              </button>
            </div>

            {/* Feedback Links Button */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-xl opacity-40 animate-pulse"></div>
              <button
                onClick={sendFeedbackLinks}
                disabled={sendingFeedbackLinks || !selectedHackathon || results.length === 0}
                className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 rounded-2xl font-bold shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-lg"
              >
                {sendingFeedbackLinks ? (
                  <>
                    <Clock className="w-6 h-6 animate-spin" />
                    جاري إرسال روابط التقييم...
                  </>
                ) : (
                  <>
                    <Star className="w-6 h-6" />
                    ⭐ إرسال روابط تقييم الهاكاثون للمشاركين
                  </>
                )}
              </button>
            </div>

            {/* Info Text */}
            {selectedHackathon && results.length > 0 && (
              <div className="text-center">
                <p className="text-[#01645e] font-semibold text-lg mb-2">
                  🎯 سيتم إرسال الشهادات والرسائل إلى {results.reduce((total, team) => total + team.participants.length, 0)} مشارك
                </p>
                <p className="text-[#8b7632] text-sm">
                  • الفائزون (المراكز 1-3): رسالة تهنئة + شهادة فوز
                  <br />
                  • باقي المشاركين: رسالة شكر + شهادة مشاركة
                </p>
              </div>
            )}

            {/* Warning if no data */}
            {(!selectedHackathon || results.length === 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                <p className="text-yellow-800 font-semibold">⚠️ يرجى اختيار هاكاثون يحتوي على مشاركين أولاً</p>
              </div>
            )}
          </div>

          {/* Judge & Expert Certificates Section */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 border border-[#01645e]/20 shadow-xl mt-8">
            <h2 className="text-2xl font-bold text-[#01645e] mb-6 flex items-center gap-3">
              <Award className="w-8 h-8" />
              المحكمون والخبراء
            </h2>

            {/* Display Judges and Experts Lists */}
            {selectedHackathon && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Judges List */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-300">
                  <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    المحكمون المعتمدون ({judgeApplications.length})
                  </h3>

                  {loadingJudgesExperts ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    </div>
                  ) : judgeApplications.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {judgeApplications.map((judge, index) => {
                        const statusColors = {
                          approved: 'bg-green-100 text-green-700 border-green-300',
                          pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                          rejected: 'bg-red-100 text-red-700 border-red-300'
                        }
                        const statusLabels = {
                          approved: 'معتمد',
                          pending: 'معلق',
                          rejected: 'مرفوض'
                        }
                        return (
                          <div key={judge.id} className="bg-white rounded-lg p-4 shadow-sm border border-purple-200">
                            <div className="flex items-start gap-3">
                              <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-bold text-purple-900 truncate">{judge.name}</p>
                                  <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[judge.status as keyof typeof statusColors] || statusColors.pending}`}>
                                    {statusLabels[judge.status as keyof typeof statusLabels] || judge.status}
                                  </span>
                                </div>
                                <p className="text-sm text-purple-700 truncate">{judge.email}</p>
                                {judge.expertise && (
                                  <p className="text-xs text-purple-600 mt-1 truncate">{judge.expertise}</p>
                                )}
                              </div>
                              {judge.status === 'approved' && (
                                <button
                                  onClick={() => sendIndividualCertificate('judge', judge.id, judge.name)}
                                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors flex-shrink-0"
                                  title="إرسال شهادة"
                                >
                                  <Send className="w-4 h-4" />
                                  إرسال
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-purple-600">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>لا يوجد طلبات محكمين</p>
                    </div>
                  )}
                </div>

                {/* Experts List */}
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-6 border-2 border-cyan-300">
                  <h3 className="text-xl font-bold text-cyan-800 mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    الخبراء المعتمدون ({expertApplications.length})
                  </h3>

                  {loadingJudgesExperts ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                    </div>
                  ) : expertApplications.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {expertApplications.map((expert, index) => {
                        const statusColors = {
                          approved: 'bg-green-100 text-green-700 border-green-300',
                          pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                          rejected: 'bg-red-100 text-red-700 border-red-300'
                        }
                        const statusLabels = {
                          approved: 'معتمد',
                          pending: 'معلق',
                          rejected: 'مرفوض'
                        }
                        return (
                          <div key={expert.id} className="bg-white rounded-lg p-4 shadow-sm border border-cyan-200">
                            <div className="flex items-start gap-3">
                              <div className="bg-cyan-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-bold text-cyan-900 truncate">{expert.name}</p>
                                  <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[expert.status as keyof typeof statusColors] || statusColors.pending}`}>
                                    {statusLabels[expert.status as keyof typeof statusLabels] || expert.status}
                                  </span>
                                </div>
                                <p className="text-sm text-cyan-700 truncate">{expert.email}</p>
                                {expert.expertise && (
                                  <p className="text-xs text-cyan-600 mt-1 truncate">{expert.expertise}</p>
                                )}
                              </div>
                              {expert.status === 'approved' && (
                                <button
                                  onClick={() => sendIndividualCertificate('expert', expert.id, expert.name)}
                                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors flex-shrink-0"
                                  title="إرسال شهادة"
                                >
                                  <Send className="w-4 h-4" />
                                  إرسال
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-cyan-600">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>لا يوجد طلبات خبراء</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Send Buttons */}
            <h3 className="text-xl font-bold text-[#01645e] mb-4">إرسال الشهادات</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Send Judge Certificates */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-purple-800 flex items-center gap-2">
                    <Send className="w-6 h-6" />
                    شهادات المحكمين
                  </h3>
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {judgeApplications.length}
                  </span>
                </div>
                <p className="text-purple-700 mb-4 text-sm">
                  إرسال شهادات التقدير لـ {judgeApplications.filter(j => j.status === 'approved').length} محكم معتمد
                </p>
                <button
                  onClick={() => sendJudgeExpertCertificates('judge')}
                  disabled={!selectedHackathon || sendingEmails || judgeApplications.filter(j => j.status === 'approved').length === 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sendingEmails ? (
                    <>
                      <Clock className="w-5 h-5 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      إرسال ({judgeApplications.filter(j => j.status === 'approved').length})
                    </>
                  )}
                </button>
              </div>

              {/* Send Expert Certificates */}
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-6 border-2 border-cyan-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-cyan-800 flex items-center gap-2">
                    <Send className="w-6 h-6" />
                    شهادات الخبراء
                  </h3>
                  <span className="bg-cyan-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {expertApplications.length}
                  </span>
                </div>
                <p className="text-cyan-700 mb-4 text-sm">
                  إرسال شهادات التقدير لـ {expertApplications.filter(e => e.status === 'approved').length} خبير معتمد
                </p>
                <button
                  onClick={() => sendJudgeExpertCertificates('expert')}
                  disabled={!selectedHackathon || sendingEmails || expertApplications.filter(e => e.status === 'approved').length === 0}
                  className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sendingEmails ? (
                    <>
                      <Clock className="w-5 h-5 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      إرسال ({expertApplications.filter(e => e.status === 'approved').length})
                    </>
                  )}
                </button>
              </div>
            </div>

            {!selectedHackathon && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center mt-6">
                <p className="text-yellow-800 font-semibold">⚠️ يرجى اختيار هاكاثون أولاً</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0fdf4]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-[#c3e956] to-[#3ab666] rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-[#01645e] to-[#3ab666] p-6 rounded-full shadow-2xl w-24 h-24 mx-auto flex items-center justify-center">
              <Send className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#01645e] via-[#3ab666] to-[#c3e956] bg-clip-text text-transparent mb-4">
            📧 إرسال الشهادات والإيميلات
          </h1>
          <p className="text-[#8b7632] text-xl">معاينة وإرسال شهادات التقدير للمشاركين</p>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => router.push('/admin/results')}
            className="bg-gradient-to-r from-[#3ab666] to-[#c3e956] text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            عرض النتائج
          </button>
          
          <button
            onClick={() => router.push('/admin/results-management')}
            className="bg-gradient-to-r from-[#c3e956] to-[#01645e] text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            إدارة النتائج
          </button>
        </div>

        {/* Hackathon Selection */}
        {hackathons.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl">
              <h3 className="text-xl font-bold text-[#01645e] mb-4">اختر الهاكاثون:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hackathons.map((hackathon) => (
                  <button
                    key={hackathon.id}
                    onClick={() => handleHackathonChange(hackathon)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedHackathon?.id === hackathon.id
                        ? 'border-[#01645e] bg-gradient-to-r from-[#01645e]/10 to-[#3ab666]/10'
                        : 'border-gray-200 hover:border-[#01645e]/50'
                    }`}
                  >
                    <h4 className="font-bold text-[#01645e]">{hackathon.title}</h4>
                    <p className="text-sm text-[#8b7632] mt-1">{hackathon.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Stats */}
        {selectedHackathon && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl">
              <h2 className="text-xl font-bold text-[#01645e] mb-4 flex items-center gap-2">
                <Users className="w-6 h-6" />
                إحصائيات الهاكاثون - {selectedHackathon.title}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-gradient-to-br from-[#01645e]/10 to-[#3ab666]/10 rounded-xl p-4 text-center border border-[#01645e]/20">
                  <div className="text-2xl font-bold text-[#01645e]">{results.length}</div>
                  <div className="text-sm text-[#8b7632]">فريق مشارك</div>
                </div>
                <div className="bg-gradient-to-br from-[#3ab666]/10 to-[#c3e956]/10 rounded-xl p-4 text-center border border-[#3ab666]/20">
                  <div className="text-2xl font-bold text-[#3ab666]">
                    {results.reduce((total, team) => total + team.participants.length, 0)}
                  </div>
                  <div className="text-sm text-[#8b7632]">مشارك إجمالي</div>
                </div>
                <div className="bg-gradient-to-br from-[#c3e956]/10 to-[#01645e]/10 rounded-xl p-4 text-center border border-[#c3e956]/20">
                  <div className="text-2xl font-bold text-[#c3a635]">
                    {results.filter(team => team.rank <= 3).reduce((total, team) => total + team.participants.length, 0)}
                  </div>
                  <div className="text-sm text-[#8b7632]">فائز (مراكز 1-3)</div>
                </div>
                <div className="bg-gradient-to-br from-[#8b7632]/10 to-[#c3e956]/10 rounded-xl p-4 text-center border border-[#8b7632]/20">
                  <div className="text-2xl font-bold text-[#8b7632]">
                    {results.filter(team => team.rank > 3).reduce((total, team) => total + team.participants.length, 0)}
                  </div>
                  <div className="text-sm text-[#8b7632]">مشارك عادي</div>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-4 text-center border border-purple-300">
                  <div className="text-2xl font-bold text-purple-700">{judgeApplications.length}</div>
                  <div className="text-sm text-purple-600">طلب محكم</div>
                  <div className="text-xs text-purple-500 mt-1">
                    ({judgeApplications.filter(j => j.status === 'approved').length} معتمد)
                  </div>
                </div>
                <div className="bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-xl p-4 text-center border border-cyan-300">
                  <div className="text-2xl font-bold text-cyan-700">{expertApplications.length}</div>
                  <div className="text-sm text-cyan-600">طلب خبير</div>
                  <div className="text-xs text-cyan-500 mt-1">
                    ({expertApplications.filter(e => e.status === 'approved').length} معتمد)
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Teams List for Preview */}
        {selectedHackathon && results.length > 0 && !showEmailResults && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl">
              <h2 className="text-2xl font-bold text-[#01645e] mb-6 text-center">
                الفرق المشاركة - اضغط على أي مشارك للمعاينة
              </h2>

              <div className="space-y-4">
                {results.slice(0, 10).map((team) => (
                  <div key={team.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getRankIcon(team.rank)}
                        <div>
                          <h3 className="font-bold text-[#01645e]">{team.name}</h3>
                          <p className="text-sm text-[#8b7632]">فريق رقم {team.teamNumber} - النتيجة: {team.totalScore.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {team.participants.map((participant, idx) => (
                        <div
                          key={participant.id ?? participant.user?.email ?? participant.user?.name ?? String(idx)}
                          className="bg-white border border-[#01645e]/20 rounded-lg p-3 flex items-center gap-2"
                        >
                          <button
                            onClick={() => previewCertificateAndEmail(participant, team)}
                            className="flex-1 hover:bg-[#01645e]/5 transition-all duration-300 text-left flex items-center gap-2 rounded"
                          >
                            <Eye className="w-4 h-4 text-[#01645e]" />
                            <div>
                              <p className="font-medium text-[#01645e]">{participant.user.name}</p>
                              <p className="text-xs text-[#8b7632]">{participant.teamRole}</p>
                            </div>
                          </button>
                          <button
                            onClick={() => sendIndividualCertificate('participant', participant.id, participant.user.name)}
                            className="bg-[#01645e] hover:bg-[#3ab666] text-white px-2 py-1.5 rounded text-xs flex items-center gap-1 transition-colors flex-shrink-0"
                            title="إرسال شهادة"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Judges Section */}
              {judgeApplications.length > 0 && (
                <div className="mt-8 pt-8 border-t-2 border-purple-200">
                  <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    المحكمون - اضغط على أي محكم للمعاينة
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {judgeApplications.map((judge, index) => {
                      const statusColors = {
                        approved: 'border-green-300 bg-gradient-to-br from-green-50 to-green-100',
                        pending: 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100',
                        rejected: 'border-red-300 bg-gradient-to-br from-red-50 to-red-100'
                      }
                      const statusLabels = {
                        approved: 'معتمد ✓',
                        pending: 'معلق ⏳',
                        rejected: 'مرفوض ✗'
                      }
                      return (
                        <div
                          key={judge.id}
                          className={`border-2 rounded-xl p-4 ${statusColors[judge.status as keyof typeof statusColors] || statusColors.pending}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                              {index + 1}
                            </div>
                            <button
                              onClick={() => previewJudgeExpertCertificateAndEmail(judge, 'judge')}
                              className="flex-1 min-w-0 text-left hover:bg-white/50 rounded-lg p-2 transition-colors"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Eye className="w-5 h-5 text-purple-600" />
                                <p className="font-bold text-purple-900 truncate">{judge.name}</p>
                              </div>
                              <p className="text-sm text-purple-700 truncate">{judge.email}</p>
                              <span className="text-xs font-semibold text-purple-600 mt-1 inline-block">
                                {statusLabels[judge.status as keyof typeof statusLabels] || judge.status}
                              </span>
                            </button>
                            {judge.status === 'approved' && (
                              <button
                                onClick={() => sendIndividualCertificate('judge', judge.id, judge.name)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors flex-shrink-0 shadow-md hover:shadow-lg"
                                title="إرسال شهادة"
                              >
                                <Send className="w-4 h-4" />
                                إرسال
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Experts Section */}
              {expertApplications.length > 0 && (
                <div className="mt-8 pt-8 border-t-2 border-cyan-200">
                  <h3 className="text-xl font-bold text-cyan-800 mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    الخبراء - اضغط على أي خبير للمعاينة
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {expertApplications.map((expert, index) => {
                      const statusColors = {
                        approved: 'border-green-300 bg-gradient-to-br from-green-50 to-green-100',
                        pending: 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100',
                        rejected: 'border-red-300 bg-gradient-to-br from-red-50 to-red-100'
                      }
                      const statusLabels = {
                        approved: 'معتمد ✓',
                        pending: 'معلق ⏳',
                        rejected: 'مرفوض ✗'
                      }
                      return (
                        <div
                          key={expert.id}
                          className={`border-2 rounded-xl p-4 ${statusColors[expert.status as keyof typeof statusColors] || statusColors.pending}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-cyan-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                              {index + 1}
                            </div>
                            <button
                              onClick={() => previewJudgeExpertCertificateAndEmail(expert, 'expert')}
                              className="flex-1 min-w-0 text-left hover:bg-white/50 rounded-lg p-2 transition-colors"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Eye className="w-5 h-5 text-cyan-600" />
                                <p className="font-bold text-cyan-900 truncate">{expert.name}</p>
                              </div>
                              <p className="text-sm text-cyan-700 truncate">{expert.email}</p>
                              <span className="text-xs font-semibold text-cyan-600 mt-1 inline-block">
                                {statusLabels[expert.status as keyof typeof statusLabels] || expert.status}
                              </span>
                            </button>
                            {expert.status === 'approved' && (
                              <button
                                onClick={() => sendIndividualCertificate('expert', expert.id, expert.name)}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors flex-shrink-0 shadow-md hover:shadow-lg"
                                title="إرسال شهادة"
                              >
                                <Send className="w-4 h-4" />
                                إرسال
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}



        {/* Email Results */}
        {showEmailResults && emailResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-[#01645e]/20 shadow-xl">
              <h3 className="text-xl font-bold text-[#01645e] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                نتائج إرسال الإيميلات
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {emailResults.filter(r => r.status === 'success').length}
                  </div>
                  <div className="text-sm text-green-600">تم الإرسال بنجاح</div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">
                    {emailResults.filter(r => r.status === 'failed').length}
                  </div>
                  <div className="text-sm text-red-600">فشل في الإرسال</div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <Mail className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {emailResults.length}
                  </div>
                  <div className="text-sm text-blue-600">إجمالي المحاولات</div>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {emailResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        result.status === 'success'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {result.status === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{result.name}</div>
                          <div className="text-sm text-gray-600">{result.email}</div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium">{result.team}</div>
                        <div className="text-xs text-gray-500">المركز #{result.rank}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {selectedHackathon && results.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 border border-[#01645e]/20 shadow-xl">
              <FileText className="w-16 h-16 text-[#8b7632] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#01645e] mb-2">لا توجد نتائج متاحة</h3>
              <p className="text-[#8b7632]">لم يتم العثور على نتائج لهذا الهاكاثون بعد</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Email Preview Modal */}
      {showEmailPreview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl relative">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#01645e] to-[#3ab666] p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">📧 معاينة وتخصيص الإيميل</h2>
                  <p className="text-white/80 mt-1">
                    المستلم: {currentRecipient?.name} ({currentRecipient?.type === 'participant' ? 'مشارك' : currentRecipient?.type === 'judge' ? 'محكم' : 'خبير'})
                  </p>
                </div>
                <button
                  onClick={() => setShowEmailPreview(false)}
                  className="text-white/80 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Subject */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📝 موضوع الإيميل
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01645e] focus:border-[#01645e] text-lg"
                  placeholder="أدخل موضوع الإيميل..."
                />
              </div>

              {/* Content */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  ✍️ محتوى الإيميل (HTML)
                </label>
                <textarea
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01645e] focus:border-[#01645e] font-mono text-sm"
                  placeholder="أدخل محتوى الإيميل بصيغة HTML..."
                />
              </div>

              {/* Preview */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  👁️ معاينة الإيميل
                </label>
                <div
                  className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: emailContent }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-6 border-t flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowEmailPreview(false)}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-bold transition-all"
                >
                  ❌ إلغاء
                </button>
                <button
                  onClick={() => {
                    const template = getEmailTemplate(currentRecipient?.type, currentRecipient?.name, selectedHackathon?.title || '')
                    setEmailSubject(template.subject)
                    setEmailContent(template.content)
                  }}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-all"
                >
                  🔄 استعادة القالب الافتراضي
                </button>
              </div>
              <button
                onClick={sendCertificateWithCustomEmail}
                disabled={sendingCertificate || !emailSubject.trim() || !emailContent.trim()}
                className="px-8 py-3 bg-gradient-to-r from-[#01645e] to-[#3ab666] hover:from-[#01645e]/90 hover:to-[#3ab666]/90 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingCertificate ? '📤 جاري الإرسال...' : '📧 إرسال الشهادة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
