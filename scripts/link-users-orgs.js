const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function linkUsersToOrganizations() {
  try {
    console.log('🔗 Linking users to organizations...\n')
    
    // Get all users without organizations
    const users = await prisma.user.findMany({
      include: {
        organizations: true
      }
    })
    
    // Get all organizations
    const orgs = await prisma.organization.findMany()
    
    console.log(`Users: ${users.length}`)
    console.log(`Organizations: ${orgs.length}\n`)
    
    // Link each user to an organization
    for (const user of users) {
      if (user.organizations.length === 0) {
        // Find or create an organization for this user
        let org
        
        if (user.role === 'master') {
          // Master admin gets the first organization or we create one
          org = orgs.find(o => o.slug === 'default' || o.slug === 'default-org')
        } else if (user.role === 'admin') {
          // Admin users get their own organization
          // Try to find if they already have one
          org = orgs.find(o => o.slug.includes(user.email.split('@')[0]))
          
          if (!org) {
            // Create new organization for this admin
            console.log(`Creating organization for ${user.email}...`)
            org = await prisma.organization.create({
              data: {
                name: user.name || `${user.email.split('@')[0]} Organization`,
                slug: `${user.email.split('@')[0]}-org`.toLowerCase(),
                plan: 'free',
                status: 'active'
              }
            })
            console.log(`✅ Created organization: ${org.name}`)
          }
        }
        
        if (org) {
          // Link user to organization
          console.log(`Linking ${user.email} to ${org.name}...`)
          await prisma.organizationUser.create({
            data: {
              userId: user.id,
              organizationId: org.id,
              role: user.role === 'master' ? 'owner' : user.role === 'admin' ? 'owner' : 'admin',
              isOwner: user.role === 'master' || user.role === 'admin'
            }
          })
          console.log(`✅ Linked ${user.email} to ${org.name}\n`)
        }
      } else {
        console.log(`${user.email} already has ${user.organizations.length} organization(s)`)
      }
    }
    
    console.log('\n✅ Done! All users are now linked to organizations.')
    
    // Verify
    console.log('\n📊 Verification:')
    const verifyUsers = await prisma.user.findMany({
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    })
    
    verifyUsers.forEach(user => {
      console.log(`\n${user.email}:`)
      user.organizations.forEach(orgUser => {
        console.log(`  - ${orgUser.organization.name} (${orgUser.role}${orgUser.isOwner ? ', Owner' : ''})`)
      })
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

linkUsersToOrganizations()
