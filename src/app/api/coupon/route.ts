import { NextRequest, NextResponse } from "next/server";
import { couponsRepo } from "@/lib/data/repos";

export async function GET(req: NextRequest) {
  const code = new URL(req.url).searchParams.get("code") ?? "";
  const subtotal = parseFloat(new URL(req.url).searchParams.get("subtotal") ?? "0");
  if (!code) return NextResponse.json({ valid: false, error: "Enter a code" });
  const coupon = await couponsRepo.byCode(code);
  if (!coupon) return NextResponse.json({ valid: false, error: "Invalid coupon code" });
  if (coupon.minOrderValue && subtotal < coupon.minOrderValue)
    return NextResponse.json({ valid: false, error: `Requires order above ₹${coupon.minOrderValue.toLocaleString("en-IN")}` });
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
    return NextResponse.json({ valid: false, error: "Coupon usage limit reached" });
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())
    return NextResponse.json({ valid: false, error: "Coupon expired" });
  const discount = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : Math.min(coupon.value, subtotal);
  return NextResponse.json({ valid: true, code: coupon.code, discount });
}
