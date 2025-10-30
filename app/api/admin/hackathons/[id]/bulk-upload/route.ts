import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

// POST /api/admin/hackathons/[id]/bulk-upload - Upload participants data from Excel/CSV
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params

    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Validate hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { 
        id: true, 
        title: true,
        customFields: true
      }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'ملف البيانات مطلوب' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'نوع الملف غير مدعوم. يرجى رفع ملف Excel (.xlsx, .xls) أو CSV' 
      }, { status: 400 })
    }

    // Read file content
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'الملف فارغ أو لا يحتوي على بيانات صحيحة' }, { status: 400 })
    }

    // Get custom fields for validation
    const customFields = hackathon.customFields ? 
      (hackathon.customFields as any).fields || [] : []

    // Required fields mapping
    const requiredFieldsMap = {
      'name': ['name', 'الاسم', 'اسم', 'Name', 'الاسم الكامل'],
      'email': ['email', 'البريد الإلكتروني', 'ايميل', 'Email', 'بريد'],
      'phone': ['phone', 'رقم الهاتف', 'هاتف', 'Phone', 'جوال'],
      'city': ['city', 'المدينة', 'مدينة', 'City'],
      'nationality': ['nationality', 'الجنسية', 'جنسية', 'Nationality'],
      'preferredRole': ['preferredRole', 'التخصص', 'تخصص', 'Role', 'المجال']
    }

    // Process and validate data
    const processedData = []
    const errors = []
    const duplicateEmails = new Set()

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any
      const rowNumber = i + 2 // Excel row number (starting from 2, assuming header in row 1)

      try {
        // Extract required fields with flexible column name matching
        const participantData: any = {}

        for (const [fieldKey, possibleNames] of Object.entries(requiredFieldsMap)) {
          let value = null
          
          // Try to find the field value using different possible column names
          for (const possibleName of possibleNames) {
            if (row[possibleName] !== undefined && row[possibleName] !== null && row[possibleName] !== '') {
              value = String(row[possibleName]).trim()
              break
            }
          }

          if (!value) {
            errors.push(`الصف ${rowNumber}: الحقل "${fieldKey}" مطلوب`)
            continue
          }

          participantData[fieldKey] = value
        }

        // Validate email format
        if (participantData.email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(participantData.email)) {
            errors.push(`الصف ${rowNumber}: البريد الإلكتروني غير صحيح`)
            continue
          }

          // Check for duplicate emails in the file
          if (duplicateEmails.has(participantData.email)) {
            errors.push(`الصف ${rowNumber}: البريد الإلكتروني مكرر في الملف`)
            continue
          }
          duplicateEmails.add(participantData.email)
        }

        // Validate phone number
        if (participantData.phone) {
          const phoneRegex = /^[\d\s\-\+\(\)]+$/
          if (!phoneRegex.test(participantData.phone)) {
            errors.push(`الصف ${rowNumber}: رقم الهاتف غير صحيح`)
            continue
          }
        }

        // Add any additional custom fields
        for (const customField of customFields) {
          if (!requiredFieldsMap[customField.id as keyof typeof requiredFieldsMap]) {
            const fieldValue = row[customField.label] || row[customField.id]
            if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
              participantData[customField.id] = String(fieldValue).trim()
            }
          }
        }

        processedData.push({
          ...participantData,
          rowNumber
        })

      } catch (error) {
        errors.push(`الصف ${rowNumber}: خطأ في معالجة البيانات - ${error}`)
      }
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return NextResponse.json({
        error: 'توجد أخطاء في البيانات',
        errors: errors.slice(0, 10), // Limit to first 10 errors
        totalErrors: errors.length,
        processedRows: processedData.length,
        totalRows: data.length
      }, { status: 400 })
    }

    // Check for existing participants with same emails
    const existingEmails = await prisma.user.findMany({
      where: {
        email: { in: processedData.map(p => p.email) }
      },
      select: { email: true }
    })

    const existingEmailSet = new Set(existingEmails.map(u => u.email))
    const newParticipants = processedData.filter(p => !existingEmailSet.has(p.email))
    const existingParticipants = processedData.filter(p => existingEmailSet.has(p.email))

    // Create new users and participants
    const createdParticipants = []
    const creationErrors = []

    for (const participantData of newParticipants) {
      try {
        // Create user
        const user = await prisma.user.create({
          data: {
            name: participantData.name,
            email: participantData.email,
            phone: participantData.phone,
            city: participantData.city,
            nationality: participantData.nationality,
            preferredRole: participantData.preferredRole,
            role: 'participant',
            password: 'temp_password_' + Date.now(), // Temporary password
            isActive: true
          }
        })

        // Create participant
        const participant = await prisma.participant.create({
          data: {
            userId: user.id,
            hackathonId: hackathonId,
            status: 'approved', // Auto-approve bulk uploaded participants
            registrationData: participantData
          }
        })

        createdParticipants.push({
          name: user.name,
          email: user.email,
          participantId: participant.id
        })

      } catch (error) {
        console.error('Error creating participant:', error)
        creationErrors.push(`خطأ في إنشاء المشارك ${participantData.name}: ${error}`)
      }
    }

    console.log(`✅ Bulk upload completed for hackathon ${hackathonId}:`)
    console.log(`- Total rows processed: ${data.length}`)
    console.log(`- New participants created: ${createdParticipants.length}`)
    console.log(`- Existing participants skipped: ${existingParticipants.length}`)
    console.log(`- Creation errors: ${creationErrors.length}`)

    return NextResponse.json({
      message: 'تم رفع البيانات بنجاح',
      summary: {
        totalRows: data.length,
        newParticipants: createdParticipants.length,
        existingParticipants: existingParticipants.length,
        creationErrors: creationErrors.length
      },
      createdParticipants,
      existingParticipants: existingParticipants.map(p => ({ name: p.name, email: p.email })),
      creationErrors: creationErrors.slice(0, 5) // Limit error details
    })

  } catch (error) {
    console.error('Error in bulk upload:', error)
    return NextResponse.json({ error: 'خطأ في رفع البيانات المجمعة' }, { status: 500 })
  }
}

// GET /api/admin/hackathons/[id]/bulk-upload/template - Download Excel template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params

    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Get hackathon with custom fields
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { 
        id: true, 
        title: true,
        customFields: true
      }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Get custom fields
    const customFields = hackathon.customFields ? 
      (hackathon.customFields as any).fields || [] : []

    // Create template headers
    const headers = [
      'الاسم الكامل',
      'البريد الإلكتروني', 
      'رقم الهاتف',
      'المدينة',
      'الجنسية',
      'التخصص المفضل'
    ]

    // Add custom field headers
    for (const field of customFields) {
      if (!['name', 'email', 'phone', 'city', 'nationality', 'preferredRole'].includes(field.id)) {
        headers.push(field.label)
      }
    }

    // Create sample data
    const sampleData = [
      [
        'أحمد محمد علي',
        'ahmed@example.com',
        '+966501234567',
        'الرياض',
        'سعودي',
        'مطور واجهات أمامية'
      ]
    ]

    // Create workbook
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData])
    
    // Set column widths
    worksheet['!cols'] = headers.map(() => ({ width: 20 }))
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المشاركين')

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="template_${hackathon.title.replace(/\s+/g, '_')}.xlsx"`
      }
    })

  } catch (error) {
    console.error('Error generating template:', error)
    return NextResponse.json({ error: 'خطأ في إنشاء القالب' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
