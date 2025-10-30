import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { access } from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Check if file exists
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename)
    
    try {
      await access(filePath)
      return NextResponse.json({ 
        exists: true, 
        filename: filename,
        path: `/api/uploads/${filename}`
      })
    } catch (error) {
      return NextResponse.json({ 
        exists: false, 
        filename: filename,
        error: 'الملف غير موجود'
      })
    }

  } catch (error) {
    console.error('Error checking file:', error)
    return NextResponse.json({ error: 'خطأ في التحقق من الملف' }, { status: 500 })
  }
}
