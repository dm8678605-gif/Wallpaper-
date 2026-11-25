import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { DATA_FILES, type DataFileKey } from "./types";

/**
 * Local JSON storage layer.
 *
 * - All persistence lives in <project>/data/*.json (git-ignored in production use).
 * - Writes are serialized per file (in-process mutex) and committed atomically
 *   via write-to-temp + rename, which protects against concurrent updates and
 *   partial writes.
 * - On Vercel / read-only filesystems, writes will fail; callers should check
 *   `isReadOnlyStorage()` and surface the demo-mode notice instead.
 */

export const DATA_DIR = path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export function isReadOnlyStorage(): boolean {
  return process.env.VERCEL === "1" || process.env.DEMO_READONLY === "1";
}

// ---------- per-file async mutex ----------
const locks = new Map<string, Promise<unknown>>();

async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((r) => (release = r));
  locks.set(key, prev.then(() => current));
  await prev;
  try {
    return await fn();
  } finally {
    release();
    if (locks.get(key) === current) locks.delete(key);
  }
}

function filePath(key: DataFileKey): string {
  return path.join(DATA_DIR, DATA_FILES[key]);
}

export async function ensureDataDir(): Promise<void> {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  await fsp.mkdir(UPLOAD_DIR, { recursive: true });
}

/** Read and parse a JSON data file. Returns `fallback` when missing/invalid. */
export async function readJson<T>(key: DataFileKey, fallback: T): Promise<T> {
  try {
    const raw = await fsp.readFile(filePath(key), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Atomically write a JSON data file (serialized per file). */
export async function writeJson<T>(key: DataFileKey, value: T): Promise<void> {
  if (isReadOnlyStorage()) {
    throw new Error("Storage is read-only in this environment (demo mode).");
  }
  await ensureDataDir();
  await withLock(DATA_FILES[key], async () => {
    const target = filePath(key);
    const tmp = `${target}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
    await fsp.writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
    await fsp.rename(tmp, target);
  });
}

/**
 * Read-modify-write helper: loads the file, applies `mutate`, persists.
 * `mutate` receives the current value and returns the new value (or void to abort).
 */
export async function mutateJson<T>(
  key: DataFileKey,
  fallback: T,
  mutate: (current: T) => T | void | Promise<T | void>
): Promise<T> {
  return withLock(DATA_FILES[key], async () => {
    const current = await readJson(key, fallback);
    const next = (await mutate(current)) ?? current;
    if (!isReadOnlyStorage()) {
      await ensureDataDir();
      const target = filePath(key);
      const tmp = `${target}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
      await fsp.writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
      await fsp.rename(tmp, target);
    }
    return next;
  });
}

export function uid(prefix = "id"): string {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

export function now(): string {
  return new Date().toISOString();
}

/** Check a path stays inside a base directory (anti directory-traversal). */
export function safeJoin(base: string, ...parts: string[]): string | null {
  const resolved = path.resolve(base, ...parts);
  if (!resolved.startsWith(path.resolve(base) + path.sep) && resolved !== path.resolve(base)) {
    return null;
  }
  return resolved;
}

/** True when the data directory has been seeded. */
export async function isSeeded(): Promise<boolean> {
  try {
    await fsp.access(filePath("products"));
    return true;
  } catch {
    return false;
  }
}

export function dataFileExistsOnDisk(key: DataFileKey): boolean {
  try {
    return fs.existsSync(filePath(key));
  } catch {
    return false;
  }
}
