import crypto from "node:crypto";

/**
 * Pure session-token helpers (no Next.js imports) so they can be used from
 * proxy.ts (edge-of-request) as well as server code.
 */

export interface SessionPayload {
  sub: string;
  iat: number;
  exp: number;
}

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("SESSION_SECRET env var is missing or too short.");
  return s;
}

function sign(data: string): string {
  return crypto.createHmac("sha256", secret()).update(data).digest("hex");
}

export function createSessionToken(username: string, ttlMs = 8 * 3600 * 1000): string {
  const now = Date.now();
  const payload: SessionPayload = { sub: username, iat: now, exp: now + ttlMs };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;
  try {
    const expected = sign(body);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function sessionSubject(token: string): string {
  try {
    const [body] = token.split(".");
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    return payload.sub;
  } catch {
    return "admin";
  }
}
