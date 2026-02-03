import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pool, query, closePool } from './client.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function ensureMigrationsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getExecutedMigrations(): Promise<string[]> {
  const result = await query<{ name: string }>('SELECT name FROM _migrations ORDER BY id');
  return result.rows.map(row => row.name);
}

async function executeMigration(name: string, sql: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO _migrations (name) VALUES ($1)', [name]);
    await client.query('COMMIT');
    console.log(`✓ Migration executed: ${name}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function migrate() {
  console.log('Running database migrations...\n');

  await ensureMigrationsTable();

  const executed = await getExecutedMigrations();
  const migrationsDir = join(__dirname, 'migrations');

  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  let migrationsRan = 0;

  for (const file of files) {
    if (!executed.includes(file)) {
      const sql = readFileSync(join(migrationsDir, file), 'utf-8');
      await executeMigration(file, sql);
      migrationsRan++;
    }
  }

  if (migrationsRan === 0) {
    console.log('No new migrations to run.');
  } else {
    console.log(`\n${migrationsRan} migration(s) executed successfully.`);
  }

  await closePool();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
