import { neon } from '@neondatabase/serverless';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env file manually (for Node.js scripts)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

let DATABASE_URL = '';
try {
  // Debug: check if file exists
  if (!existsSync(envPath)) {
    console.error(`⚠️ Файл .env не найден по пути: ${envPath}`);
  }
  
  const envFile = readFileSync(envPath, 'utf-8');
  // Match VITE_DATABASE_URL=value (handle multiline values and quotes)
  const lines = envFile.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('VITE_DATABASE_URL=') && !trimmed.startsWith('#')) {
      DATABASE_URL = trimmed.substring('VITE_DATABASE_URL='.length).trim();
      // Remove quotes if present
      DATABASE_URL = DATABASE_URL.replace(/^["']|["']$/g, '');
      if (DATABASE_URL) break;
    }
  }
  if (!DATABASE_URL) {
    console.error('⚠️ VITE_DATABASE_URL не найден в .env файле');
    console.error(`   Путь: ${envPath}`);
    console.error(`   Содержимое файла (первые 200 символов): ${envFile.substring(0, 200)}`);
  }
} catch (error: any) {
  console.error('⚠️ Ошибка чтения .env файла:', error.message);
  console.error(`   Путь: ${envPath}`);
  // Try environment variable as fallback
  DATABASE_URL = process.env.VITE_DATABASE_URL || '';
}

if (!DATABASE_URL) {
  console.error('❌ VITE_DATABASE_URL не установлен!');
  console.error('   Создайте файл .env в корне проекта с переменной VITE_DATABASE_URL');
  process.exit(1);
}

// Initialize Neon SQL client for Node.js scripts
export const sql = neon(DATABASE_URL);
export { DATABASE_URL };
