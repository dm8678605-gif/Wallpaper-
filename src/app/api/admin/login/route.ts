import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createSessionToken, SESSION_COOKIE, checkRateLimit, resetRateLimit } from "@/lib/auth";
import { isReadOnlyStorage } from "@/lib/data/store";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  let body: { email?: string; username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const email = body.email ?? body.username ?? "";
  const key = `${ip}:${email}`;
  const rl = checkRateLimit(key);
  if (!rl.allowed) {
    return NextResponse.json({ error: `Too many attempts. Try again in ${rl.retryAfterSec}s.` }, { status: 429 });
  }
  if (!verifyPassword(email, body.password ?? "")) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  resetRateLimit(key);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionToken(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Number(process.env.SESSION_MAX_AGE ?? 28800),
  });
  return res;
}

export async function GET() {
  return NextResponse.json({ readOnly: isReadOnlyStorage() });
}
