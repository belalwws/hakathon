// Generate bcrypt hash for Master password
const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'Master@2025!';
  const hash = await bcrypt.hash(password, 10);
  console.log('\n🔐 Bcrypt Hash for Master@2025!:');
  console.log(hash);
  console.log('\n📋 Copy this hash and use it in Neon SQL Editor:');
  console.log(`\nINSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt")`);
  console.log(`VALUES (`);
  console.log(`  gen_random_uuid(),`);
  console.log(`  'Platform Master',`);
  console.log(`  'master@hackpro.cloud',`);
  console.log(`  '${hash}',`);
  console.log(`  'master',`);
  console.log(`  NOW(),`);
  console.log(`  NOW()`);
  console.log(`)`);
  console.log(`ON CONFLICT (email) DO UPDATE SET role = 'master', password = '${hash}';`);
  console.log('\n✅ Copy the entire INSERT statement above and run it in Neon SQL Editor');
  console.log('🌐 https://console.neon.tech/');
}

generateHash().catch(console.error);
