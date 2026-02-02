import { sql } from './neon-node.js';

async function checkChatSession() {
  try {
    const sessionId = process.argv[2];
    
    if (!sessionId) {
      console.log('Usage: npm run check-chat <session-id>');
      console.log('\nOr checking all sessions...\n');
      
      const allSessions = await sql`
        SELECT id, user_id, title, 
               jsonb_array_length(messages) as message_count,
               created_at
        FROM chat_sessions
        ORDER BY created_at DESC
        LIMIT 10
      `;
      
      console.log(`Found ${allSessions.length} sessions:\n`);
      allSessions.forEach((s: any, i: number) => {
        console.log(`${i + 1}. ID: ${s.id}`);
        console.log(`   User: ${s.user_id}`);
        console.log(`   Title: ${s.title}`);
        console.log(`   Messages: ${s.message_count || 0}`);
        console.log(`   Created: ${s.created_at}`);
        console.log('');
      });
      return;
    }
    
    console.log(`🔍 Checking session: ${sessionId}\n`);
    
    const session = await sql`
      SELECT * FROM chat_sessions WHERE id = ${sessionId}::uuid
    `;
    
    if (session.length === 0) {
      console.log('❌ Session not found');
      return;
    }
    
    const s = session[0];
    console.log('📋 Session details:');
    console.log(`  ID: ${s.id}`);
    console.log(`  User ID: ${s.user_id}`);
    console.log(`  Title: ${s.title}`);
    console.log(`  Created: ${s.created_at}`);
    
    const messages = typeof s.messages === 'string' ? JSON.parse(s.messages) : s.messages;
    console.log(`  Messages count: ${messages?.length || 0}`);
    
    if (messages && messages.length > 0) {
      console.log('\n📝 Messages:');
      messages.slice(0, 5).forEach((m: any, i: number) => {
        console.log(`  ${i + 1}. [${m.role}] ${(m.content || '').substring(0, 50)}...`);
      });
      if (messages.length > 5) {
        console.log(`  ... and ${messages.length - 5} more`);
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

checkChatSession();
