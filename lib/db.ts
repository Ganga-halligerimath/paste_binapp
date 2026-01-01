import { nanoid } from 'nanoid';

export interface Paste {
  id: string;
  content: string;
  created_at: number;
  ttl_seconds: number | null;
  max_views: number | null;
  current_views: number;
}

// Determine which storage backend to use
const usePostgres = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING;

// SQLite implementation (for local development)
let sqliteDb: any = null;
let sqliteInit = false;

function initSQLite() {
  if (sqliteInit) return;
  
  try {
    const Database = require('better-sqlite3');
    const path = require('path');
    const fs = require('fs');
    
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const dbPath = path.join(dataDir, 'pastes.db');
    sqliteDb = new Database(dbPath);
    
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS pastes (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        ttl_seconds INTEGER,
        max_views INTEGER,
        current_views INTEGER NOT NULL DEFAULT 0
      )
    `);
    
    sqliteInit = true;
  } catch (error) {
    console.error('SQLite initialization error:', error);
    sqliteInit = true; // Prevent retrying
  }
}

// Postgres implementation (for production)
let postgresClient: any = null;
let postgresInit = false;

async function initPostgres() {
  if (postgresInit) return;
  
  try {
    const { sql } = await import('@vercel/postgres');
    postgresClient = sql;
    
    // Create table if it doesn't exist
    await postgresClient`
      CREATE TABLE IF NOT EXISTS pastes (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        created_at BIGINT NOT NULL,
        ttl_seconds INTEGER,
        max_views INTEGER,
        current_views INTEGER NOT NULL DEFAULT 0
      )
    `;
    
    postgresInit = true;
  } catch (error) {
    console.error('Postgres initialization error:', error);
    postgresInit = true; // Prevent retrying
    throw error;
  }
}

// SQLite functions
function createPasteSQLite(
  content: string,
  ttlSeconds: number | null,
  maxViews: number | null
): string {
  initSQLite();
  if (!sqliteDb) throw new Error('SQLite not initialized');
  
  const id = nanoid();
  const createdAt = Date.now();
  
  sqliteDb.prepare(`
    INSERT INTO pastes (id, content, created_at, ttl_seconds, max_views, current_views)
    VALUES (?, ?, ?, ?, ?, 0)
  `).run(id, content, createdAt, ttlSeconds, maxViews);
  
  return id;
}

function getPasteSQLite(id: string): Paste | null {
  initSQLite();
  if (!sqliteDb) return null;
  
  const paste = sqliteDb.prepare('SELECT * FROM pastes WHERE id = ?').get(id) as Paste | undefined;
  return paste || null;
}

function incrementViewsSQLite(id: string): boolean {
  initSQLite();
  if (!sqliteDb) return false;
  
  const result = sqliteDb.prepare('UPDATE pastes SET current_views = current_views + 1 WHERE id = ?').run(id);
  return result.changes > 0;
}

// Postgres functions
async function createPastePostgres(
  content: string,
  ttlSeconds: number | null,
  maxViews: number | null
): Promise<string> {
  await initPostgres();
  if (!postgresClient) throw new Error('Postgres not initialized');
  
  const id = nanoid();
  const createdAt = Date.now();
  
  await postgresClient`
    INSERT INTO pastes (id, content, created_at, ttl_seconds, max_views, current_views)
    VALUES (${id}, ${content}, ${createdAt}, ${ttlSeconds}, ${maxViews}, 0)
  `;
  
  return id;
}

async function getPastePostgres(id: string): Promise<Paste | null> {
  await initPostgres();
  if (!postgresClient) return null;
  
  const result = await postgresClient`
    SELECT * FROM pastes WHERE id = ${id}
  `;
  
  if (result.length === 0) return null;
  
  const row = result[0];
  return {
    id: row.id,
    content: row.content,
    created_at: Number(row.created_at),
    ttl_seconds: row.ttl_seconds,
    max_views: row.max_views,
    current_views: row.current_views,
  };
}

async function incrementViewsPostgres(id: string): Promise<boolean> {
  await initPostgres();
  if (!postgresClient) return false;
  
  const result = await postgresClient`
    UPDATE pastes SET current_views = current_views + 1 WHERE id = ${id}
  `;
  
  return result.count > 0;
}

// Public API - automatically chooses backend
export async function createPaste(
  content: string,
  ttlSeconds: number | null,
  maxViews: number | null
): Promise<string> {
  if (usePostgres) {
    return createPastePostgres(content, ttlSeconds, maxViews);
  }
  initSQLite();
  if (!sqliteDb) {
    throw new Error('Database initialization failed');
  }
  return createPasteSQLite(content, ttlSeconds, maxViews);
}

export async function getPaste(id: string): Promise<Paste | null> {
  if (usePostgres) {
    return getPastePostgres(id);
  }
  initSQLite();
  if (!sqliteDb) {
    throw new Error('Database initialization failed');
  }
  return getPasteSQLite(id);
}

export async function incrementViews(id: string): Promise<boolean> {
  if (usePostgres) {
    return incrementViewsPostgres(id);
  }
  initSQLite();
  if (!sqliteDb) {
    throw new Error('Database initialization failed');
  }
  return incrementViewsSQLite(id);
}

export function isPasteAvailable(
  paste: Paste,
  now: number
): { available: boolean; reason?: string } {
  // Check view limit
  if (paste.max_views !== null && paste.current_views >= paste.max_views) {
    return { available: false, reason: 'view_limit_exceeded' };
  }
  
  // Check TTL
  if (paste.ttl_seconds !== null) {
    const expiresAt = paste.created_at + paste.ttl_seconds * 1000;
    if (now >= expiresAt) {
      return { available: false, reason: 'expired' };
    }
  }
  
  return { available: true };
}

export function getCurrentTime(testMode: boolean, testNowMs: string | null): number {
  if (testMode && testNowMs) {
    const parsed = parseInt(testNowMs, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  return Date.now();
}
