#!/usr/bin/env node

/**
 * Database Backup Script
 * Creates a JSON backup of all important data
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function backupDatabase() {
  try {
    console.log('📦 Starting database backup...')

    const backup = {
      timestamp: new Date().toISOString(),
      data: {}
    }

    // Backup Users
    console.log('👥 Backing up users...')
    backup.data.users = await prisma.user.findMany()
    console.log(`✅ Backed up ${backup.data.users.length} users`)

    // Backup Hackathons
    console.log('🏆 Backing up hackathons...')
    backup.data.hackathons = await prisma.hackathon.findMany()
    console.log(`✅ Backed up ${backup.data.hackathons.length} hackathons`)

    // Backup Participants
    console.log('👨‍💻 Backing up participants...')
    backup.data.participants = await prisma.participant.findMany()
    console.log(`✅ Backed up ${backup.data.participants.length} participants`)

    // Backup Judge Applications
    console.log('⚖️ Backing up judge applications...')
    backup.data.judgeApplications = await prisma.judgeApplication.findMany()
    console.log(`✅ Backed up ${backup.data.judgeApplications.length} judge applications`)

    // Backup Judge Form Designs
    console.log('🎨 Backing up judge form designs...')
    backup.data.judgeFormDesigns = await prisma.judgeFormDesign.findMany()
    console.log(`✅ Backed up ${backup.data.judgeFormDesigns.length} judge form designs`)

    // Backup Feedback Forms
    console.log('📝 Backing up feedback forms...')
    backup.data.feedbackForms = await prisma.hackathonFeedbackForm.findMany()
    console.log(`✅ Backed up ${backup.data.feedbackForms.length} feedback forms`)

    // Backup Feedbacks
    console.log('💬 Backing up feedbacks...')
    backup.data.feedbacks = await prisma.hackathonFeedback.findMany()
    console.log(`✅ Backed up ${backup.data.feedbacks.length} feedbacks`)

    // Save to file
    const backupDir = path.join(process.cwd(), 'data', 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const filename = `backup-${new Date().toISOString().replace(/:/g, '-')}.json`
    const filepath = path.join(backupDir, filename)

    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2))

    console.log('')
    console.log('✅ Backup completed successfully!')
    console.log(`📁 File: ${filepath}`)
    console.log(`📊 Total records: ${
      backup.data.users.length +
      backup.data.hackathons.length +
      backup.data.participants.length +
      backup.data.judgeApplications.length +
      backup.data.judgeFormDesigns.length +
      backup.data.feedbackForms.length +
      backup.data.feedbacks.length
    }`)

  } catch (error) {
    console.error('❌ Backup failed:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

backupDatabase()

