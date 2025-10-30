import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !['admin', 'supervisor'].includes(payload.role)) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const hackathonId = formData.get('hackathonId') as string

    if (!file) {
      return NextResponse.json({ error: 'الملف مطلوب' }, { status: 400 })
    }

    if (!hackathonId) {
      return NextResponse.json({ error: 'معرف الهاكاثون مطلوب' }, { status: 400 })
    }

    // Check if hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // If supervisor, verify access
    if (payload.role === 'supervisor') {
      const supervisorAssignment = await prisma.supervisor.findFirst({
        where: {
          userId: payload.userId,
          hackathonId: hackathonId,
          isActive: true
        }
      })

      if (!supervisorAssignment) {
        return NextResponse.json({ error: 'غير مصرح بالوصول لهذا الهاكاثون' }, { status: 403 })
      }
    }

    // Read Excel file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet) as any[]

    if (data.length === 0) {
      return NextResponse.json({ error: 'الملف فارغ أو بتنسيق غير صحيح' }, { status: 400 })
    }

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const rowNumber = i + 2 // +2 because sheet is 1-indexed and row 1 is headers

      try {
        // Validate required fields
        if (!row.name || !row.email) {
          errors.push(`صف ${rowNumber}: الاسم والبريد الإلكتروني مطلوبان`)
          errorCount++
          continue
        }

        // Check if user exists
        let user = await prisma.user.findUnique({
          where: { email: row.email.toString().toLowerCase().trim() }
        })

        // Create user if doesn't exist
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: row.email.toString().toLowerCase().trim(),
              name: row.name.toString().trim(),
              phone: row.phone ? row.phone.toString().trim() : '',
              city: row.city ? row.city.toString().trim() : '',
              nationality: row.nationality ? row.nationality.toString().trim() : '',
              password: '', // No password - they'll need to set one later
              role: 'participant'
            }
          })
        } else {
          // Update basic user info if exists (only update if provided in Excel)
          const updateData: any = {
            name: row.name.toString().trim()
          }
          if (row.phone) updateData.phone = row.phone.toString().trim()
          if (row.city) updateData.city = row.city.toString().trim()
          if (row.nationality) updateData.nationality = row.nationality.toString().trim()
          
          user = await prisma.user.update({
            where: { id: user.id },
            data: updateData
          })
        }

        // Check if participant already exists for this hackathon
        const existingParticipant = await prisma.participant.findFirst({
          where: {
            userId: user.id,
            hackathonId: hackathonId
          }
        })

        if (existingParticipant) {
          errors.push(`صف ${rowNumber}: المشارك ${row.email} مسجل مسبقاً في هذا الهاكاثون`)
          errorCount++
          continue
        }

        // Prepare participant data with all fields from Excel
        const participantFormData: any = {}
        
        // Add all fields from the Excel row
        for (const [key, value] of Object.entries(row)) {
          if (value !== null && value !== undefined && value !== '') {
            participantFormData[key] = value.toString().trim()
          }
        }

        // Create participant with status = pending
        await prisma.participant.create({
          data: {
            userId: user.id,
            hackathonId: hackathonId,
            status: 'pending',
            additionalInfo: participantFormData
          }
        })

        successCount++

      } catch (rowError: any) {
        console.error(`Error processing row ${rowNumber}:`, rowError)
        errors.push(`صف ${rowNumber}: ${rowError.message}`)
        errorCount++
      }
    }

    return NextResponse.json({
      message: 'تم معالجة الملف بنجاح',
      count: successCount,
      total: data.length,
      errors: errorCount > 0 ? errors : undefined
    })

  } catch (error: any) {
    console.error('Error uploading participants:', error)
    return NextResponse.json(
      { error: error.message || 'خطأ في رفع الملف' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
