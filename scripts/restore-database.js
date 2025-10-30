#!/usr/bin/env node

/**
 * Database Restore Script
 * Restores data from a JSON backup file
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function restoreDatabase(backupFile) {
  try {
    console.log('📦 Starting database restore...')

    // Read backup file
    const backupPath = path.join(process.cwd(), 'data', 'backups', backupFile)
    
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Backup file not found: ${backupPath}`)
      process.exit(1)
    }

    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'))
    console.log(`📅 Backup date: ${backup.timestamp}`)

    // Restore Users
    if (backup.data.users && backup.data.users.length > 0) {
      console.log(`👥 Restoring ${backup.data.users.length} users...`)
      for (const user of backup.data.users) {
        await prisma.user.upsert({
          where: { id: user.id },
          update: user,
          create: user
        })
      }
      console.log('✅ Users restored')
    }

    // Restore Hackathons
    if (backup.data.hackathons && backup.data.hackathons.length > 0) {
      console.log(`🏆 Restoring ${backup.data.hackathons.length} hackathons...`)
      for (const hackathon of backup.data.hackathons) {
        await prisma.hackathon.upsert({
          where: { id: hackathon.id },
          update: hackathon,
          create: hackathon
        })
      }
      console.log('✅ Hackathons restored')
    }

    // Restore Participants
    if (backup.data.participants && backup.data.participants.length > 0) {
      console.log(`👨‍💻 Restoring ${backup.data.participants.length} participants...`)
      for (const participant of backup.data.participants) {
        await prisma.participant.upsert({
          where: { id: participant.id },
          update: participant,
          create: participant
        })
      }
      console.log('✅ Participants restored')
    }

    // Restore Judge Applications
    if (backup.data.judgeApplications && backup.data.judgeApplications.length > 0) {
      console.log(`⚖️ Restoring ${backup.data.judgeApplications.length} judge applications...`)
      for (const app of backup.data.judgeApplications) {
        await prisma.judgeApplication.upsert({
          where: { id: app.id },
          update: app,
          create: app
        })
      }
      console.log('✅ Judge applications restored')
    }

    // Restore Judge Form Designs
    if (backup.data.judgeFormDesigns && backup.data.judgeFormDesigns.length > 0) {
      console.log(`🎨 Restoring ${backup.data.judgeFormDesigns.length} judge form designs...`)
      for (const design of backup.data.judgeFormDesigns) {
        await prisma.judgeFormDesign.upsert({
          where: { id: design.id },
          update: design,
          create: design
        })
      }
      console.log('✅ Judge form designs restored')
    }

    // Restore Feedback Forms
    if (backup.data.feedbackForms && backup.data.feedbackForms.length > 0) {
      console.log(`📝 Restoring ${backup.data.feedbackForms.length} feedback forms...`)
      for (const form of backup.data.feedbackForms) {
        await prisma.hackathonFeedbackForm.upsert({
          where: { id: form.id },
          update: form,
          create: form
        })
      }
      console.log('✅ Feedback forms restored')
    }

    // Restore Feedbacks
    if (backup.data.feedbacks && backup.data.feedbacks.length > 0) {
      console.log(`💬 Restoring ${backup.data.feedbacks.length} feedbacks...`)
      for (const feedback of backup.data.feedbacks) {
        await prisma.hackathonFeedback.upsert({
          where: { id: feedback.id },
          update: feedback,
          create: feedback
        })
      }
      console.log('✅ Feedbacks restored')
    }

    console.log('')
    console.log('✅ Restore completed successfully!')

  } catch (error) {
    console.error('❌ Restore failed:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Get backup file from command line argument
const backupFile = process.argv[2]

if (!backupFile) {
  console.error('❌ Please provide backup file name')
  console.log('Usage: node scripts/restore-database.js <backup-file.json>')
  process.exit(1)
}

restoreDatabase(backupFile)

