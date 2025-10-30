/**
 * Create Master Admin - Super Admin for the platform
 * 
 * Run with: npx tsx scripts/create-master-admin.ts
 */

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createMasterAdmin() {
  console.log('\n🔐 Creating Master Admin...\n')

  try {
    const masterEmail = 'master@hackpro.cloud'
    const masterPassword = 'Master@2025!' // Change this!

    // Check if master already exists
    const existing = await prisma.user.findUnique({
      where: { email: masterEmail }
    })

    if (existing) {
      console.log('⚠️  Master admin already exists!')
      console.log(`   Email: ${existing.email}`)
      console.log(`   Role: ${existing.role}`)
      
      if (existing.role !== 'master') {
        console.log('\n🔄 Updating role to master...')
        await prisma.user.update({
          where: { id: existing.id },
          data: { role: 'master' }
        })
        console.log('✅ Role updated to master')
      }
      
      return existing
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(masterPassword, 10)

    // Create master admin
    const master = await prisma.user.create({
      data: {
        email: masterEmail,
        password: hashedPassword,
        name: 'Master Admin',
        role: 'master',
        isActive: true,
        emailVerified: true,
      }
    })

    console.log('✅ Master Admin created successfully!\n')
    console.log('═'.repeat(50))
    console.log('🔑 Master Admin Credentials:')
    console.log('═'.repeat(50))
    console.log(`Email:    ${masterEmail}`)
    console.log(`Password: ${masterPassword}`)
    console.log(`ID:       ${master.id}`)
    console.log('═'.repeat(50))
    console.log('\n⚠️  IMPORTANT: Change the password after first login!')
    console.log('⚠️  Store these credentials securely!\n')

    return master

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createMasterAdmin()
