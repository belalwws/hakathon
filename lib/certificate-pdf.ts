import { createCanvas, loadImage, registerFont } from 'canvas'
import { DEFAULT_CERTIFICATE_CONFIG } from './certificate-config'
import fs from 'fs'
import path from 'path'
import { prisma } from './prisma'

// Register Arabic fonts for server-side canvas
try {
  // Try to register system Arabic fonts
  const possibleFontPaths = [
    // Windows fonts
    'C:\\Windows\\Fonts\\arial.ttf',
    'C:\\Windows\\Fonts\\tahoma.ttf',
    'C:\\Windows\\Fonts\\times.ttf',
    // Linux fonts
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    // macOS fonts
    '/System/Library/Fonts/Supplemental/Arial.ttf',
    '/Library/Fonts/Arial.ttf'
  ]

  let fontRegistered = false
  for (const fontPath of possibleFontPaths) {
    if (fs.existsSync(fontPath)) {
      try {
        registerFont(fontPath, { family: 'Arial' })
        console.log('✅ Registered font:', fontPath)
        fontRegistered = true
        break
      } catch (err) {
        console.log('⚠️ Could not register font:', fontPath)
      }
    }
  }

  if (!fontRegistered) {
    console.log('⚠️ No system fonts found, using default canvas fonts')
  }
} catch (error) {
  console.log('⚠️ Font registration failed, using default fonts:', error)
}

export interface CertificateData {
  participantName: string
  hackathonTitle: string
  teamName: string
  rank: number
  isWinner: boolean
  totalScore?: number
  date?: string
}

