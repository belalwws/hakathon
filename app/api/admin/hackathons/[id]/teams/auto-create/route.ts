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

// POST /api/admin/hackathons/[id]/teams/auto-create - Create teams automatically
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params

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

    // Get hackathon with settings to determine team size
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

    const teamSize = teamFormationSettings.teamSize
    const rules = teamFormationSettings.rules || []

    console.log(`🎯 Using team size: ${teamSize} from hackathon settings`)
    console.log(`📋 Using ${rules.length} distribution rules`)

    // Get approved participants with user data and custom fields
    const approvedParticipants = await prisma.participant.findMany({
      where: {
        hackathonId: hackathonId,
        status: 'approved' as any,
        teamId: null // Only participants not already in a team
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
      return NextResponse.json({ error: 'لا توجد مشاركين مقبولين متاحين لتكوين الفرق' }, { status: 400 })
    }

    console.log(`👥 Found ${approvedParticipants.length} approved participants`)

    // Group participants based on rules
    const groups: { [key: string]: { [value: string]: typeof approvedParticipants } } = {}

    // Process each rule
    for (const rule of rules) {
      if (rule.distribution === 'ignore') continue

      const fieldId = rule.fieldId || 'defaultField'
      groups[fieldId] = {}

      approvedParticipants.forEach(participant => {
        // Get value from participant's custom fields or standard fields
        let value: string

        // Check standard fields first
        if (rule.fieldId === 'preferredRole' || rule.fieldLabel.includes('دور') || rule.fieldLabel.includes('role')) {
          value = participant.user.preferredRole || participant.preferredRole || 'غير محدد'
        } else if (participant.additionalInfo) {
          const additionalInfo = participant.additionalInfo as any
          value = additionalInfo[rule.fieldId] || additionalInfo[rule.fieldLabel] || 'غير محدد'
        } else {
          // Try to get from other participant fields
          value = (participant as any)[rule.fieldId] || 'غير محدد'
        }

        if (!groups[fieldId][value]) {
          groups[fieldId][value] = []
        }
        groups[fieldId][value].push(participant)
      })

      console.log(`📊 ${rule.fieldLabel} distribution:`,
        Object.keys(groups[fieldId]).map(val => `${val}: ${groups[fieldId][val].length}`)
      )
    }

    // Fallback: if no rules, group by preferredRole
    if (rules.length === 0) {
      const roleGroups: { [key: string]: typeof approvedParticipants } = {}

      approvedParticipants.forEach(participant => {
        const role = participant.user.preferredRole || 'مطور'
        if (!roleGroups[role]) {
          roleGroups[role] = []
        }
        roleGroups[role].push(participant)
      })

      groups['preferredRole'] = roleGroups
      console.log('📊 Role distribution (fallback):', Object.keys(roleGroups).map(role => `${role}: ${roleGroups[role].length}`))
    }

    // ترتيب القواعد حسب الأولوية
    const sortedRules = [...rules].sort((a, b) => (a.priority || 999) - (b.priority || 999))

    // حساب عدد الفرق بناءً على إجمالي المشاركين، مش أقل دور
    const numberOfTeams = Math.ceil(approvedParticipants.length / teamSize)
    console.log(`📊 Creating ${numberOfTeams} teams for ${approvedParticipants.length} participants (teamSize: ${teamSize})`)

    // Create balanced teams using the configured team size and rules
    const teams: Array<{
      name: string
      teamNumber: number
      members: typeof approvedParticipants
    }> = []

    console.log(`🎯 Creating ${numberOfTeams} teams with ~${teamSize} members each`)

    // Initialize teams
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

      if (rule.distribution === 'balanced' || rule.distribution === 'one_per_team') {
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
          // Balanced distribution
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

    console.log('🔄 Team formation completed')
    console.log(`📊 Total assigned: ${assignedParticipants.size} out of ${approvedParticipants.length}`)

    // Create teams in database and assign participants
    const createdTeams: any[] = []
    const emailPromises: Promise<any>[] = []

    for (let i = 0; i < teams.length; i++) {
      const teamData = teams[i]
      
      if (teamData.members.length === 0) continue

      try {
        // Create team
        const team = await prisma.team.create({
          data: {
            name: teamData.name,
            hackathonId: hackathonId,
            teamNumber: teamData.teamNumber,
            createdAt: new Date()
          }
        })

        console.log(`✅ Created team: ${team.name} (ID: ${team.id})`)

        // Assign participants to team
        const participantIds = teamData.members.map(p => p.id)
        
        await prisma.participant.updateMany({
          where: {
            id: { in: participantIds }
          },
          data: {
            teamId: team.id
          }
        })

        console.log(`👥 Assigned ${participantIds.length} participants to ${team.name}`)

        createdTeams.push({
          id: team.id,
          name: team.name,
          members: teamData.members
        })

        // Prepare emails for team members
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
          
          emailPromises.push(
            sendTeamAssignmentEmail(
              participant.user.email,
              participant.user.name,
              participant.hackathon.title,
              team.name,
              userRole,
              teamMembers
            )
          )
        })

      } catch (error) {
        console.error(`❌ Error creating team ${teamData.name}:`, error)
      }
    }

    // Send all emails
    console.log(`📧 Sending ${emailPromises.length} team assignment emails...`)
    const emailResults = await Promise.allSettled(emailPromises)
    const successfulEmails = emailResults.filter(r => r.status === 'fulfilled').length
    const failedEmails = emailResults.filter(r => r.status === 'rejected').length

    console.log(`📊 Email results: ${successfulEmails} successful, ${failedEmails} failed`)

    const finalUnassignedCount = approvedParticipants.length - assignedParticipants.size

    return NextResponse.json({
      message: `تم تكوين الفرق بنجاح`,
      teamsCreated: createdTeams.length,
      participantsAssigned: assignedParticipants.size,
      totalParticipants: approvedParticipants.length,
      unassignedParticipants: finalUnassignedCount,
      emailsSent: successfulEmails,
      emailsFailed: failedEmails,
      teams: createdTeams.map(t => ({
        name: t.name,
        memberCount: t.members.length
      })),
      warning: finalUnassignedCount > 0 ? `⚠️ ${finalUnassignedCount} مشاركين لم يتم تعيينهم بسبب قواعد التوزيع` : null
    })

  } catch (error) {
    console.error('❌ Error in automatic team creation:', error)
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
  try {
    await transporter.sendMail({
      from: `"${hackathonTitle}" <${process.env.GMAIL_USER || 'racein668@gmail.com'}>`,
      to: email,
      subject: `🎉 تم تعيينك في ${teamName} - ${hackathonTitle}`,
      html: getTeamAssignmentEmailContent(userName, hackathonTitle, teamName, userRole, teamMembers)
    })
    
    console.log(`📧 Team assignment email sent to ${email}`)
  } catch (error) {
    console.error(`❌ Failed to send team assignment email to ${email}:`, error)
    throw error
  }
}

