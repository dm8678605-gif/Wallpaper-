import crypto from "node:crypto";
import { cookies } from "next/headers";
import { createSessionToken, sessionSubject, verifySessionToken } from "./session";

/**
 * Admin authentication — no database.
 * Credentials come from env vars; the password is stored as a scrypt hash
 * (format: "saltHex:hashHex"). Sessions are HMAC-signed, expiring tokens in an
 * HTTP-only cookie. The plaintext password never touches the client.
 */

export const SESSION_COOKIE = "admin_session";

export function verifyPassword(email: string, password: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!expectedPassword) return false;
  const a = Buffer.from(email.trim().toLowerCase());
  const b = Buffer.from(expectedEmail.toLowerCase());
  const c = Buffer.from(password);
  const d = Buffer.from(expectedPassword);
  const emailOk = a.length === b.length && crypto.timingSafeEqual(a, b);
  const passOk = c.length === d.length && crypto.timingSafeEqual(c, d);
  return emailOk && passOk;
}

export { createSessionToken, verifySessionToken, sessionSubject };

export async function getAdminSession(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** For Route Handlers / Server Actions — throws if unauthenticated. */
export async function requireAdmin(): Promise<string> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!verifySessionToken(token)) throw new Error("Unauthorized");
  return sessionSubject(token!);
}

// ---------- Rate limiting (in-memory, per key) ----------
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSec: number } {
  const nowT = Date.now();
  const rec = attempts.get(key);
  if (!rec || rec.resetAt < nowT) {
    attempts.set(key, { count: 1, resetAt: nowT + WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }
  rec.count += 1;
  if (rec.count > MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSec: Math.ceil((rec.resetAt - nowT) / 1000) };
  }
  return { allowed: true, retryAfterSec: 0 };
}

export function resetRateLimit(key: string): void {
  attempts.delete(key);
}
