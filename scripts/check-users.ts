import { sql } from './neon-node.js';

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...\n');
    
    const users = await sql`SELECT id, email, name, created_at FROM users ORDER BY created_at DESC`;
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log(`✅ Found ${users.length} user(s):\n`);
    users.forEach((user: any, index: number) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('');
    });
  } catch (error: any) {
    console.error('❌ Error checking users:', error.message);
    process.exit(1);
  }
}

checkUsers();
