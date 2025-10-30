import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendBulkEmails } from '@/lib/mailer'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params
    const userRole = request.headers.get("x-user-role")
    const userId = request.headers.get("x-user-id")

    // التحقق من الصلاحيات
    if (!["supervisor", "admin"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    if (userRole === "supervisor") {
      const assignment = await prisma.supervisor.findFirst({
        where: { userId: userId!, hackathonId: hackathonId, isActive: true }
      })
      if (!assignment) {
        return NextResponse.json({ error: "غير مصرح - لست مشرفاً على هذا الهاكاثون" }, { status: 403 })
      }
    }

    console.log(`🚀 Starting team creation for hackathon: ${hackathonId}`)

    // ============================================
    // 1. مسح الفرق القديمة
    // ============================================
    const existingCount = await prisma.team.count({ where: { hackathonId } })
    if (existingCount > 0) {
      console.log(`⚠️ Deleting ${existingCount} existing teams...`)
      await prisma.participant.updateMany({
        where: { hackathonId, teamId: { not: null } },
        data: { teamId: null, teamRole: null }
      })
      await prisma.team.deleteMany({ where: { hackathonId } })
      console.log(`✅ Deleted ${existingCount} teams`)
    }

    // ============================================
    // 2. جلب البيانات
    // ============================================
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { id: true, title: true, settings: true }
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'الهاكاثون غير موجود' }, { status: 404 })
    }

    const settings = (hackathon.settings as any)?.teamFormationSettings || {
      teamSize: 8,
      minTeamSize: 7,
      maxTeamSize: 9,
      allowPartialTeams: true,
      rules: []
    }

    const idealSize = settings.teamSize || 8
    const minSize = settings.minTeamSize || 7
    const maxSize = settings.maxTeamSize || 9
    const rules = settings.rules || []

    // جلب المشاركين المقبولين
    const participants = await prisma.participant.findMany({
      where: { hackathonId, status: 'approved' as any, teamId: null },
      include: {
        user: { select: { id: true, name: true, email: true, preferredRole: true } },
        hackathon: { select: { title: true } }
      }
    })

    if (participants.length === 0) {
      return NextResponse.json({ error: 'لا توجد مشاركين مقبولين' }, { status: 400 })
    }

    console.log(`👥 ${participants.length} participants found`)

    // ============================================
    // 3. تجميع المشاركين حسب الأدوار
    // ============================================
    const roleGroups: { [role: string]: typeof participants } = {}
    participants.forEach(p => {
      const role = p.user.preferredRole || 'غير محدد'
      if (!roleGroups[role]) roleGroups[role] = []
      roleGroups[role].push(p)
    })

    console.log('📊 Role distribution:')
    Object.entries(roleGroups).forEach(([role, members]) => {
      console.log(`   - ${role}: ${members.length}`)
    })

    // ============================================
    // 4. حساب عدد الفرق
    // ============================================
    let numTeams: number

    const onePerTeamRules = rules.filter((r: any) => r.distribution === 'one_per_team')
    
    if (onePerTeamRules.length > 0) {
      // حساب بناءً على قاعدة "واحد لكل فريق"
      const counts = onePerTeamRules.map((rule: any) => {
        const count = roleGroups[rule.value]?.length || 0
        const max = rule.maxPerTeam || 1
        return Math.floor(count / max)
      })
      numTeams = Math.min(...counts)
      console.log(`📊 ${numTeams} teams (based on one_per_team rules)`)
    } else {
      // حساب عادي
      numTeams = Math.ceil(participants.length / idealSize)
      console.log(`📊 ${numTeams} teams (based on team size ${idealSize})`)
    }

    // تأكد أن عدد الفرق معقول
    const maxPossible = Math.floor(participants.length / minSize)
    if (numTeams > maxPossible) {
      numTeams = maxPossible
      console.log(`📊 Adjusted to ${numTeams} teams (max with minSize=${minSize})`)
    }

    if (numTeams === 0) {
      return NextResponse.json({ 
        error: `عدد المشاركين قليل. الحد الأدنى: ${minSize}`
      }, { status: 400 })
    }

    // ============================================
    // 5. إنشاء الفرق وتوزيع المشاركين
    // ============================================
    const teams: Array<{ name: string; number: number; members: typeof participants }> = []
    for (let i = 0; i < numTeams; i++) {
      teams.push({ name: `الفريق ${i + 1}`, number: i + 1, members: [] })
    }

    const assigned = new Set<string>()

    // أولاً: توزيع حسب قواعد "واحد لكل فريق"
    if (onePerTeamRules.length > 0) {
      const sorted = onePerTeamRules.sort((a: any, b: any) => (a.priority || 999) - (b.priority || 999))
      
      console.log('🔄 Distributing with one_per_team rules...')
      for (const rule of sorted) {
        const role = rule.value
        const max = rule.maxPerTeam || 1
        const members = roleGroups[role] || []
        
        console.log(`   - ${role}: distributing ${members.length} members`)
        
        let idx = 0
        for (let round = 0; round < max; round++) {
          for (let t = 0; t < numTeams; t++) {
            if (idx >= members.length) break
            const member = members[idx]
            if (!assigned.has(member.id)) {
              teams[t].members.push(member)
              assigned.add(member.id)
              idx++
            }
          }
        }
      }
    }

    // ثانياً: توزيع الباقي بالتساوي
    const remaining = participants.filter(p => !assigned.has(p.id))
    console.log(`🔄 Distributing ${remaining.length} remaining participants...`)
    
    let teamIdx = 0
    for (const member of remaining) {
      teams[teamIdx % numTeams].members.push(member)
      assigned.add(member.id)
      teamIdx++
    }

    // ============================================
    // 6. حذف الفرق الصغيرة جداً
    // ============================================
    const validTeams = teams.filter(t => {
      if (settings.allowPartialTeams) return t.members.length > 0
      return t.members.length >= minSize
    })

    console.log(`✅ Final: ${validTeams.length} valid teams`)
    validTeams.forEach(t => {
      console.log(`   - ${t.name}: ${t.members.length} members`)
    })

    // ============================================
    // 7. حفظ في قاعدة البيانات
    // ============================================
    const createdTeams: any[] = []
    const emails: any[] = []

    for (const team of validTeams) {
      if (team.members.length === 0) continue

      const dbTeam = await prisma.team.create({
        data: {
          name: team.name,
          teamNumber: team.number,
          hackathonId: hackathonId,
          status: 'active'
        }
      })

      // تعيين المشاركين
      for (const member of team.members) {
        await prisma.participant.update({
          where: { id: member.id },
          data: { 
            teamId: dbTeam.id,
            teamRole: member.user.preferredRole || 'عضو فريق'
          }
        })
      }

      createdTeams.push(dbTeam)

      // تحضير الإيميلات
      const membersText = team.members
        .map(m => `${m.user.name} - ${m.user.preferredRole || 'عضو'}`)
        .join('\n')

      for (const member of team.members) {
        emails.push({
          to: member.user.email,
          subject: `🎉 تم تعيينك في ${team.name} - ${hackathon.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
              <h2 style="color: #01645e;">مرحباً ${member.user.name}!</h2>
              <p>تم تعيينك في <strong>${team.name}</strong></p>
              <p>دورك: <strong>${member.user.preferredRole || 'عضو فريق'}</strong></p>
              <h3 style="color: #3ab666;">أعضاء الفريق:</h3>
              <pre style="white-space: pre-line;">${membersText}</pre>
              <p style="margin-top: 20px;">تواصل مع أعضاء فريقك وابدأوا العمل! 🚀</p>
            </div>
          `,
          text: `مرحباً ${member.user.name}!\nتم تعيينك في ${team.name}\nدورك: ${member.user.preferredRole || 'عضو'}\n\nأعضاء الفريق:\n${membersText}`
        })
      }
    }

    // ============================================
    // 8. إرسال الإيميلات
    // ============================================
    const emailResults = await sendBulkEmails(emails, {
      batchSize: 5,
      delayBetweenBatches: 3000
    })

    const totalMembers = createdTeams.reduce((sum, t) => sum + t.members?.length || 0, 0)
    const unassigned = participants.length - assigned.size

    return NextResponse.json({
      message: `تم تكوين ${createdTeams.length} فريق بنجاح`,
      teams: createdTeams.length,
      totalParticipants: participants.length,
      assignedParticipants: assigned.size,
      unassignedParticipants: unassigned,
      emailStats: {
        sent: emailResults.sent,
        failed: emailResults.failed,
        total: emailResults.total
      },
      warning: unassigned > 0 ? `⚠️ ${unassigned} مشاركين لم يتم تعيينهم` : null
    })

  } catch (error) {
    console.error('Error in team creation:', error)
    return NextResponse.json({ error: 'خطأ في تكوين الفرق' }, { status: 500 })
  }
}
