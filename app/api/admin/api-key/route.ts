import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// GET /api/admin/api-key - Get API key for external integrations
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Return the API key from environment or default
    const apiKey = process.env.EXTERNAL_API_KEY || 'hackathon-api-key-2025'

    return NextResponse.json({ apiKey })
  } catch (error) {
    console.error('Error fetching API key:', error)
    return NextResponse.json(
      { error: 'فشل في جلب API Key' },
      { status: 500 }
    )
  }
}

