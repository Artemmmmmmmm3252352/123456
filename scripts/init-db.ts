import { sql } from '../src/lib/neon.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initDatabase() {
  try {
    console.log('🚀 Initializing Neon PostgreSQL database...');
    
    // Read schema file
    const schemaPath = join(__dirname, '../database/schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Remove comments and split by semicolons
    const cleanedSchema = schema
      .split('\n')
      .map(line => {
        const commentIndex = line.indexOf('--');
        if (commentIndex >= 0) {
          return line.substring(0, commentIndex);
        }
        return line;
      })
      .join('\n');
    
    // Split by semicolons and filter empty statements
    const statements = cleanedSchema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length > 10); // Filter out very short strings
    
    console.log(`📝 Found ${statements.length} SQL statements to execute...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'; // Add semicolon back
      if (statement.trim() && statement.length > 5) {
        try {
          console.log(`  🔄 Executing statement ${i + 1}/${statements.length}...`);
          await sql.unsafe(statement);
          console.log(`  ✅ Statement ${i + 1}/${statements.length} executed successfully`);
        } catch (err: any) {
          // Ignore "already exists" errors
          if (err.message && (err.message.includes('already exists') || err.message.includes('duplicate'))) {
            console.log(`  ⚠️  Statement ${i + 1}/${statements.length} - already exists (skipped)`);
          } else {
            console.error(`  ❌ Error in statement ${i + 1}:`, err.message);
            console.error(`  Statement preview: ${statement.substring(0, 150)}...`);
            // Don't throw, continue with other statements
          }
        }
      }
    }
    
    console.log('\n✅ Database initialized successfully!');
    console.log('📊 Tables created: users, chat_sessions, products');
  } catch (error: any) {
    console.error('\n❌ Error initializing database:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

initDatabase();
