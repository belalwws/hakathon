// Simple script to call /api/setup-master
const http = require('http');

const data = JSON.stringify({
  secret: 'hackpro-master-secret-2025'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/setup-master',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🔐 Creating Master Admin via API...\n');

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:');
    try {
      const parsed = JSON.parse(responseData);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n✅ Master admin created successfully!');
        console.log('\n📧 Email: master@hackpro.cloud');
        console.log('🔑 Password: Master@2025!');
        console.log('\n🌐 Login at: http://localhost:3000/login');
      } else {
        console.log('\n❌ Error:', parsed.error || 'Unknown error');
      }
    } catch (e) {
      console.log(responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  console.log('\n⚠️  Make sure dev server is running: npm run dev');
});

req.write(data);
req.end();
