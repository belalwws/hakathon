const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('🔍 Checking database for users...\n')
    
    const users = await prisma.user.findMany({
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    })
    
    console.log(`📊 Total users in database: ${users.length}\n`)
    
    if (users.length > 0) {
      console.log('👥 Users found:')
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name || 'No name'}`)
        console.log(`   Email: ${user.email}`)
        console.log(`   Role: ${user.role}`)
        console.log(`   Active: ${user.isActive}`)
        
        if (user.organizations && user.organizations.length > 0) {
          console.log(`   Organizations (${user.organizations.length}):`)
          user.organizations.forEach(orgUser => {
            console.log(`     - ${orgUser.organization.name}`)
            console.log(`       Role: ${orgUser.role}${orgUser.isOwner ? ' (Owner)' : ''}`)
            console.log(`       Plan: ${orgUser.organization.plan}`)
            console.log(`       Status: ${orgUser.organization.status}`)
          })
        } else {
          console.log(`   Organizations: None`)
        }
        
        console.log(`   Created: ${user.createdAt}`)
      })
    } else {
      console.log('❌ No users found in database!')
      console.log('\n💡 This is a multi-tenant system where:')
      console.log('   - Each signup creates an Admin user with their own organization')
      console.log('   - Each Admin can add supervisors/judges/participants to their org')
      console.log('   - All organizations are isolated from each other')
      console.log('\n📝 To see users, someone needs to register first!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
