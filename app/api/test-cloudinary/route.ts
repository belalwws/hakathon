import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Cloudinary configuration...')
    
    // Check environment variables
    const config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    }
    
    console.log('🔧 Environment variables:', {
      cloud_name: config.cloud_name ? '✅ Set' : '❌ Missing',
      api_key: config.api_key ? '✅ Set' : '❌ Missing',
      api_secret: config.api_secret ? '✅ Set' : '❌ Missing',
    })
    
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      return NextResponse.json({
        success: false,
        error: 'Cloudinary credentials not configured',
        config: {
          cloud_name: config.cloud_name ? 'Set' : 'Missing',
          api_key: config.api_key ? 'Set' : 'Missing',
          api_secret: config.api_secret ? 'Set' : 'Missing',
        }
      }, { status: 400 })
    }
    
    // Configure Cloudinary
    cloudinary.config(config)
    
    // Test API connection
    const result = await cloudinary.api.ping()
    console.log('✅ Cloudinary ping successful:', result)
    
    return NextResponse.json({
      success: true,
      message: 'Cloudinary is configured correctly',
      config: {
        cloud_name: config.cloud_name,
        api_key: config.api_key?.substring(0, 6) + '...',
        api_secret: '***'
      },
      ping: result
    })
    
  } catch (error: any) {
    console.error('❌ Cloudinary test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      details: error.stack
    }, { status: 500 })
  }
}