function getTeamAssignmentEmailContent(
  userName: string,
  hackathonTitle: string,
  teamName: string,
  userRole: string,
  teamMembers: string
): string {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تعيين الفريق</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #c3e956/10 0%, #3ab666/10 100%); margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎉 مرحباً بك في فريقك!</h1>
          <p style="color: #c3e956; margin: 10px 0 0 0; font-size: 18px;">تم تعيينك في فريق جديد</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #01645e; margin: 0 0 20px 0; font-size: 24px;">مرحباً ${userName}! 👋</h2>
          
          <p style="color: #333; line-height: 1.8; font-size: 16px; margin-bottom: 25px;">
            يسعدنا إبلاغك بأنه تم تعيينك في فريق جديد لـ <strong style="color: #3ab666;">${hackathonTitle}</strong>
          </p>

          <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-right: 4px solid #3ab666; padding: 25px; margin: 25px 0; border-radius: 10px;">
            <h3 style="color: #01645e; margin: 0 0 15px 0; font-size: 20px;">🏆 ${teamName}</h3>
            <p style="color: #666; margin: 0; font-size: 16px;">دورك في الفريق: <strong style="color: #3ab666;">${userRole}</strong></p>
          </div>

          <h3 style="color: #01645e; margin: 30px 0 15px 0;">👥 أعضاء فريقك:</h3>
          <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 15px 0;">
            <pre style="color: #333; margin: 0; font-family: inherit; white-space: pre-wrap; line-height: 1.6;">${teamMembers}</pre>
          </div>

          <h3 style="color: #01645e; margin: 30px 0 15px 0;">🚀 الخطوات التالية:</h3>
          <ul style="color: #333; line-height: 1.8; padding-right: 20px;">
            <li style="margin-bottom: 10px;">تواصل مع أعضاء فريقك لبدء التخطيط</li>
            <li style="margin-bottom: 10px;">ناقشوا أفكار المشاريع المبتكرة</li>
            <li style="margin-bottom: 10px;">حددوا الأدوار والمسؤوليات</li>
            <li style="margin-bottom: 10px;">ابدأوا في تطوير مشروعكم</li>
          </ul>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'https://hackathon-platform-601l.onrender.com'}/profile" style="background: linear-gradient(135deg, #01645e 0%, #3ab666 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; transition: transform 0.3s;">
              🏠 زيارة الملف الشخصي
            </a>
          </div>

          <div style="background: #e8f5e8; border: 1px solid #3ab666; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <p style="color: #01645e; margin: 0; font-weight: bold; text-align: center;">
              💡 نصيحة: التعاون والتواصل الفعال هما مفتاح نجاح فريقكم!
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 0; font-size: 14px;">
            هل تحتاج مساعدة؟ تواصل معنا على 
            <a href="mailto:support@hackathon.gov.sa" style="color: #3ab666;">support@hackathon.gov.sa</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
