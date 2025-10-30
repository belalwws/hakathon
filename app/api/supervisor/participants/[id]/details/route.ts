import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch participant with all details
    const participant = await prisma.participant.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            city: true,
            nationality: true,
          }
        },
        hackathon: {
          include: {
            registrationForm: true
          }
        }
      }
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'المشارك غير موجود' },
        { status: 404 }
      )
    }

    // Parse form fields to get labels
    const formFields = participant.hackathon.registrationForm?.fields 
      ? JSON.parse(participant.hackathon.registrationForm.fields as string)
      : []

    // Create field ID to label mapping
    const fieldLabels: { [key: string]: { label: string; type: string; options?: string[] } } = {}
    formFields.forEach((field: any) => {
      fieldLabels[field.id] = {
        label: field.label,
        type: field.type,
        options: field.options
      }
    })

    // Map additionalInfo with proper labels
    const formattedAdditionalInfo: { [key: string]: { label: string; value: any; type: string } } = {}
    if (participant.additionalInfo && typeof participant.additionalInfo === 'object') {
      const additionalInfo = participant.additionalInfo as { [key: string]: any }
      
      // Check if there's formData inside additionalInfo and extract it
      let dataToProcess = additionalInfo
      if (additionalInfo.formData && typeof additionalInfo.formData === 'object') {
        dataToProcess = additionalInfo.formData
      }
      
      Object.entries(dataToProcess).forEach(([fieldId, value]) => {
        // Skip meta fields
        if (fieldId === 'submittedAt' || fieldId === 'registrationType' || fieldId === 'formData') {
          return
        }
        
        const fieldMeta = fieldLabels[fieldId]
        if (fieldMeta) {
          formattedAdditionalInfo[fieldId] = {
            label: fieldMeta.label,
            value: value,
            type: fieldMeta.type
          }
        } else {
          // Keep unknown fields with their ID as label
          formattedAdditionalInfo[fieldId] = {
            label: fieldId,
            value: value,
            type: 'unknown'
          }
        }
      })
    }

    return NextResponse.json({
      participant: {
        id: participant.id,
        status: participant.status,
        user: participant.user,
        teamName: participant.teamName,
        teamRole: participant.teamRole,
        projectTitle: participant.projectTitle,
        projectDescription: participant.projectDescription,
        registeredAt: participant.registeredAt,
        additionalInfo: formattedAdditionalInfo
      }
    })
  } catch (error) {
    console.error('Error fetching participant details:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب تفاصيل المشارك' },
      { status: 500 }
    )
  }
}
