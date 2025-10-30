const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function createHackathonGovUser() {
  try {
    console.log('🔧 Creating admin@hackathon.gov.sa...\n')
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@hackathon.gov.sa' }
    })
    
    if (existingUser) {
      console.log('⚠️ User already exists!')
      return
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@123', 10)
    
    // Create organization first
    console.log('1️⃣ Creating organization...')
    const organization = await prisma.organization.create({
      data: {
        name: 'هاكاثون الابتكار الحكومي',
        slug: 'hackathon-gov',
        plan: 'professional',
        status: 'active',
        maxHackathons: 10,
        maxUsers: 100,
        maxParticipants: 500,
        billingEmail: 'admin@hackathon.gov.sa'
      }
    })
    console.log('✅ Organization created:', organization.name)
    
    // Create user
    console.log('\n2️⃣ Creating user...')
    const user = await prisma.user.create({
      data: {
        name: 'مدير الهاكاثون الحكومي',
        email: 'admin@hackathon.gov.sa',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        emailVerified: true
      }
    })
    console.log('✅ User created:', user.email)
    
    // Link user to organization
    console.log('\n3️⃣ Linking user to organization...')
    await prisma.organizationUser.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: 'owner',
        isOwner: true
      }
    })
    console.log('✅ User linked as Owner')
    
    console.log('\n🎉 Success! User created and ready to use.')
    console.log('\n📋 Login credentials:')
    console.log('   Email: admin@hackathon.gov.sa')
    console.log('   Password: Admin@123')
    console.log('   Dashboard: http://localhost:3001/admin/dashboard')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createHackathonGovUser()
