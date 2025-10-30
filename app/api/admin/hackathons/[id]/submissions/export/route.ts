import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()

// GET - Export submissions to Excel
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id: hackathonId } = params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const format = searchParams.get('format') || 'xlsx'

    console.log('📊 Exporting submissions for hackathon:', hackathonId)

    // Check if hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { title: true }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Build where clause
    const whereClause: any = { hackathonId }
    if (status && status !== 'all') {
      whereClause.status = status
    }

    // Get submissions
    const submissions = await prisma.participant.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        university: true,
        major: true,
        skills: true,
        portfolio: true,
        experience: true,
        motivation: true,
        teamPreference: true,
        dietaryRestrictions: true,
        emergencyContact: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        reviewedBy: true,
        reviewedAt: true,
        notes: true,
        customFields: true
      }
    })

    if (submissions.length === 0) {
      return NextResponse.json({ error: 'لا توجد طلبات للتصدير' }, { status: 404 })
    }

    // Prepare data for Excel
    const excelData = submissions.map((submission, index) => {
      const customFields = submission.customFields ? JSON.parse(submission.customFields) : {}
      
      return {
        '#': index + 1,
        'الاسم': submission.name || '',
        'البريد الإلكتروني': submission.email || '',
        'رقم الهاتف': submission.phone || '',
        'الجامعة': submission.university || '',
        'التخصص': submission.major || '',
        'المهارات': Array.isArray(submission.skills) ? submission.skills.join(', ') : submission.skills || '',
        'الموقع الشخصي': submission.portfolio || '',
        'الخبرة': submission.experience || '',
        'الدافع للمشاركة': submission.motivation || '',
        'تفضيل الفريق': submission.teamPreference || '',
        'القيود الغذائية': submission.dietaryRestrictions || '',
        'جهة الاتصال الطارئ': submission.emergencyContact || '',
        'الحالة': submission.status === 'approved' ? 'مقبول' : 
                 submission.status === 'rejected' ? 'مرفوض' : 'في انتظار المراجعة',
        'تاريخ التقديم': submission.createdAt.toLocaleDateString('ar-SA'),
        'وقت التقديم': submission.createdAt.toLocaleTimeString('ar-SA'),
        'تمت المراجعة بواسطة': submission.reviewedBy || '',
        'تاريخ المراجعة': submission.reviewedAt ? submission.reviewedAt.toLocaleDateString('ar-SA') : '',
        'ملاحظات المراجعة': submission.notes || '',
        ...customFields // Add any custom fields
      }
    })

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    const columnWidths = [
      { wch: 5 },   // #
      { wch: 20 },  // الاسم
      { wch: 25 },  // البريد الإلكتروني
      { wch: 15 },  // رقم الهاتف
      { wch: 20 },  // الجامعة
      { wch: 15 },  // التخصص
      { wch: 30 },  // المهارات
      { wch: 25 },  // الموقع الشخصي
      { wch: 30 },  // الخبرة
      { wch: 40 },  // الدافع للمشاركة
      { wch: 15 },  // تفضيل الفريق
      { wch: 20 },  // القيود الغذائية
      { wch: 25 },  // جهة الاتصال الطارئ
      { wch: 15 },  // الحالة
      { wch: 12 },  // تاريخ التقديم
      { wch: 12 },  // وقت التقديم
      { wch: 20 },  // تمت المراجعة بواسطة
      { wch: 12 },  // تاريخ المراجعة
      { wch: 30 }   // ملاحظات المراجعة
    ]
    worksheet['!cols'] = columnWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الطلبات المرسلة')

    // Add summary sheet
    const summaryData = [
      { 'البيان': 'اسم الهاكاثون', 'القيمة': hackathon.title },
      { 'البيان': 'تاريخ التصدير', 'القيمة': new Date().toLocaleDateString('ar-SA') },
      { 'البيان': 'إجمالي الطلبات', 'القيمة': submissions.length },
      { 'البيان': 'الطلبات المقبولة', 'القيمة': submissions.filter(s => s.status === 'approved').length },
      { 'البيان': 'الطلبات المرفوضة', 'القيمة': submissions.filter(s => s.status === 'rejected').length },
      { 'البيان': 'في انتظار المراجعة', 'القيمة': submissions.filter(s => s.status === 'pending' || !s.status).length }
    ]
    
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData)
    summaryWorksheet['!cols'] = [{ wch: 20 }, { wch: 30 }]
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'ملخص')

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: format as any,
      compression: true
    })

    // Set filename
    const timestamp = new Date().toISOString().split('T')[0]
    const statusSuffix = status && status !== 'all' ? `_${status}` : ''
    const filename = `${hackathon.title.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')}_submissions${statusSuffix}_${timestamp}.${format}`

    console.log('✅ Excel file generated:', filename, 'with', submissions.length, 'submissions')

    // Return Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('❌ Error exporting submissions:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تصدير الطلبات' },
      { status: 500 }
    )
  }
}
