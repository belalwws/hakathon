import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// POST /api/admin/import-excel - Import participants from Excel
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const hackathonId = formData.get('hackathonId') as string

    if (!file || !hackathonId) {
      return NextResponse.json(
        { error: 'الملف والهاكاثون مطلوبان' },
        { status: 400 }
      )
    }

    console.log('📊 Importing participants from file:', file.name)

    // Read file content
    const text = await file.text()
    
    // Parse CSV/Excel (simple CSV parsing)
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim().replace(/\ufeff/g, ''))
    
    console.log('📋 Headers:', headers)

    const results = {
      totalRows: lines.length - 1,
      successCount: 0,
      errorCount: 0,
      errors: [] as any[]
    }

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim())
        
        // Map values to fields (flexible mapping)
        const nameIndex = headers.findIndex(h => 
          h.includes('اسم') || h.toLowerCase().includes('name')
        )
        const emailIndex = headers.findIndex(h => 
          h.includes('بريد') || h.includes('ايميل') || h.toLowerCase().includes('email')
        )
        const phoneIndex = headers.findIndex(h => 
          h.includes('جوال') || h.includes('هاتف') || h.toLowerCase().includes('phone')
        )
        const orgIndex = headers.findIndex(h => 
          h.includes('مؤسسة') || h.includes('جامعة') || h.toLowerCase().includes('organization')
        )
        const roleIndex = headers.findIndex(h => 
          h.includes('دور') || h.toLowerCase().includes('role')
        )

        const name = nameIndex >= 0 ? values[nameIndex] : null
        const email = emailIndex >= 0 ? values[emailIndex] : null
        const phone = phoneIndex >= 0 ? values[phoneIndex] : null
        const organization = orgIndex >= 0 ? values[orgIndex] : null
        const preferredRole = roleIndex >= 0 ? values[roleIndex] : null

        // Validate required fields
        if (!name || !email) {
          results.errors.push({
            row: i + 1,
            error: 'الاسم والبريد الإلكتروني مطلوبان'
          })
          results.errorCount++
          continue
        }

        // Validate email format
        if (!email.includes('@')) {
          results.errors.push({
            row: i + 1,
            error: 'البريد الإلكتروني غير صحيح'
          })
          results.errorCount++
          continue
        }

        // Check if user exists
        let user = await prisma.user.findUnique({
          where: { email }
        })

        // Create user if doesn't exist
        if (!user) {
          const hashedPassword = await bcrypt.hash('imported-user-' + Date.now(), 10)
          
          user = await prisma.user.create({
            data: {
              name,
              email,
              password: hashedPassword,
              role: 'participant',
              phone: phone || null,
              organization: organization || null,
              preferredRole: preferredRole || null
            }
          })
        }

        // Check if already registered
        const existingParticipant = await prisma.participant.findFirst({
          where: {
            userId: user.id,
            hackathonId: hackathonId
          }
        })

        if (existingParticipant) {
          results.errors.push({
            row: i + 1,
            error: `${email} مسجل مسبقاً في هذا الهاكاثون`
          })
          results.errorCount++
          continue
        }

        // Create participant
        await prisma.participant.create({
          data: {
            userId: user.id,
            hackathonId: hackathonId,
            status: 'approved', // Auto-approve imported participants
            registeredAt: new Date()
          }
        })

        results.successCount++
        console.log(`✅ Row ${i + 1}: ${name} (${email}) imported successfully`)

      } catch (error) {
        console.error(`❌ Error processing row ${i + 1}:`, error)
        results.errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : 'خطأ غير معروف'
        })
        results.errorCount++
      }
    }

    console.log('📊 Import completed:', results)

    return NextResponse.json(results)

  } catch (error) {
    console.error('❌ Import error:', error)
    return NextResponse.json(
      { error: 'فشل في استيراد الملف' },
      { status: 500 }
    )
  }
}

