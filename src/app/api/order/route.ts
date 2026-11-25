import { NextRequest, NextResponse } from "next/server";
import { ordersRepo } from "@/lib/data/repos";
export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  const order = await ordersRepo.get(id);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order: {
    id: order.id, status: order.status, paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus, total: order.total, createdAt: order.createdAt,
    items: order.items.map((i) => ({ name: i.name, areaSqft: i.areaSqft, quantity: i.quantity })),
    city: order.city, pincode: order.pincode,
  }});
}
