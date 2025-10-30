/**
 * Storage Utilities
 * Handles file storage operations for certificates, images, and other assets
 */

import { v2 as cloudinary } from 'cloudinary'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Configure Cloudinary if credentials are available
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export interface StorageOptions {
  folder?: string
  public_id?: string
  overwrite?: boolean
  resource_type?: 'image' | 'video' | 'raw' | 'auto'
}

export interface StorageResult {
  url: string
  public_id: string
  secure_url: string
  format: string
  bytes: number
}

/**
 * Upload file to Cloudinary
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: StorageOptions = {}
): Promise<StorageResult> {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary not configured')
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: options.folder || 'hackathon-platform',
          public_id: options.public_id,
          overwrite: options.overwrite ?? true,
          resource_type: options.resource_type || 'auto',
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else if (result) {
            resolve({
              url: result.url,
              public_id: result.public_id,
              secure_url: result.secure_url,
              format: result.format,
              bytes: result.bytes,
            })
          } else {
            reject(new Error('Upload failed'))
          }
        }
      ).end(buffer)
    })
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

/**
 * Upload file to local storage (fallback)
 */
export async function uploadToLocal(
  buffer: Buffer,
  filename: string,
  folder: string = 'uploads'
): Promise<StorageResult> {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', folder)
    
    // Ensure directory exists
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }
    
    const filePath = path.join(uploadsDir, filename)
    await writeFile(filePath, buffer)
    
    const url = `/${folder}/${filename}`
    
    return {
      url,
      public_id: filename,
      secure_url: url,
      format: path.extname(filename).slice(1),
      bytes: buffer.length,
    }
  } catch (error) {
    console.error('Local storage error:', error)
    throw error
  }
}

/**
 * Upload file (tries Cloudinary first, falls back to local)
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType?: string,
  folder?: string
): Promise<{ success: boolean; url?: string; error?: string; public_id?: string }> {
  try {
    console.log('🔄 uploadFile called with:', { filename, mimeType, folder, bufferSize: buffer.length })

    const options: StorageOptions = {
      folder: folder || 'uploads',
      resource_type: mimeType?.startsWith('image/') ? 'image' : 'auto'
    }

    // Try Cloudinary first
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      console.log('🌤️ Trying Cloudinary upload...')
      try {
        const result = await uploadToCloudinary(buffer, {
          ...options,
          public_id: filename.split('.')[0],
        })
        console.log('✅ Cloudinary upload successful:', result.url)
        return {
          success: true,
          url: result.secure_url,
          public_id: result.public_id
        }
      } catch (cloudinaryError) {
        console.error('❌ Cloudinary upload failed:', cloudinaryError)
        // Continue to local fallback
      }
    } else {
      console.log('⚠️ Cloudinary not configured, using local storage')
    }

    // Fallback to local storage
    console.log('💾 Trying local storage...')
    try {
      const result = await uploadToLocal(buffer, filename, options.folder)
      console.log('✅ Local upload successful:', result.url)
      return {
        success: true,
        url: result.url,
        public_id: result.public_id
      }
    } catch (localError) {
      console.error('❌ Local upload failed:', localError)
      return {
        success: false,
        error: `Upload failed: ${localError instanceof Error ? localError.message : 'Unknown error'}`
      }
    }
  } catch (error) {
    console.error('❌ uploadFile error:', error)
    return {
      success: false,
      error: `File upload error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return false
    }

    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === 'ok'
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    return false
  }
}

/**
 * Get file from local storage
 */
export async function getLocalFile(filename: string, folder: string = 'uploads'): Promise<Buffer | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', folder, filename)
    
    if (!existsSync(filePath)) {
      return null
    }
    
    return await readFile(filePath)
  } catch (error) {
    console.error('Local file read error:', error)
    return null
  }
}

/**
 * Store certificate template
 */
export async function storeCertificateTemplate(
  hackathonId: string,
  buffer: Buffer,
  filename: string
): Promise<StorageResult> {
  try {
    return await uploadFile(buffer, filename, {
      folder: `certificates/templates/${hackathonId}`,
      public_id: `template_${hackathonId}`,
      resource_type: 'image'
    })
  } catch (error) {
    console.error('Certificate template storage error:', error)
    throw error
  }
}

/**
 * Store generated certificate
 */
export async function storeCertificate(
  hackathonId: string,
  participantId: string,
  buffer: Buffer,
  format: 'png' | 'pdf' = 'png'
): Promise<StorageResult> {
  try {
    const filename = `certificate_${participantId}.${format}`
    
    return await uploadFile(buffer, filename, {
      folder: `certificates/generated/${hackathonId}`,
      public_id: `cert_${participantId}`,
      resource_type: format === 'pdf' ? 'raw' : 'image'
    })
  } catch (error) {
    console.error('Certificate storage error:', error)
    throw error
  }
}

/**
 * Get storage configuration
 */
export function getStorageConfig() {
  return {
    cloudinary: {
      enabled: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    },
    local: {
      enabled: true,
      path: path.join(process.cwd(), 'public', 'uploads')
    }
  }
}

/**
 * Test storage connectivity
 */
export async function testStorage(): Promise<{ cloudinary: boolean; local: boolean }> {
  const results = {
    cloudinary: false,
    local: false
  }
  
  // Test Cloudinary
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      await cloudinary.api.ping()
      results.cloudinary = true
    }
  } catch (error) {
    console.error('Cloudinary test failed:', error)
  }
  
  // Test local storage
  try {
    const testBuffer = Buffer.from('test')
    const testFile = `test_${Date.now()}.txt`
    await uploadToLocal(testBuffer, testFile, 'test')
    results.local = true
  } catch (error) {
    console.error('Local storage test failed:', error)
  }
  
  return results
}
