import { NextRequest, NextResponse } from "next/server";
import { mutateJson, uid, now } from "@/lib/data/store";

/** Lightweight analytics beacon — no PII beyond path/product id. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = ["pageview", "product-view", "add-to-cart", "checkout"].includes(body?.type) ? body.type : "pageview";
    await mutateJson("analytics", [], (cur: Record<string, unknown>[]) => [
      ...cur.slice(-4999),
      {
        id: uid("evt"), type,
        path: String(body?.path ?? "").slice(0, 300),
        productId: body?.productId ? String(body.productId).slice(0, 60) : undefined,
        createdAt: now(),
      },
    ]);
  } catch {
    // analytics must never break UX
  }
  return NextResponse.json({ ok: true });
}
