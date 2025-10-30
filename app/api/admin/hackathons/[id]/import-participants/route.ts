import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔄 Participants import started...')

    const params = await context.params
    const { id: hackathonId } = params

    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      console.log('❌ No auth token provided')
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      console.log('❌ Invalid token or not admin')
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Check if hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('participantsFile') as File

    if (!file) {
      console.log('❌ No file provided')
      return NextResponse.json({ error: 'ملف المشاركين مطلوب' }, { status: 400 })
    }

    console.log('📁 File received:', file.name, 'Size:', file.size, 'Type:', file.type)

    // Validate file type (Excel files only)
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ]
    
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Invalid file type:', file.type)
      return NextResponse.json({
        error: 'نوع الملف غير مدعوم. يجب أن يكون ملف Excel (.xlsx, .xls) أو CSV'
      }, { status: 400 })
    }

    // Read file content
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let workbook: XLSX.WorkBook
    try {
      workbook = XLSX.read(buffer, { type: 'buffer' })
    } catch (error) {
      console.error('❌ Error reading Excel file:', error)
      return NextResponse.json({
        error: 'خطأ في قراءة ملف Excel. تأكد من صحة الملف'
      }, { status: 400 })
    }

    // Get first worksheet
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
    
    if (jsonData.length < 2) {
      return NextResponse.json({
        error: 'الملف فارغ أو لا يحتوي على بيانات كافية'
      }, { status: 400 })
    }

    // Expected columns: Name, Email, Phone, University, Major, Year, City, Nationality, Skills, Experience, PreferredRole, Bio, Github, Linkedin, Portfolio, WorkExperience
    const headers = jsonData[0] as string[]
    const rows = jsonData.slice(1)

    console.log('📊 Headers found:', headers)
    console.log('📊 Rows count:', rows.length)

    // Validate required columns
    const requiredColumns = ['name', 'email']
    const headerMap: { [key: string]: number } = {}

    headers.forEach((header, index) => {
      const normalizedHeader = header.toString().toLowerCase().trim()
      if (normalizedHeader.includes('name') || normalizedHeader.includes('اسم')) {
        headerMap.name = index
      } else if (normalizedHeader.includes('email') || normalizedHeader.includes('ايميل') || normalizedHeader.includes('بريد')) {
        headerMap.email = index
      } else if (normalizedHeader.includes('phone') || normalizedHeader.includes('هاتف') || normalizedHeader.includes('جوال')) {
        headerMap.phone = index
      } else if (normalizedHeader.includes('university') || normalizedHeader.includes('جامعة')) {
        headerMap.university = index
      } else if (normalizedHeader.includes('major') || normalizedHeader.includes('تخصص')) {
        headerMap.major = index
      } else if (normalizedHeader.includes('year') || normalizedHeader.includes('سنة')) {
        headerMap.year = index
      } else if (normalizedHeader.includes('city') || normalizedHeader.includes('مدينة')) {
        headerMap.city = index
      } else if (normalizedHeader.includes('nationality') || normalizedHeader.includes('جنسية')) {
        headerMap.nationality = index
      } else if (normalizedHeader.includes('skills') || normalizedHeader.includes('مهارات')) {
        headerMap.skills = index
      } else if (normalizedHeader.includes('experience') || normalizedHeader.includes('خبرة')) {
        headerMap.experience = index
      } else if (normalizedHeader.includes('preferredrole') || normalizedHeader.includes('دور') || normalizedHeader.includes('role')) {
        headerMap.preferredRole = index
      } else if (normalizedHeader.includes('bio') || normalizedHeader.includes('نبذة')) {
        headerMap.bio = index
      } else if (normalizedHeader.includes('github')) {
        headerMap.github = index
      } else if (normalizedHeader.includes('linkedin')) {
        headerMap.linkedin = index
      } else if (normalizedHeader.includes('portfolio') || normalizedHeader.includes('معرض')) {
        headerMap.portfolio = index
      } else if (normalizedHeader.includes('workexperience') || normalizedHeader.includes('خبرة عمل')) {
        headerMap.workExperience = index
      }
    })

    if (headerMap.name === undefined || headerMap.email === undefined) {
      return NextResponse.json({
        error: 'الملف يجب أن يحتوي على عمودي الاسم والإيميل على الأقل'
      }, { status: 400 })
    }

    // Process participants
    const participants = []
    const errors = []
    const existingEmails = new Set()

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNumber = i + 2 // +2 because we start from row 2 in Excel

      try {
        const name = row[headerMap.name]?.toString().trim()
        const email = row[headerMap.email]?.toString().trim().toLowerCase()
        
        if (!name || !email) {
          errors.push(`الصف ${rowNumber}: الاسم والإيميل مطلوبان`)
          continue
        }

        // Check for duplicate emails in the file
        if (existingEmails.has(email)) {
          errors.push(`الصف ${rowNumber}: الإيميل ${email} مكرر في الملف`)
          continue
        }
        existingEmails.add(email)

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email }
        })

        let userId = existingUser?.id

        // Create user if doesn't exist
        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              name,
              email,
              phone: row[headerMap.phone]?.toString().trim() || null,
              university: row[headerMap.university]?.toString().trim() || null,
              major: row[headerMap.major]?.toString().trim() || null,
              graduationYear: row[headerMap.year]?.toString().trim() || null,
              city: row[headerMap.city]?.toString().trim() || null,
              nationality: row[headerMap.nationality]?.toString().trim() || null,
              skills: row[headerMap.skills]?.toString().trim() || null,
              experience: row[headerMap.experience]?.toString().trim() || null,
              preferredRole: row[headerMap.preferredRole]?.toString().trim() || null,
              bio: row[headerMap.bio]?.toString().trim() || null,
              github: row[headerMap.github]?.toString().trim() || null,
              linkedin: row[headerMap.linkedin]?.toString().trim() || null,
              portfolio: row[headerMap.portfolio]?.toString().trim() || null,
              workExperience: row[headerMap.workExperience]?.toString().trim() || null,
              role: 'participant',
              password: 'temp123', // Temporary password - user should reset
              emailVerified: false
            }
          })
          userId = newUser.id
        }

        // Check if already registered for this hackathon
        const existingParticipant = await prisma.participant.findFirst({
          where: {
            userId,
            hackathonId
          }
        })

        if (!existingParticipant) {
          // Create participant with 'approved' status
          await prisma.participant.create({
            data: {
              userId,
              hackathonId,
              status: 'approved', // Auto-approve bulk imported participants
              registeredAt: new Date(),
              approvedAt: new Date()
            }
          })
        }

        participants.push({
          name,
          email,
          status: existingUser ? 'existing_user' : 'new_user',
          registration: existingParticipant ? 'already_registered' : 'registered'
        })

      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error)
        errors.push(`الصف ${rowNumber}: خطأ في المعالجة - ${error}`)
      }
    }

    console.log(`✅ Processed ${participants.length} participants`)
    console.log(`⚠️ Found ${errors.length} errors`)

    return NextResponse.json({
      success: true,
      message: `تم استيراد ${participants.length} مشارك بنجاح`,
      summary: {
        total: rows.length,
        processed: participants.length,
        errors: errors.length
      },
      participants,
      errors: errors.slice(0, 10) // Return first 10 errors only
    })

  } catch (error: any) {
    console.error('❌ Error importing participants:', error)
    return NextResponse.json({
      error: 'خطأ في استيراد المشاركين: ' + (error.message || 'خطأ غير معروف')
    }, { status: 500 })
  }
}
