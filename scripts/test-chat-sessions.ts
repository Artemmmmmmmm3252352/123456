import { sql } from '../src/lib/neon.js';

async function testChatSessions() {
  try {
    console.log('🔍 Testing chat_sessions table...\n');
    
    // Check table structure
    console.log('📋 Checking table structure...');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'chat_sessions'
      ORDER BY ordinal_position
    `;
    
    console.log('Columns:');
    columns.forEach((col: any) => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check if there are any sessions
    console.log('\n📊 Checking existing sessions...');
    const sessions = await sql`SELECT id, user_id, title, created_at FROM chat_sessions LIMIT 5`;
    console.log(`Found ${sessions.length} sessions:`);
    sessions.forEach((s: any, i: number) => {
      console.log(`  ${i + 1}. ID: ${s.id}`);
      console.log(`     User ID: ${s.user_id}`);
      console.log(`     Title: ${s.title}`);
      console.log(`     Created: ${s.created_at}`);
    });
    
    // Test creating a session
    console.log('\n🧪 Testing session creation...');
    const testUserId = '00000000-0000-0000-0000-000000000000'; // Test UUID
    const testMessages = [
      { role: 'user', content: 'Test message', type: 'text' },
      { role: 'assistant', content: 'Test response', type: 'text' }
    ];
    
    try {
      const result = await sql`
        INSERT INTO chat_sessions (user_id, title, messages, created_at)
        VALUES (${testUserId}::uuid, ${'Test Session'}, ${JSON.stringify(testMessages)}::jsonb, ${new Date().toISOString()})
        RETURNING id, title
      `;
      console.log('✅ Test session created:', result[0].id);
      
      // Clean up test session
      await sql`DELETE FROM chat_sessions WHERE id = ${result[0].id}`;
      console.log('✅ Test session deleted');
    } catch (error: any) {
      console.error('❌ Failed to create test session:', error.message);
    }
    
    // Check indexes
    console.log('\n📇 Checking indexes...');
    const indexes = await sql`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'chat_sessions'
    `;
    indexes.forEach((idx: any) => {
      console.log(`  ✅ ${idx.indexname}`);
    });
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

testChatSessions();
