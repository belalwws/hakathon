-- Create Master Admin directly in database
-- Password: Master@2025! (bcrypt hash)
-- You can run this in Neon SQL Editor

INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Platform Master',
  'master@hackpro.cloud',
  '$2a$10$YourBcryptHashHere', -- Replace with actual bcrypt hash
  'master',
  NOW(),
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET role = 'master';

-- To generate the bcrypt hash for 'Master@2025!', run this in Node.js:
-- const bcrypt = require('bcryptjs');
-- console.log(await bcrypt.hash('Master@2025!', 10));
