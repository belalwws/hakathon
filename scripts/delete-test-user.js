const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function deleteUserAndOrg(email) {
  try {
    console.log('\n🗑️  Deleting user and organization for:', email)
    console.log('='.repeat(60))

    // Get user with organization
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

    console.log('Found user:', user.name)

    if (user.organizations.length > 0) {
      const org = user.organizations[0].organization
      console.log('Found organization:', org.name)

      // Delete in transaction
      await prisma.$transaction(async (tx) => {
        // 1. Delete OrganizationUser links
        await tx.organizationUser.deleteMany({
          where: { userId: user.id }
        })
        console.log('✅ Deleted OrganizationUser links')

        // 2. Delete hackathons for this organization
        const deletedHackathons = await tx.hackathon.deleteMany({
          where: { organizationId: org.id }
        })
        console.log(`✅ Deleted ${deletedHackathons.count} hackathons`)

        // 3. Delete organization
        await tx.organization.delete({
          where: { id: org.id }
        })
        console.log('✅ Deleted organization')

        // 4. Delete user
        await tx.user.delete({
          where: { id: user.id }
        })
        console.log('✅ Deleted user')
      })

      console.log('\n✅ All data deleted successfully!')
    } else {
      // Just delete user if no organization
      await prisma.user.delete({
        where: { id: user.id }
      })
      console.log('✅ User deleted (no organization found)')
    }

    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.log('Usage: node delete-test-user.js <email>')
  console.log('Example: node delete-test-user.js test@example.com')
  process.exit(1)
}

// Confirm deletion
console.log('\n⚠️  WARNING: This will permanently delete the user and their organization!')
console.log('Email:', email)
console.log('\nPress Ctrl+C to cancel, or wait 3 seconds to continue...\n')

setTimeout(() => {
  deleteUserAndOrg(email)
}, 3000)
