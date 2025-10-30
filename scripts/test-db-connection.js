const { PrismaClient } = require('@prisma/client')

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...')
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set')
    console.log('Please set DATABASE_URL to your Neon PostgreSQL connection string')
    process.exit(1)
  }
  
  console.log('🔗 Database URL:', process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@'))
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

  try {
    // Test basic connection
    console.log('⚡ Testing basic connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Check existing tables
    console.log('📋 Checking existing tables...')
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    
    console.log('📊 Found tables:')
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`)
    })
    
    // Check if supervisor tables exist
    const supervisorTables = tables.filter(t => 
      t.table_name === 'supervisors' || t.table_name === 'supervisor_invitations'
    )
    
    if (supervisorTables.length === 0) {
      console.log('⚠️  Supervisor tables not found - migration needed')
    } else if (supervisorTables.length === 1) {
      console.log('⚠️  Only one supervisor table found - partial migration')
    } else {
      console.log('✅ Both supervisor tables found')
    }
    
    // Check UserRole enum
    console.log('🔍 Checking UserRole enum...')
    try {
      const enumValues = await prisma.$queryRaw`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
        ORDER BY enumlabel
      `
      
      console.log('📝 UserRole enum values:')
      enumValues.forEach(value => {
        console.log(`   - ${value.enumlabel}`)
      })
      
      const hasSuper = enumValues.some(v => v.enumlabel === 'supervisor')
      if (hasSuper) {
        console.log('✅ UserRole enum includes supervisor')
      } else {
        console.log('⚠️  UserRole enum does NOT include supervisor - migration needed')
      }
    } catch (error) {
      console.log('❌ Error checking UserRole enum:', error.message)
    }
    
    // Test a simple query
    console.log('🧪 Testing simple query...')
    const userCount = await prisma.user.count()
    console.log(`✅ Found ${userCount} users in database`)
    
    console.log('🎉 Database connection test completed successfully!')
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message)
    console.error('Full error:', error)
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Suggestion: Check your DATABASE_URL hostname')
    } else if (error.message.includes('authentication failed')) {
      console.log('💡 Suggestion: Check your DATABASE_URL username/password')
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('💡 Suggestion: Check your DATABASE_URL database name')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
if (require.main === module) {
  testDatabaseConnection()
    .then(() => {
      console.log('✅ Test completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Test failed:', error)
      process.exit(1)
    })
}

module.exports = { testDatabaseConnection }
