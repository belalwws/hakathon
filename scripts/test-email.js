// Test email sending functionality
// Usage: node scripts/test-email.js test@example.com
// This script requires the dev server to be running

async function testEmailViaAPI(recipient) {
  console.log('\n📧 Testing email via registration API...')
  console.log('='.repeat(60))
  
  try {
    // Create a test user registration
    const testData = {
      name: 'مستخدم تجريبي للاختبار',
      email: recipient,
      password: 'TestPass123!@#',
      organizationName: `مؤسسة الاختبار ${new Date().toLocaleTimeString('ar-SA')}`,
      organizationSlug: `test-org-${Date.now()}`
    }
    
    console.log('📝 Creating test registration...')
    console.log('Email:', testData.email)
    console.log('Organization:', testData.organizationName)
    
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('\n✅ Registration successful!')
      console.log('User ID:', data.user?.id)
      console.log('Organization:', data.organization?.name)
      console.log('Email Sent:', data.emailSent ? '✅ YES' : '❌ NO')
      
      if (data.emailSent) {
        console.log('\n🎉 Welcome email was sent!')
        console.log('📬 Check inbox:', recipient)
        console.log('Subject: مرحباً بك في HackPro SaaS')
      } else {
        console.log('\n⚠️  Email was NOT sent')
        console.log('Reason: SMTP not configured')
        console.log('👉 See EMAIL_SETUP_GUIDE.md for configuration')
      }
      
      // Clean up instructions
      console.log('\n🗑️  To clean up test user:')
      console.log(`node scripts/delete-test-user.js ${recipient}`)
      
    } else {
      console.log('\n❌ Registration failed!')
      console.log('Error:', data.error || data.message)
      
      if (data.error?.includes('مستخدم بالفعل') || data.error?.includes('already exists')) {
        console.log('\n💡 Email already registered. Try a different email or delete existing user:')
        console.log(`node scripts/delete-test-user.js ${recipient}`)
      }
    }
    
  } catch (error) {
    console.error('\n❌ Test failed!')
    console.error('Error:', error.message)
    console.error('\nMake sure:')
    console.error('1. Dev server is running (npm run dev)')
    console.error('2. Server is accessible at http://localhost:3001')
  }
  
  console.log('='.repeat(60))
}

async function checkServerStatus() {
  console.log('\n🔍 Checking server status...')
  console.log('='.repeat(60))
  
  try {
    const response = await fetch('http://localhost:3001/health')
    
    if (response.ok) {
      console.log('✅ Server is running on port 3001')
      return true
    } else {
      console.log('⚠️  Server returned:', response.status)
      return false
    }
  } catch (error) {
    console.log('❌ Server is not running!')
    console.log('\nPlease start the dev server first:')
    console.log('  npm run dev')
    console.log('\nThen run this script again.')
    return false
  } finally {
    console.log('='.repeat(60))
  }
}

async function checkEmailConfig() {
  console.log('\n🔍 Checking email configuration...')
  console.log('='.repeat(60))
  
  console.log('Environment Variables:')
  console.log('- GMAIL_USER:', process.env.GMAIL_USER ? '✅ SET' : '❌ NOT SET')
  console.log('- GMAIL_PASS:', process.env.GMAIL_PASS ? '✅ SET (hidden)' : '❌ NOT SET')
  console.log('- SMTP_HOST:', process.env.SMTP_HOST ? '✅ SET' : '❌ NOT SET')
  console.log('- MAIL_FROM:', process.env.MAIL_FROM || '(using default)')
  
  if (!process.env.GMAIL_USER && !process.env.SMTP_HOST) {
    console.log('\n⚠️  WARNING: Email not configured!')
    console.log('\nThe registration will succeed but NO email will be sent.')
    console.log('\nTo enable email sending:')
    console.log('1. Create .env.local file in project root')
    console.log('2. Add Gmail credentials:')
    console.log('   GMAIL_USER="your-email@gmail.com"')
    console.log('   GMAIL_PASS="your-app-password"')
    console.log('3. Restart the dev server')
    console.log('\n👉 See EMAIL_SETUP_GUIDE.md for detailed instructions')
  } else {
    console.log('\n✅ Email configuration found')
    console.log('Provider:', process.env.GMAIL_USER ? 'Gmail' : 'SMTP')
  }
  
  console.log('='.repeat(60))
}

// Main execution
async function main() {
  const recipient = process.argv[2]
  
  console.log('\n' + '='.repeat(60))
  console.log('  HackPro SaaS - Email Testing Tool')
  console.log('='.repeat(60))
  
  if (!recipient) {
    console.log('\n❌ No recipient email provided!')
    console.log('\nUsage:')
    console.log('  node scripts/test-email.js <email>')
    console.log('\nExample:')
    console.log('  node scripts/test-email.js test@example.com')
    console.log('\nWhat this does:')
    console.log('1. Creates a test user registration')
    console.log('2. Triggers welcome email sending')
    console.log('3. Reports whether email was sent')
    console.log('\n⚠️  Requirements:')
    console.log('- Dev server must be running (npm run dev)')
    console.log('- Use a unique email (or delete existing test users first)')
    process.exit(1)
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(recipient)) {
    console.log('\n❌ Invalid email format!')
    console.log('Please provide a valid email address')
    process.exit(1)
  }
  
  console.log('\n📬 Test Recipient:', recipient)
  
  // Check email configuration
  await checkEmailConfig()
  
  // Check if server is running
  const serverRunning = await checkServerStatus()
  if (!serverRunning) {
    process.exit(1)
  }
  
  // Run test
  await testEmailViaAPI(recipient)
  
  console.log('\n✅ Test complete!')
  console.log('\n💡 Next steps:')
  console.log('1. Check recipient inbox (and spam folder)')
  console.log('2. Check server console logs for details')
  console.log('3. Clean up test user if needed')
  console.log('4. Configure SMTP if email was not sent')
  
  process.exit(0)
}

main().catch(error => {
  console.error('\n💥 Unexpected error:', error)
  process.exit(1)
})
