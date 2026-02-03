import fs from 'node:fs';
import path from 'node:path';

// Load .env.local if it exists (Cirrus generates this for isolated environments)
function loadEnvLocal() {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  try {
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex === -1) continue;
        const key = trimmed.slice(0, eqIndex).trim();
        const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
        // Only set if not already defined (process.env takes precedence)
        if (process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
    }
  } catch {
    // Silently ignore errors loading .env.local
  }
}

loadEnvLocal();

export const config = {
  port: parseInt(process.env.PORT ?? '3000', 10),

  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    user: process.env.DATABASE_USER ?? 'postgres',
    password: process.env.DATABASE_PASSWORD ?? 'postgres',
    database: process.env.DATABASE_NAME ?? 'cirrus_test',
  },

  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },

  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};
