const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verifyRegistration(email) {
  try {
    console.log('\n🔍 Verifying registration for:', email)
    console.log('='.repeat(60))

    // Get user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!user) {
      console.log('❌ User not found!')
      return
    }

    console.log('\n✅ USER FOUND:')
    console.log('  - ID:', user.id)
    console.log('  - Name:', user.name)
    console.log('  - Email:', user.email)
    console.log('  - Role:', user.role)
    console.log('  - Created:', user.createdAt)

    if (user.organizations && user.organizations.length > 0) {
      console.log('\n🏢 ORGANIZATIONS:')
      user.organizations.forEach((orgUser, index) => {
        const org = orgUser.organization
        console.log(`\n  Organization #${index + 1}:`)
        console.log('    - Name:', org.name)
        console.log('    - Slug:', org.slug)
        console.log('    - Plan:', org.plan)
        console.log('    - Active:', org.isActive)
        console.log('    - Is Owner:', orgUser.isOwner)
        console.log('    - Joined:', orgUser.createdAt)
      })
    } else {
      console.log('\n❌ No organizations found for this user')
    }

    // Count hackathons for this organization
    if (user.organizations.length > 0) {
      const orgId = user.organizations[0].organization.id
      const hackathonCount = await prisma.hackathon.count({
        where: { organizationId: orgId }
      })
      console.log('\n📊 STATISTICS:')
      console.log('  - Hackathons created:', hackathonCount)
    }

    console.log('\n' + '='.repeat(60))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.log('Usage: node verify-registration.js <email>')
  console.log('Example: node verify-registration.js test@example.com')
  process.exit(1)
}

verifyRegistration(email)
