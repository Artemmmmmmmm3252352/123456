import { sql } from '../src/lib/neon.js';

async function createTables() {
  try {
    console.log('🚀 Creating database tables...');
    
    // Enable UUID extension
    console.log('📦 Enabling UUID extension...');
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    console.log('  ✅ UUID extension enabled');
    
    // Create users table
    console.log('👤 Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        role VARCHAR(50) DEFAULT 'user',
        balance INTEGER DEFAULT 0,
        quota JSONB DEFAULT '{"used": 0, "lastReset": 0}'::jsonb,
        inventory JSONB DEFAULT '[]'::jsonb,
        subscription JSONB DEFAULT '{"plan": "free", "expiresAt": null}'::jsonb,
        stats JSONB DEFAULT '{"tokensUsed": 0, "chatsCount": 0, "totalSpent": 0}'::jsonb,
        transactions JSONB DEFAULT '[]'::jsonb
      )
    `;
    console.log('  ✅ Users table created');
    
    // Create index on email
    console.log('📇 Creating index on users.email...');
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    console.log('  ✅ Index created');
    
    // Create chat_sessions table
    console.log('💬 Creating chat_sessions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        messages JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('  ✅ Chat sessions table created');
    
    // Create index on user_id
    console.log('📇 Creating index on chat_sessions.user_id...');
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id)`;
    console.log('  ✅ Index created');
    
    // Create products table
    console.log('🛍️ Creating products table...');
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price INTEGER NOT NULL,
        image VARCHAR(500),
        description TEXT,
        purchased_content TEXT,
        access_level VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('  ✅ Products table created');
    
    // Create index on category
    console.log('📇 Creating index on products.category...');
    await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`;
    console.log('  ✅ Index created');
    
    console.log('\n✅ All tables created successfully!');
    
    // Verify tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('\n📊 Created tables:');
    tables.forEach((table: any) => {
      console.log(`  ✅ ${table.table_name}`);
    });
    
  } catch (error: any) {
    console.error('\n❌ Error creating tables:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

createTables();
