import { query, closePool } from './client.js';

async function reset() {
  console.log('Resetting database...\n');

  console.log('Dropping all tables...');
  await query(`
    DROP TABLE IF EXISTS post_tags CASCADE;
    DROP TABLE IF EXISTS comments CASCADE;
    DROP TABLE IF EXISTS posts CASCADE;
    DROP TABLE IF EXISTS tags CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS _migrations CASCADE;
  `);
  console.log('✓ All tables dropped');

  console.log('\nDatabase reset complete. Run db:migrate and db:seed to rebuild.');
  await closePool();
}

reset().catch(err => {
  console.error('Reset failed:', err);
  process.exit(1);
});
