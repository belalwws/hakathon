import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Update existing file on Cloudinary to make it public
 * @param publicId - The public ID of the file (e.g., "email-attachments/documents/filename.pdf")
 * @returns Updated file URL
 */
export async function makeCloudinaryFilePublic(publicId: string) {
  try {
    console.log(`🔄 [cloudinary] Making file public: ${publicId}`)

    // Update the file's access mode to public
    const result = await cloudinary.uploader.explicit(publicId, {
      type: 'upload',
      resource_type: 'raw',
      access_mode: 'public',
    })

    console.log(`✅ [cloudinary] File is now public: ${result.secure_url}`)
    return result.secure_url
  } catch (error: any) {
    console.error(`❌ [cloudinary] Failed to make file public:`, error.message)
    throw error
  }
}

/**
 * Upload file to Cloudinary
 * @param file - File buffer or base64 string
 * @param folder - Folder name in Cloudinary
 * @param filename - Optional filename
 * @returns Cloudinary upload result with secure_url
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  folder: string = 'hackathon',
  filename?: string
) {
  try {
    // Determine the correct data URI based on file extension
    let dataUri: string

    if (file instanceof Buffer) {
      const base64 = file.toString('base64')

      // Detect file type from filename or use application/octet-stream
      let mimeType = 'application/octet-stream'

      if (filename) {
        const ext = filename.split('.').pop()?.toLowerCase()

        // Map extensions to MIME types
        const mimeTypes: Record<string, string> = {
          'pdf': 'application/pdf',
          'ppt': 'application/vnd.ms-powerpoint',
          'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'doc': 'application/msword',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'svg': 'image/svg+xml',
          'webp': 'image/webp'
        }

        mimeType = mimeTypes[ext || ''] || 'application/octet-stream'
      }

      dataUri = `data:${mimeType};base64,${base64}`
    } else {
      dataUri = file
    }

    const result = await cloudinary.uploader.upload(
      dataUri,
      {
        folder: folder,
        public_id: filename,
        resource_type: 'auto',
        overwrite: true,
      }
    )

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload file to Cloudinary')
  }
}

/**
 * Upload raw files (PDFs, documents) to Cloudinary
 * @param file - File buffer
 * @param folder - Folder name in Cloudinary
 * @param filename - Optional filename
 * @returns Cloudinary upload result with secure_url
 */
export async function uploadRawToCloudinary(
  file: Buffer,
  folder: string = 'hackathon',
  filename?: string
) {
  try {
    const base64 = file.toString('base64')

    // Detect file type from filename
    let mimeType = 'application/octet-stream'
    if (filename) {
      const ext = filename.split('.').pop()?.toLowerCase()
      const mimeTypes: Record<string, string> = {
        'pdf': 'application/pdf',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }
      mimeType = mimeTypes[ext || ''] || 'application/octet-stream'
    }

    const dataUri = `data:${mimeType};base64,${base64}`

    // Try to delete old file first (if exists) to ensure fresh upload with new settings
    if (filename) {
      const publicId = `${folder}/${filename}`
      try {
        console.log(`🗑️ [cloudinary] Attempting to delete old file: ${publicId}`)
        await deleteFromCloudinary(publicId, 'raw')
      } catch (deleteError: any) {
        // Ignore error if file doesn't exist
        console.log(`ℹ️ [cloudinary] Old file not found or already deleted: ${deleteError.message}`)
      }
    }

    const result = await cloudinary.uploader.upload(
      dataUri,
      {
        folder: folder,
        public_id: filename,
        resource_type: 'raw',
        type: 'upload', // Make files publicly accessible
        access_mode: 'public', // Ensure public access
        overwrite: true,
        invalidate: true,
      }
    )

    console.log(`✅ [cloudinary] File uploaded: ${result.secure_url}`)

    // IMPORTANT: For raw files, we need to explicitly update access_mode after upload
    // because Cloudinary doesn't always apply access_mode during upload for raw files
    try {
      console.log(`🔄 [cloudinary] Updating access mode to public for: ${result.public_id}`)
      const updateResult = await cloudinary.uploader.explicit(result.public_id, {
        type: 'upload',
        resource_type: 'raw',
        access_mode: 'public',
      })
      console.log(`✅ [cloudinary] File is now PUBLIC: ${updateResult.secure_url}`)
    } catch (updateError: any) {
      console.error(`⚠️ [cloudinary] Failed to update access mode:`, updateError.message)
      // Continue anyway - the file is uploaded
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
    }
  } catch (error) {
    console.error('Cloudinary raw upload error:', error)
    throw new Error('Failed to upload raw file to Cloudinary')
  }
}

/**
 * Delete file from Cloudinary
 * @param publicId - Public ID of the file
 * @param resourceType - Type of resource (image, video, raw, auto)
 */
export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto') {
  try {
    // Try different resource types if auto doesn't work
    const types = resourceType === 'auto' ? ['raw', 'image', 'video'] : [resourceType]

    for (const type of types) {
      try {
        const result = await cloudinary.uploader.destroy(publicId, {
          resource_type: type,
          invalidate: true, // Invalidate CDN cache
        })
        if (result.result === 'ok') {
          console.log(`✅ Deleted from Cloudinary (${type}):`, publicId)
          return result
        }
      } catch (err) {
        // Continue to next type
        console.log(`⚠️ Failed to delete as ${type}, trying next...`)
      }
    }

    console.warn('⚠️ Could not delete from Cloudinary:', publicId)
    // Don't throw error - just log warning and continue
    return { result: 'warning', message: 'Could not delete file' }
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    // Don't throw error - just log and return
    return { result: 'error', message: 'Failed to delete file from Cloudinary' }
  }
}

/**
 * Upload multiple files to Cloudinary
 * @param files - Array of file buffers or base64 strings
 * @param folder - Folder name in Cloudinary
 * @returns Array of upload results
 */
export async function uploadMultipleToCloudinary(
  files: (Buffer | string)[],
  folder: string = 'hackathon'
) {
  try {
    const uploadPromises = files.map((file) => uploadToCloudinary(file, folder))
    return await Promise.all(uploadPromises)
  } catch (error) {
    console.error('Cloudinary multiple upload error:', error)
    throw new Error('Failed to upload files to Cloudinary')
  }
}

export default cloudinary

