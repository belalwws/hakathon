import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

async function getPrisma() {
  try {
    const mod = await import('@/lib/prisma')
    return mod.prisma
  } catch (error) {
    console.error('Prisma import error:', error)
    return null
  }
}

async function executeWithRetry<T>(fn: () => Promise<T>, retries = 1): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    if (retries > 0 && error?.message?.includes('Can\'t reach database')) {
      console.warn('DB connection failed, retrying in 1.5s...')
      await new Promise(r => setTimeout(r, 1500))
      return executeWithRetry(fn, retries - 1)
    }
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json()
    
    // Security check - only allow with secret key
    if (secret !== process.env.MASTER_SETUP_SECRET) {
      return NextResponse.json({ error: 'Unauthorized - Invalid secret key' }, { status: 401 })
    }

    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    const masterEmail = 'master@hackpro.cloud'
    const masterPassword = 'Master@2025!'

    // Check if master already exists (with retry)
    const existing = await executeWithRetry(async () => 
      prisma.user.findUnique({ where: { email: masterEmail } })
    )

    if (existing) {
      // Update to master role if not already
      if (existing.role !== 'master') {
        const updated = await executeWithRetry(async () =>
          prisma.user.update({
            where: { email: masterEmail },
            data: { role: 'master' },
          })
        )
        return NextResponse.json({
          message: 'Master role updated successfully',
          user: { email: updated.email, role: updated.role },
        })
      }
      return NextResponse.json({
        message: 'Master admin already exists',
        user: { email: existing.email, role: existing.role },
      })
    }

    // Create new master admin (with retry)
    const hashedPassword = await bcrypt.hash(masterPassword, 10)
    const master = await executeWithRetry(async () =>
      prisma.user.create({
        data: {
          name: 'Platform Master',
          email: masterEmail,
          password: hashedPassword,
          role: 'master',
        },
      })
    )

    return NextResponse.json({
      message: 'Master admin created successfully ✅',
      user: { email: master.email, role: master.role },
      credentials: {
        email: masterEmail,
        password: masterPassword,
      },
    })
  } catch (error: any) {
    console.error('Error creating master admin:', error)
    if (error?.message?.includes('Can\'t reach database')) {
      return NextResponse.json({ 
        error: 'Database is sleeping (Neon auto-pause). Please wait 10 seconds and try again, or create the master user manually in Neon SQL Editor.',
        details: 'See CREATE_MASTER_NOW.md for manual setup instructions'
      }, { status: 503 })
    }
    return NextResponse.json({ error: 'Internal server error', details: error?.message }, { status: 500 })
  }
}
