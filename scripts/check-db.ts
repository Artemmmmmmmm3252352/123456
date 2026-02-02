import { sql } from './neon-node.js';

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Test connection
    const result = await sql`SELECT version()`;
    console.log('✅ Connected to PostgreSQL:', result[0].version);
    
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('\n📊 Existing tables:');
    if (tables.length === 0) {
      console.log('  ❌ No tables found!');
    } else {
      tables.forEach((table: any) => {
        console.log(`  ✅ ${table.table_name}`);
      });
    }
    
    // Check for users table specifically
    const usersTable = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `;
    
    console.log('\n👤 Users table exists:', usersTable[0].exists);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

checkDatabase();