export async function generateCertificatePDF(data: CertificateData, hackathonId?: string): Promise<Buffer> {
  try {
    console.log('🎨 Generating certificate PDF for:', data.participantName)

    // تحميل إعدادات الشهادة
    let settings = DEFAULT_CERTIFICATE_CONFIG
    let certificateImagePath = path.join(process.cwd(), 'public', 'row-certificat.png')
    let certificateImageUrl: string | null = null

    try {
      // محاولة تحميل الإعدادات من قاعدة البيانات أولاً
      if (hackathonId) {
        try {
          // جرب قراءة القالب مباشرة من قاعدة البيانات أولاً
          const hackathon = await prisma.hackathon.findUnique({
            where: { id: hackathonId },
            select: { certificateTemplate: true }
          })

          if (hackathon?.certificateTemplate) {
            // تحقق إذا كان URL خارجي (Cloudinary/S3)
            if (hackathon.certificateTemplate.startsWith('http://') || hackathon.certificateTemplate.startsWith('https://')) {
              certificateImageUrl = hackathon.certificateTemplate
              console.log('✅ Using certificate template from URL:', certificateImageUrl)
            } else {
              // محاولة تحميل من الملف المحلي
              let templatePath = path.join(process.cwd(), 'public', hackathon.certificateTemplate.replace('/certificates/', ''))
              if (!fs.existsSync(templatePath)) {
                templatePath = path.join(process.cwd(), 'public', hackathon.certificateTemplate.replace('/', ''))
              }
              if (fs.existsSync(templatePath)) {
                certificateImagePath = templatePath
                console.log('✅ Using certificate template from hackathon table:', certificateImagePath)
              }
            }
          }
          
          // ثم جرب تحميل الإعدادات من API
          const settingsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/hackathons/${hackathonId}/certificate-settings`, {
            cache: 'no-store'
          })
          if (settingsResponse.ok) {
            const dbSettings = await settingsResponse.json()
            settings = {
              ...DEFAULT_CERTIFICATE_CONFIG,
              ...dbSettings
            }
            
            // إذا كان هناك قالب مرفوع في الإعدادات ولم نجد واحداً من جدول الهاكاثون، استخدمه
            if (dbSettings.certificateTemplate && certificateImagePath === path.join(process.cwd(), 'public', 'row-certificat.png')) {
              let templatePath = path.join(process.cwd(), 'public', dbSettings.certificateTemplate.replace('/certificates/', ''))
              if (!fs.existsSync(templatePath)) {
                templatePath = path.join(process.cwd(), 'public', dbSettings.certificateTemplate.replace('/', ''))
              }
              if (fs.existsSync(templatePath)) {
                certificateImagePath = templatePath
                console.log('✅ Using uploaded certificate template from settings:', certificateImagePath)
              } else {
                console.log('⚠️ Certificate template not found:', templatePath)
              }
            }
          }
        } catch (dbError) {
          console.log('⚠️ Could not load settings from database, using file system')
        }
      }
      
      // إذا لم تنجح محاولة قاعدة البيانات، جرب ملف النظام
      if (certificateImagePath === path.join(process.cwd(), 'public', 'row-certificat.png')) {
        const settingsPath = path.join(process.cwd(), 'certificate-settings.json')
        if (fs.existsSync(settingsPath)) {
          const savedSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
          settings = {
            ...DEFAULT_CERTIFICATE_CONFIG,
            ...savedSettings
          }
          
          // تحقق من وجود قالب مرفوع في الإعدادات
          if (savedSettings.certificateTemplate) {
            let templatePath = path.join(process.cwd(), 'public', savedSettings.certificateTemplate.replace('/certificates/', ''))
            if (!fs.existsSync(templatePath)) {
              // جرب المسار النسبي
              templatePath = path.join(process.cwd(), 'public', savedSettings.certificateTemplate.replace('/', ''))
            }
            if (fs.existsSync(templatePath)) {
              certificateImagePath = templatePath
              console.log('✅ Using certificate template from settings:', certificateImagePath)
            } else {
              console.log('⚠️ Certificate template not found:', templatePath)
            }
          }
        }
      }
    } catch (error) {
      console.log('Using default certificate settings')
    }

    // تحميل الصورة من URL أو من الملف المحلي
    console.log('🖼️ Loading certificate image from:', certificateImageUrl || certificateImagePath)
    const image = await loadImage(certificateImageUrl || certificateImagePath)

    // إنشاء canvas بحجم الصورة
    const canvas = createCanvas(image.width, image.height)
    const ctx = canvas.getContext('2d')

    // رسم صورة الشهادة الأساسية
    ctx.drawImage(image, 0, 0)

    // إعداد النص
    ctx.textAlign = 'center'
    ctx.fillStyle = settings.nameColor || '#000000'
    ctx.font = settings.nameFont || '48px Arial'

    // حساب موقع النص
    const nameX = canvas.width * (settings.namePositionX || 0.5)
    const nameY = canvas.height * (settings.namePositionY || 0.5)

    // رسم اسم المشارك
    ctx.fillText(data.participantName, nameX, nameY)

    // تحويل Canvas إلى Buffer
    const buffer = canvas.toBuffer('image/png')
    
    console.log('✅ Certificate PDF generated successfully')
    return buffer

  } catch (error) {
    console.error('❌ Error generating certificate PDF:', error)
    throw new Error('فشل في إنشاء شهادة PDF')
  }
}

export async function generateCertificateImage(data: CertificateData, hackathonId?: string, certificateType: string = 'participant'): Promise<Buffer> {
  try {
    console.log('🖼️ Generating certificate image for:', data.participantName, 'Type:', certificateType)

    // تحميل إعدادات الشهادة
    let settings = DEFAULT_CERTIFICATE_CONFIG
    let certificateImagePath = path.join(process.cwd(), 'public', 'row-certificat.png')
    let certificateImageUrl: string | null = null

    try {
      // محاولة تحميل الإعدادات من قاعدة البيانات أولاً - أولوية للإعدادات حسب النوع
      if (hackathonId) {
        try {
          // أولاً: قراءة الإعدادات مباشرة من قاعدة البيانات (أولوية قصوى)
          console.log(`📡 Fetching settings for hackathon ${hackathonId}, type: ${certificateType}`)

          const settingsKey = `certificate_settings_${hackathonId}_${certificateType}`
          const settingsRecord = await prisma.globalSettings.findUnique({
            where: { key: settingsKey }
          })

          let foundInSettings = false
          if (settingsRecord && settingsRecord.value) {
            const dbSettings = settingsRecord.value as any
            console.log('📦 Received settings from database:', JSON.stringify(dbSettings, null, 2))
            settings = {
              ...DEFAULT_CERTIFICATE_CONFIG,
              namePositionY: dbSettings.namePositionY || DEFAULT_CERTIFICATE_CONFIG.namePositionY,
              namePositionX: dbSettings.namePositionX || DEFAULT_CERTIFICATE_CONFIG.namePositionX,
              nameFont: dbSettings.nameFont || DEFAULT_CERTIFICATE_CONFIG.nameFont,
              nameColor: dbSettings.nameColor || DEFAULT_CERTIFICATE_CONFIG.nameColor
            }
            console.log('✅ Applied settings:', {
              namePositionY: settings.namePositionY,
              namePositionX: settings.namePositionX,
              nameFont: settings.nameFont,
              nameColor: settings.nameColor
            })

            // إذا كان هناك قالب مرفوع في الإعدادات، استخدمه دائماً (أولوية قصوى)
            if (dbSettings.certificateTemplate) {
              console.log('🔍 Found certificateTemplate in settings:', dbSettings.certificateTemplate)
              foundInSettings = true
              // تحقق إذا كان URL خارجي (Cloudinary)
              if (dbSettings.certificateTemplate.startsWith('http://') || dbSettings.certificateTemplate.startsWith('https://')) {
                certificateImageUrl = dbSettings.certificateTemplate
                certificateImagePath = '' // Clear local path
                console.log('✅ Using certificate template URL from settings:', certificateImageUrl)
              } else {
                let templatePath = path.join(process.cwd(), 'public', dbSettings.certificateTemplate.replace('/certificates/', ''))
                if (!fs.existsSync(templatePath)) {
                  templatePath = path.join(process.cwd(), 'public', dbSettings.certificateTemplate.replace('/', ''))
                }
                if (fs.existsSync(templatePath)) {
                  certificateImagePath = templatePath
                  console.log('✅ Using uploaded certificate template from settings:', certificateImagePath)
                } else {
                  console.log('⚠️ Certificate template not found:', templatePath)
                  foundInSettings = false
                }
              }
            } else {
              console.log('⚠️ No certificateTemplate found in settings')
            }
          } else {
            console.log('⚠️ No settings found in database for key:', settingsKey)
          }

          // ثانياً: إذا لم نجد في الإعدادات، جرب قراءة القالب من جدول الهاكاثون (fallback)
          if (!foundInSettings) {
            console.log('🔄 Falling back to hackathon.certificateTemplate')
            const hackathon = await prisma.hackathon.findUnique({
              where: { id: hackathonId },
              select: { certificateTemplate: true }
            })

            if (hackathon?.certificateTemplate) {
              // تحقق إذا كان URL خارجي (Cloudinary/S3)
              if (hackathon.certificateTemplate.startsWith('http://') || hackathon.certificateTemplate.startsWith('https://')) {
                certificateImageUrl = hackathon.certificateTemplate
                console.log('✅ Using certificate template from hackathon URL:', certificateImageUrl)
              } else {
                // محاولة تحميل من الملف المحلي
                let templatePath = path.join(process.cwd(), 'public', hackathon.certificateTemplate.replace('/certificates/', ''))
                if (!fs.existsSync(templatePath)) {
                  templatePath = path.join(process.cwd(), 'public', hackathon.certificateTemplate.replace('/', ''))
                }
                if (fs.existsSync(templatePath)) {
                  certificateImagePath = templatePath
                  console.log('✅ Using certificate template from hackathon table:', certificateImagePath)
                } else {
                  console.log('⚠️ Hackathon certificate template not found, using default')
                }
              }
            } else {
              console.log('⚠️ No certificate template in hackathon table, using default')
            }
          }
        } catch (dbError) {
          console.log('⚠️ Could not load settings from database, using file system:', dbError)
        }
      }
      
      // إذا لم تنجح محاولة قاعدة البيانات، جرب ملف النظام
      if (certificateImagePath === path.join(process.cwd(), 'public', 'row-certificat.png')) {
        const settingsPath = path.join(process.cwd(), 'certificate-settings.json')
        if (fs.existsSync(settingsPath)) {
          const savedSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
          settings = {
            ...DEFAULT_CERTIFICATE_CONFIG,
            ...savedSettings
          }
          
          // تحقق من وجود قالب مرفوع في الإعدادات
          if (savedSettings.certificateTemplate) {
            let templatePath = path.join(process.cwd(), 'public', savedSettings.certificateTemplate.replace('/certificates/', ''))
            if (!fs.existsSync(templatePath)) {
              // جرب المسار النسبي
              templatePath = path.join(process.cwd(), 'public', savedSettings.certificateTemplate.replace('/', ''))
            }
            if (fs.existsSync(templatePath)) {
              certificateImagePath = templatePath
              console.log('✅ Using certificate template from settings:', certificateImagePath)
            } else {
              console.log('⚠️ Certificate template not found:', templatePath)
            }
          }
        }
      }
    } catch (error) {
      console.log('Using default certificate settings')
    }

    // تحميل الصورة من URL أو من الملف المحلي
    console.log('🖼️ Loading certificate image from:', certificateImageUrl || certificateImagePath)
    const image = await loadImage(certificateImageUrl || certificateImagePath)

    // إنشاء canvas بحجم الصورة
    const canvas = createCanvas(image.width, image.height)
    const ctx = canvas.getContext('2d')

    // رسم صورة الشهادة الأساسية
    ctx.drawImage(image, 0, 0)

    // إعداد النص
    ctx.textAlign = 'center'
    ctx.fillStyle = settings.nameColor || '#000000'
    ctx.font = settings.nameFont || '48px Arial'

    // حساب موقع النص
    const nameX = canvas.width * (settings.namePositionX || 0.5)
    const nameY = canvas.height * (settings.namePositionY || 0.5)

    console.log('🎨 Drawing certificate with settings:', {
      participantName: data.participantName,
      nameFont: settings.nameFont,
      nameColor: settings.nameColor,
      namePositionX: settings.namePositionX,
      namePositionY: settings.namePositionY,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      nameX,
      nameY
    })

    // رسم اسم المشارك
    console.log('✍️ Drawing text:', {
      text: data.participantName,
      x: nameX,
      y: nameY,
      font: ctx.font,
      fillStyle: ctx.fillStyle,
      textAlign: ctx.textAlign
    })

    ctx.fillText(data.participantName, nameX, nameY)

    console.log('✅ Text drawn successfully')

    // تحويل Canvas إلى Buffer
    const buffer = canvas.toBuffer('image/png')
    
    console.log('✅ Certificate image generated successfully')
    return buffer

  } catch (error) {
    console.error('❌ Error generating certificate image:', error)
    throw new Error('فشل في إنشاء صورة الشهادة')
  }
}
