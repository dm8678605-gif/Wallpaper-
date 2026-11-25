import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { mutateJson, uid, now } from "@/lib/data/store";
import { newsletterRepo } from "@/lib/data/repos";

const schema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("contact"),
    name: z.string().min(2), email: z.string().email(), phone: z.string().optional(),
    subject: z.string().optional(), message: z.string().min(5),
  }),
  z.object({
    type: z.literal("enquiry"),
    subtype: z.enum(["custom-design", "consultation", "installation", "general"]).default("general"),
    name: z.string().min(2), email: z.string().email(), phone: z.string().optional(),
    message: z.string().optional(), details: z.record(z.string(), z.string()).optional(),
  }),
  z.object({
    type: z.literal("sample"),
    name: z.string().min(2), email: z.string().email(), phone: z.string().optional(),
    productIds: z.array(z.string()).min(1), address: z.string().min(5),
  }),
  z.object({ type: z.literal("newsletter"), email: z.string().email() }),
]);

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  if (data.type === "newsletter") {
    const existing = await newsletterRepo.all();
    if (existing.some((s) => s.email.toLowerCase() === data.email.toLowerCase())) {
      return NextResponse.json({ ok: true, message: "Already subscribed" });
    }
    await mutateJson("newsletter", [], (cur: { email: string }[]) => [
      ...cur,
      { id: uid("sub"), email: data.email, status: "active", createdAt: now(), updatedAt: now() },
    ]);
    return NextResponse.json({ ok: true });
  }

  if (data.type === "contact") {
    await mutateJson("messages", [], (cur: Record<string, unknown>[]) => [
      ...cur,
      {
        id: uid("msg"), name: data.name, email: data.email, phone: data.phone,
        subject: data.subject, message: data.message, read: false,
        createdAt: now(), updatedAt: now(),
      },
    ]);
    return NextResponse.json({ ok: true });
  }

  if (data.type === "sample") {
    await mutateJson("samples", [], (cur: Record<string, unknown>[]) => [
      ...cur,
      {
        id: uid("sam"), name: data.name, email: data.email, phone: data.phone,
        productIds: data.productIds, address: data.address, status: "pending",
        createdAt: now(), updatedAt: now(),
      },
    ]);
    return NextResponse.json({ ok: true });
  }

  // enquiry
  await mutateJson("enquiries", [], (cur: Record<string, unknown>[]) => [
    ...cur,
    {
      id: uid("enq"), type: data.subtype, name: data.name, email: data.email,
      phone: data.phone, message: data.message, details: data.details,
      status: "new", createdAt: now(), updatedAt: now(),
    },
  ]);
  return NextResponse.json({ ok: true });
}
