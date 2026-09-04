/**
 * Start embedded Postgres on D: (no Docker / no C: install).
 * Then leave process running until Ctrl+C.
 */
import EmbeddedPostgres from 'embedded-postgres';
import * as path from 'path';
import * as fs from 'fs';

const dataDir = path.join('d:', 'MYAPPS', 'personal', '.data', 'pgdata');
const logDir = path.join('d:', 'MYAPPS', 'personal', '.data', 'pglogs');
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(logDir, { recursive: true });

async function main() {
  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: 'dev',
    password: 'secret',
    port: 5432,
    persistent: true,
    initdbFlags: ['--encoding=UTF8', '--locale=C'],
  });

  console.log('Starting embedded Postgres…', dataDir);
  await pg.initialise();
  await pg.start();
  try {
    await pg.createDatabase('mushaf_platform_db');
    console.log('Created DB mushaf_platform_db');
  } catch {
    console.log('DB mushaf_platform_db already exists');
  }
  // Also create demo_test for .env.test compatibility
  try {
    await pg.createDatabase('demo_test');
  } catch {
    /* exists */
  }

  console.log('Postgres ready on 127.0.0.1:5432 user=dev');
  console.log('Keep this terminal open. Ctrl+C to stop.');

  process.on('SIGINT', async () => {
    console.log('\nStopping…');
    await pg.stop();
    process.exit(0);
  });

  // Keep alive
  await new Promise(() => undefined);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
