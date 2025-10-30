import { NextRequest, NextResponse } from 'next/server'

// Lazy import prisma to avoid build-time errors
let prisma: any = null
async function getPrisma() {
  if (!prisma) {
    try {
      const { prisma: prismaClient } = await import('@/lib/prisma')
      prisma = prismaClient
    } catch (error) {
      console.error('Failed to import prisma:', error)
      return null
    }
  }
  return prisma
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prismaClient = await getPrisma()
    if (!prismaClient) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    // Try to find in general forms first
    let form = await prismaClient.form.findUnique({
      where: { id: params.id }
    })

    // If not found, try hackathon forms
    if (!form) {
      form = await prismaClient.hackathonForm.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          title: true,
          description: true,
          fields: true,
          isActive: true,
          openAt: true,
          closeAt: true,
          coverImage: true,
          colors: true
        }
      })

      if (form) {
        // Parse fields if it's a string
        if (typeof form.fields === 'string') {
          try {
            form.fields = JSON.parse(form.fields)
          } catch (e) {
            console.error('Error parsing form fields:', e)
          }
        }

        // Map to general form format
        form = {
          ...form,
          status: form.isActive ? 'published' : 'closed',
          isPublic: true
        }
      }
    }

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    return NextResponse.json({ form })
  } catch (error) {
    console.error('Error fetching form:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
