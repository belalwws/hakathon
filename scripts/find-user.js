const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function findUser() {
  try {
    console.log('🔍 Searching for admin@hackathon.gov.sa...\n')
    
    const user = await prisma.user.findUnique({
      where: {
        email: 'admin@hackathon.gov.sa'
      },
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    })
    
    if (user) {
      console.log('✅ User found!\n')
      console.log('Name:', user.name)
      console.log('Email:', user.email)
      console.log('Role:', user.role)
      console.log('Active:', user.isActive)
      console.log('Created:', user.createdAt)
      console.log('\nOrganizations:', user.organizations.length)
      
      if (user.organizations.length > 0) {
        user.organizations.forEach(orgUser => {
          console.log(`  - ${orgUser.organization.name}`)
          console.log(`    Role: ${orgUser.role}${orgUser.isOwner ? ' (Owner)' : ''}`)
          console.log(`    Plan: ${orgUser.organization.plan}`)
        })
      } else {
        console.log('  ⚠️ User has no organizations!')
      }
    } else {
      console.log('❌ User not found in database!')
      console.log('\n🔍 Searching for similar emails...')
      
      const allUsers = await prisma.user.findMany({
        select: {
          email: true,
          name: true,
          role: true
        }
      })
      
      console.log(`\nFound ${allUsers.length} users total:`)
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.role}) - ${u.name}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

findUser()
