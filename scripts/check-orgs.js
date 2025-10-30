const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkOrganizations() {
  try {
    console.log('🔍 Checking organizations...\n')
    
    const orgs = await prisma.organization.findMany({
      include: {
        users: {
          include: {
            user: true
          }
        }
      }
    })
    
    console.log(`🏢 Total organizations: ${orgs.length}\n`)
    
    if (orgs.length > 0) {
      orgs.forEach((org, index) => {
        console.log(`\n${index + 1}. ${org.name}`)
        console.log(`   Slug: ${org.slug}`)
        console.log(`   Plan: ${org.plan}`)
        console.log(`   Status: ${org.status}`)
        console.log(`   Users: ${org.users.length}`)
        if (org.users.length > 0) {
          org.users.forEach(orgUser => {
            console.log(`     - ${orgUser.user.email} (${orgUser.role}${orgUser.isOwner ? ', Owner' : ''})`)
          })
        }
      })
    } else {
      console.log('❌ No organizations found!')
    }
    
    // Check users without organizations
    console.log('\n\n🔍 Checking for users without organizations...')
    const users = await prisma.user.findMany({
      include: {
        organizations: true
      }
    })
    
    const usersWithoutOrg = users.filter(u => u.organizations.length === 0)
    console.log(`\n⚠️ Users without organizations: ${usersWithoutOrg.length}`)
    
    if (usersWithoutOrg.length > 0) {
      usersWithoutOrg.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkOrganizations()
