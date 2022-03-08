import uuid from 'uuid-random';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

async function init() {
  const runDatabase = await open({ filename: './database.sqlite', driver: sqlite3.Database });
  await runDatabase.migrate({ migrationsPath: './migrations-sqlite' });
  return runDatabase;
}
