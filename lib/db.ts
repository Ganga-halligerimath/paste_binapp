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
const useKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

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
    // SQLite not available (e.g., in serverless environment)
    // Will fall back to KV if available
  }
}

// Vercel KV implementation (for production)
let kv: any = null;

async function getKV() {
  if (kv) return kv;
  
  if (!useKV) {
    throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN must be set for KV storage');
  }
  
  try {
    const { kv: kvClient } = await import('@vercel/kv');
    kv = kvClient;
    return kv;
  } catch (error) {
    throw new Error('Failed to load @vercel/kv. Make sure it is installed: npm install @vercel/kv');
  }
}

function pasteToKey(id: string): string {
  return `paste:${id}`;
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

// KV functions
async function createPasteKV(
  content: string,
  ttlSeconds: number | null,
  maxViews: number | null
): Promise<string> {
  const kvClient = await getKV();
  const id = nanoid();
  const createdAt = Date.now();
  
  const paste: Paste = {
    id,
    content,
    created_at: createdAt,
    ttl_seconds: ttlSeconds,
    max_views: maxViews,
    current_views: 0,
  };
  
  await kvClient.set(pasteToKey(id), JSON.stringify(paste));
  return id;
}

async function getPasteKV(id: string): Promise<Paste | null> {
  const kvClient = await getKV();
  const data = await kvClient.get(pasteToKey(id));
  if (!data) return null;
  return JSON.parse(data as string) as Paste;
}

async function incrementViewsKV(id: string): Promise<boolean> {
  const kvClient = await getKV();
  const key = pasteToKey(id);
  const data = await kvClient.get(key);
  if (!data) return false;
  
  const paste = JSON.parse(data as string) as Paste;
  paste.current_views += 1;
  await kvClient.set(key, JSON.stringify(paste));
  return true;
}

// Public API - automatically chooses backend
export async function createPaste(
  content: string,
  ttlSeconds: number | null,
  maxViews: number | null
): Promise<string> {
  if (useKV) {
    return createPasteKV(content, ttlSeconds, maxViews);
  }
  initSQLite();
  if (!sqliteDb) {
    throw new Error('Database initialization failed');
  }
  return createPasteSQLite(content, ttlSeconds, maxViews);
}

export async function getPaste(id: string): Promise<Paste | null> {
  if (useKV) {
    return getPasteKV(id);
  }
  initSQLite();
  if (!sqliteDb) {
    throw new Error('Database initialization failed');
  }
  return getPasteSQLite(id);
}

export async function incrementViews(id: string): Promise<boolean> {
  if (useKV) {
    return incrementViewsKV(id);
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
