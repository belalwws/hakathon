import { NextRequest, NextResponse } from 'next/server'

// CORS headers for external API access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false',
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

// GET /api/external/v1/status - Check API status and configuration
export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-Key')
    const expectedApiKey = process.env.EXTERNAL_API_KEY
    
    const status = {
      api: 'External API v1',
      status: 'online',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      render: process.env.RENDER === 'true',
      configuration: {
        apiKeyConfigured: !!expectedApiKey,
        apiKeyLength: expectedApiKey ? expectedApiKey.length : 0,
        apiKeyPrefix: expectedApiKey ? expectedApiKey.substring(0, 3) + '...' : 'not set',
        databaseConfigured: !!process.env.DATABASE_URL,
        jwtConfigured: !!process.env.JWT_SECRET,
        nextAuthConfigured: !!process.env.NEXTAUTH_SECRET,
      },
      authentication: {
        apiKeyProvided: !!apiKey,
        apiKeyValid: apiKey === expectedApiKey,
        apiKeyMatch: apiKey && expectedApiKey ? apiKey === expectedApiKey : false
      },
      endpoints: [
        'GET /api/external/v1/hackathons',
        'GET /api/external/v1/hackathons/{id}',
        'GET /api/external/v1/hackathons/{id}/register',
        'POST /api/external/v1/hackathons/{id}/register'
      ]
    }

    return NextResponse.json(status, { 
      status: 200, 
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        api: 'External API v1',
        status: 'error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500, headers: corsHeaders }
    )
  }
}
