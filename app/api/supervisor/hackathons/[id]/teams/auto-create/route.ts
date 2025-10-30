import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'racein668@gmail.com',
    pass: process.env.GMAIL_PASS || 'gpbyxbbvrzfyluqt'
  }
})

// POST /api/supervisor/hackathons/[id]/teams/auto-create - Create teams automatically
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    // Verify supervisor is assigned to this hackathon
    if (userRole === "supervisor") {
      const assignment = await prisma.supervisor.findFirst({
        where: {
          userId: userId!,
          hackathonId: hackathonId,
          isActive: true
        }
      })

      if (!assignment) {
        return NextResponse.json({ error: "غير مصرح - لست مشرفاً على هذا الهاكاثون" }, { status: 403 })
      }
    }

    console.log(`🚀 Starting automatic team creation for hackathon: ${hackathonId}`)

    // Check if teams already exist
    const existingTeams = await prisma.team.findMany({
      where: { hackathonId: hackathonId }
    })

    if (existingTeams.length > 0) {
      console.log(`⚠️ Found ${existingTeams.length} existing teams. Deleting them first...`)
      
      // Remove all participants from teams first
      await prisma.participant.updateMany({
        where: {
          hackathonId: hackathonId,
          teamId: { not: null }
        },
        data: {
          teamId: null,
          teamRole: null
        }
      })

      // Delete all existing teams
      await prisma.team.deleteMany({
        where: { hackathonId: hackathonId }
      })

      console.log(`✅ Deleted ${existingTeams.length} teams successfully`)
    }

    const startingTeamNumber = 1

    // Get hackathon with settings
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: {
        id: true,
        title: true,
        settings: true
      }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    // Get team formation settings
    const hackathonSettings = hackathon.settings as any
    const teamFormationSettings = hackathonSettings?.teamFormationSettings || {
      teamSize: 4,
      minTeamSize: 3,
      maxTeamSize: 5,
      allowPartialTeams: true,
      rules: []
    }

    // Check if email notifications are enabled for team formation
    const emailNotifications = hackathonSettings?.emailNotifications || {}
    const shouldSendEmails = emailNotifications.teamFormation !== false

    const teamSize = teamFormationSettings.teamSize
    const rules = teamFormationSettings.rules || []

    console.log(`🎯 Using team size: ${teamSize}`)
    console.log(`📋 Using ${rules.length} distribution rules`)

    // Get approved participants
    const approvedParticipants = await prisma.participant.findMany({
      where: {
        hackathonId: hackathonId,
        status: 'approved' as any,
        teamId: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            preferredRole: true
          }
        },
        hackathon: {
          select: {
            title: true
          }
        }
      }
    })

    if (approvedParticipants.length === 0) {
      return NextResponse.json({ error: 'لا توجد مشاركين مقبولين متاحين' }, { status: 400 })
    }

    console.log(`👥 Found ${approvedParticipants.length} approved participants`)

    // Group participants based on rules
    const groups: { [key: string]: { [value: string]: typeof approvedParticipants } } = {}

    for (const rule of rules) {
      if (rule.distribution === 'ignore') continue
      groups[rule.fieldId] = {}

      approvedParticipants.forEach(participant => {
        let value: string | undefined

        if (rule.fieldId === 'preferredRole' || rule.fieldLabel.includes('دور')) {
          value = participant.user.preferredRole || 'غير محدد'
        } else if (participant.additionalInfo) {
          const additionalInfo = participant.additionalInfo as any
          value = additionalInfo[rule.fieldId] || additionalInfo[rule.fieldLabel] || 'غير محدد'
        } else {
          value = (participant as any)[rule.fieldId] || 'غير محدد'
        }

        const fieldKey = rule.fieldId || 'default'
        const valueKey = value || 'غير محدد'
        
        if (!groups[fieldKey][valueKey]) {
          groups[fieldKey][valueKey] = []
        }
        groups[fieldKey][valueKey].push(participant)
      })
    }

    // Fallback: group by preferredRole
    if (rules.length === 0) {
      const roleGroups: { [key: string]: typeof approvedParticipants } = {}
      approvedParticipants.forEach(participant => {
        const role = participant.user.preferredRole || 'مطور'
        if (!roleGroups[role]) roleGroups[role] = []
        roleGroups[role].push(participant)
      })
      groups['preferredRole'] = roleGroups
    }

    // ترتيب القواعد حسب الأولوية
    const sortedRules = [...rules].sort((a, b) => (a.priority || 999) - (b.priority || 999))

    // ============================================
    // حساب عدد الفرق بناءً على إجمالي المشاركين
    // ============================================
    const numberOfTeams = Math.ceil(approvedParticipants.length / teamSize)
    
    console.log(`📊 Creating ${numberOfTeams} teams for ${approvedParticipants.length} participants`)
    console.log(`   Team size: ${teamSize} (min: ${teamFormationSettings.minTeamSize}, max: ${teamFormationSettings.maxTeamSize})`)
    
    const teams: Array<{
      name: string
      teamNumber: number
      members: typeof approvedParticipants
    }> = []

    for (let i = 0; i < numberOfTeams; i++) {
      teams.push({
        name: `الفريق ${startingTeamNumber + i}`,
        teamNumber: startingTeamNumber + i,
        members: []
      })
    }

    // Distribute participants based on rules
    const assignedParticipants = new Set<string>()

    // استراتيجية Round-Robin الصحيحة: نوزع بالتناوب بين كل القيم والفرق
    for (const rule of sortedRules) {
      if (rule.distribution === 'ignore' || !groups[rule.fieldId]) continue

      const fieldGroups = groups[rule.fieldId]
      const values = Object.keys(fieldGroups)

      if (rule.distribution === 'one_per_team') {
        const maxPerTeam = rule.maxPerTeam || 1
        
        // استراتيجية Round-Robin: نوزع دورة كاملة على كل الفرق لكل قيمة
        let globalTeamIndex = 0
        
        // نكرر الدورات حتى نوزع كل المشاركين
        let hasMoreParticipants = true
        let roundNumber = 0
        
        while (hasMoreParticipants && roundNumber < maxPerTeam) {
          hasMoreParticipants = false
          roundNumber++
          
          // في كل دورة، نوزع قيمة واحدة من كل نوع على كل فريق
          for (const value of values) {
            const participants = fieldGroups[value].filter(p => !assignedParticipants.has(p.id))
            
            if (participants.length > 0) {
              hasMoreParticipants = true
              
              // نوزع على كل الفرق في هذه الدورة
              for (let teamIdx = 0; teamIdx < numberOfTeams && participants.length > 0; teamIdx++) {
                const teamIndex = (globalTeamIndex + teamIdx) % numberOfTeams
                
                // تحقق من عدد الحالي لهذه القيمة في الفريق
                const currentCount = teams[teamIndex].members.filter(m => {
                  let mValue: string | undefined
                  if (rule.fieldId === 'preferredRole' || rule.fieldLabel.includes('دور')) {
                    mValue = m.user.preferredRole || 'غير محدد'
                  } else if (m.additionalInfo) {
                    const additionalInfo = m.additionalInfo as any
                    mValue = additionalInfo[rule.fieldId] || additionalInfo[rule.fieldLabel] || 'غير محدد'
                  } else {
                    mValue = (m as any)[rule.fieldId] || 'غير محدد'
                  }
                  return mValue === value
                }).length

                // إذا لم نصل للحد الأقصى، أضف مشارك
                if (currentCount < maxPerTeam) {
                  const availableParticipants = fieldGroups[value].filter(p => !assignedParticipants.has(p.id))
                  if (availableParticipants.length > 0) {
                    const participant = availableParticipants[0]
                    teams[teamIndex].members.push(participant)
                    assignedParticipants.add(participant.id)
                    console.log(`✅ Assigned ${participant.user.name} (${value}) to Team ${teamIndex + 1}`)
                  }
                }
              }
            }
            
            // تدوير الفريق البدائي لكل قيمة لضمان التوزيع العادل
            globalTeamIndex = (globalTeamIndex + 1) % numberOfTeams
          }
        }
      } else {
        // التوزيع العادي (balanced) - round-robin بسيط
        let currentTeamIndex = 0
        for (const value of values) {
          const participants = fieldGroups[value].filter(p => !assignedParticipants.has(p.id))
          
          for (const participant of participants) {
            teams[currentTeamIndex].members.push(participant)
            assignedParticipants.add(participant.id)
            currentTeamIndex = (currentTeamIndex + 1) % numberOfTeams
          }
        }
      }
    }

    // Assign remaining participants (بدون تحقق من القواعد - الأولوية إنهم يتوزعوا)
    const remainingParticipants = approvedParticipants.filter(p => !assignedParticipants.has(p.id))
    let currentTeamIndex = 0

    console.log(`⚠️ ${remainingParticipants.length} participants remaining after rule-based assignment`)
    console.log(`📌 Distributing remaining participants equally across teams (rules already applied for diversity)`)

    // توزيع الباقي بالتساوي بدون قيود - القواعد اتطبقت عشان التنوع، دلوقتي نوزع الباقي
    for (const participant of remainingParticipants) {
      // ابحث عن أصغر فريق عشان نوازن العدد
      let smallestTeamIndex = 0
      let smallestTeamSize = teams[0].members.length
      
      for (let i = 1; i < teams.length; i++) {
        if (teams[i].members.length < smallestTeamSize) {
          smallestTeamSize = teams[i].members.length
          smallestTeamIndex = i
        }
      }
      
      teams[smallestTeamIndex].members.push(participant)
      assignedParticipants.add(participant.id)
      console.log(`✅ Assigned ${participant.user.name} (${participant.user.preferredRole}) to Team ${smallestTeamIndex + 1} (now ${teams[smallestTeamIndex].members.length} members)`)
    }

    console.log(`✅ All ${approvedParticipants.length} participants distributed across ${numberOfTeams} teams`)
    console.log(`📊 Team sizes: ${teams.map((t, i) => `Team ${i+1}: ${t.members.length}`).join(', ')}`)

    // Create teams in database
    const createdTeams: any[] = []
    const emailData: Array<{
      email: string
      userName: string
      hackathonTitle: string
      teamName: string
      userRole: string
      teamMembers: string
    }> = []
    let totalMembers = 0

    for (const teamData of teams) {
      if (teamData.members.length === 0) continue

      try {
        const team = await prisma.team.create({
          data: {
            name: teamData.name,
            hackathonId: hackathonId,
            teamNumber: teamData.teamNumber,
            createdAt: new Date()
          }
        })

        const participantIds = teamData.members.map(p => p.id)
        
        await prisma.participant.updateMany({
          where: { id: { in: participantIds } },
          data: { teamId: team.id }
        })

        totalMembers += teamData.members.length

        createdTeams.push({
          id: team.id,
          name: team.name,
          members: teamData.members
        })

        // Prepare emails (don't send yet - we'll batch them)
        teamData.members.forEach(participant => {
          // جلب الدور الحقيقي من كل الأماكن الممكنة
          const getParticipantRole = (p: typeof participant) => {
            // البحث في additionalInfo
            if (p.additionalInfo) {
              const additionalInfo = p.additionalInfo as any
              
              // البحث في formData (من الفورم الديناميكي)
              if (additionalInfo.formData) {
                const formData = additionalInfo.formData
                
                // أولاً: البحث بالـ ID المحدد للدور (field_1760547826023)
                if (formData['field_1760547826023']) {
                  console.log(`✅ Found role by ID: field_1760547826023 = ${formData['field_1760547826023']}`)
                  return formData['field_1760547826023']
                }
                
                // ثانياً: البحث في كل الحقول الممكنة للدور
                const roleKeys = Object.keys(formData).filter(key => {
                  const lowerKey = key.toLowerCase()
                  return (
                    lowerKey.includes('role') || 
                    key.includes('دور') || 
                    key.includes('الدور') ||
                    key.includes('تلعبه') ||
                    key.includes('الفريق') ||
                    key.includes('الفربق')  // الفريق بالتاء المربوطة
                  )
                })
                if (roleKeys.length > 0 && formData[roleKeys[0]]) {
                  console.log(`✅ Found role in formData: ${roleKeys[0]} = ${formData[roleKeys[0]]}`)
                  return formData[roleKeys[0]]
                }
              }
              
              // البحث المباشر في additionalInfo
              const roleValue = additionalInfo.preferredRole || 
                               additionalInfo['الدور المفضل'] || 
                               additionalInfo.role ||
                               additionalInfo['دور الفريق'] ||
                               additionalInfo.teamRole
              
              if (roleValue) return roleValue
            }
            
            // fallback للـ user.preferredRole
            return p.user.preferredRole || 'مشارك'
          }
          
          const teamMembers = teamData.members.map(m => {
            const memberRole = getParticipantRole(m)
            // Only show role if it's not the default 'مشارك'
            if (memberRole && memberRole !== 'مشارك') {
              return `${m.user.name} - ${memberRole}`
            }
            return m.user.name
          }).join('\n')
          
          const userRole = getParticipantRole(participant)
          
          emailData.push({
            email: participant.user.email,
            userName: participant.user.name,
            hackathonTitle: hackathon.title,
            teamName: team.name,
            userRole: userRole,
            teamMembers
          })
        })
      } catch (error) {
        console.error(`Error creating team ${teamData.name}:`, error)
      }
    }

    // Send emails in batches using bulk email function
    let emailStats = { sent: 0, failed: 0, total: 0 }
    
    if (shouldSendEmails && emailData.length > 0) {
      console.log(`📧 Preparing to send ${emailData.length} team assignment emails in batches`)
      
      const { sendBulkEmails } = await import('@/lib/mailer')
      const emailsToSend = emailData.map(data => ({
        to: data.email,
        subject: `تم تعيينك في ${data.teamName} - ${data.hackathonTitle}`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #01645e;">مرحباً ${data.userName}!</h2>
            <p>تم تعيينك في <strong>${data.teamName}</strong> للمشاركة في <strong>${data.hackathonTitle}</strong></p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #01645e;">دورك في الفريق:</h3>
              <p style="font-size: 18px; color: #3ab666;"><strong>${data.userRole}</strong></p>
            </div>
            <div style="background: #e8f5e9; padding: 15px; border-radius: 5px;">
              <h3 style="color: #01645e;">أعضاء الفريق:</h3>
              <pre style="white-space: pre-line;">${data.teamMembers}</pre>
            </div>
            <p style="margin-top: 20px;">تواصل مع أعضاء فريقك وابدأوا العمل على مشروعكم!</p>
            <p style="color: #8b7632;">بالتوفيق! 🚀</p>
          </div>
        `,
        text: `مرحباً ${data.userName}!\n\nتم تعيينك في ${data.teamName} للمشاركة في ${data.hackathonTitle}\n\nدورك: ${data.userRole}\n\nأعضاء الفريق:\n${data.teamMembers}\n\nبالتوفيق!`
      }))
      
      const bulkResults = await sendBulkEmails(emailsToSend, {
        batchSize: 5,
        delayBetweenBatches: 3000
      })
      emailStats = bulkResults
    } else {
      console.log(`⚠️ Email notifications for team formation are disabled. Skipping ${emailData.length} emails.`)
    }

    const finalUnassignedCount = approvedParticipants.length - assignedParticipants.size
    
    return NextResponse.json({
      message: `تم تكوين ${createdTeams.length} فريق بنجاح`,
      teams: createdTeams.length,
      totalMembers: totalMembers,
      totalParticipants: approvedParticipants.length,
      assignedParticipants: assignedParticipants.size,
      unassignedParticipants: finalUnassignedCount,
      emailStats: {
        sent: emailStats.sent,
        failed: emailStats.failed,
        total: emailStats.total
      },
      emailsEnabled: shouldSendEmails,
      warning: finalUnassignedCount > 0 ? `⚠️ ${finalUnassignedCount} مشاركين لم يتم تعيينهم بسبب قواعد التوزيع` : null
    })

  } catch (error) {
    console.error('Error in automatic team creation:', error)
    return NextResponse.json({ error: 'خطأ في تكوين الفرق' }, { status: 500 })
  }
}

async function sendTeamAssignmentEmail(
  email: string,
  userName: string,
  hackathonTitle: string,
  teamName: string,
  userRole: string,
  teamMembers: string
): Promise<void> {
  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'هاكاثون الابتكار التقني <racein668@gmail.com>',
    to: email,
    subject: `🎉 تم تعيينك في ${teamName} - ${hackathonTitle}`,
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px;">
          <h1 style="color: #01645e; text-align: center;">🎉 مرحباً بك في فريقك!</h1>
          <h2 style="color: #3ab666;">مرحباً ${userName}!</h2>
          <p>تم تعيينك في <strong>${teamName}</strong> لـ <strong>${hackathonTitle}</strong></p>
          <p>دورك: <strong>${userRole}</strong></p>
          <h3>أعضاء الفريق:</h3>
          <pre style="background: #f8f9fa; padding: 15px; border-radius: 5px;">${teamMembers}</pre>
          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://clownfish-app-px9sc.ondigitalocean.app'}/participant/dashboard" 
               style="background: #3ab666; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              زيارة لوحة التحكم
            </a>
          </p>
        </div>
      </body>
      </html>
    `
  })
}
