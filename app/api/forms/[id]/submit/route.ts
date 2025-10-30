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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { formData, userId } = await request.json()

    const prismaClient = await getPrisma()
    if (!prismaClient) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    // Check if form exists and is published
    const form = await prismaClient.form.findUnique({
      where: { id: params.id }
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    if (form.status !== 'published') {
      return NextResponse.json({ error: 'Form is not available' }, { status: 400 })
    }

    // Create form response
    const response = await prismaClient.formResponse.create({
      data: {
        formId: params.id,
        userId: userId || null,
        responses: formData,
        submittedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      responseId: response.id 
    })
  } catch (error) {
    console.error('Error submitting form:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
