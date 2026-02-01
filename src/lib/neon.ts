import { neon } from '@neondatabase/serverless';

// Neon PostgreSQL connection string
// Get from environment variable, fallback to empty string (will cause error if not set)
const DATABASE_URL = import.meta.env.VITE_DATABASE_URL || '';

if (!DATABASE_URL) {
  console.error('⚠️ VITE_DATABASE_URL is not set! Database operations will fail.');
}

// Initialize Neon SQL client
export const sql = neon(DATABASE_URL);

// Export connection string for direct use if needed
export { DATABASE_URL };
