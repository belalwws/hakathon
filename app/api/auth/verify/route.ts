import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Verify API called')

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not configured')
      return NextResponse.json({ error: 'إعدادات الخادم غير مكتملة' }, { status: 500 })
    }

    const token = request.cookies.get('auth-token')?.value
    console.log('🔑 Token from cookies:', token ? 'Found' : 'Not found')

    if (!token) {
      return NextResponse.json({ error: 'لا يوجد رمز مصادقة' }, { status: 401 })
    }

    // Import verifyToken dynamically to avoid build issues
    const { verifyToken } = await import('@/lib/auth')
    const payload = await verifyToken(token)

    if (!payload) {
      console.log('❌ Token verification failed')
      return NextResponse.json({ error: 'رمز المصادقة غير صالح' }, { status: 401 })
    }

    console.log('✅ Token verified successfully for user:', payload.email)

    // Return user data if token is valid
    return NextResponse.json({
      user: {
        id: payload.userId,
        email: payload.email,
        name: payload.name,
        role: payload.role
      }
    })

  } catch (error) {
    console.error('❌ Token verification error:', error)
    return NextResponse.json({
      error: 'خطأ في التحقق من الجلسة',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
