import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { productsRepo, settingsRepo, couponsRepo, ordersRepo, customersRepo, materialsRepo } from "@/lib/data/repos";
import { computePricing, resolveUnitPrice, calculatorInputSchema, round2 } from "@/lib/pricing";
import { uid, now, mutateJson } from "@/lib/data/store";
import { revalidatePath } from "next/cache";
import type { Order, OrderItem } from "@/lib/data/types";

const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(8),
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4),
    country: z.string().default("India"),
    notes: z.string().optional(),
  }),
  items: z.array(z.object({
    productId: z.string(),
    materialId: z.string().optional(),
    width: z.number().positive(),
    height: z.number().positive(),
    unit: z.enum(["ft", "in", "cm", "m"]).default("ft"),
    walls: z.number().int().min(1).max(20).default(1),
    quantity: z.number().int().min(1).max(50).default(1),
  })).min(1).max(20),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(["cod", "whatsapp"]).default("cod"), // "online" intentionally unsupported
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }
  const { customer, items, couponCode, paymentMethod } = parsed.data;

  const settings = await settingsRepo.get();
  if (paymentMethod === "whatsapp" && !settings.payments.whatsapp.enabled) {
    return NextResponse.json({ error: "WhatsApp ordering is disabled" }, { status: 400 });
  }
  if (paymentMethod === "cod" && !settings.payments.cod.enabled) {
    return NextResponse.json({ error: "Cash on Delivery is disabled" }, { status: 400 });
  }

  // ---- Recompute every price server-side from stored product data ----
  const orderItems: OrderItem[] = [];
  let subtotal = 0;
  let installationTotal = 0;

  for (const item of items) {
    const product = await productsRepo.get(item.productId);
    if (!product || !product.published) {
      return NextResponse.json({ error: `Product unavailable: ${item.productId}` }, { status: 400 });
    }
    let materialName: string | undefined;
    if (item.materialId) {
      const mat = await materialsRepo.get(item.materialId);
      if (mat) materialName = mat.name;
    }
    const unitPrice = resolveUnitPrice(product, item.materialId);
    const calc = computePricing(
      { ...calculatorInputSchema.parse({
        width: item.width, height: item.height, unit: item.unit,
        walls: item.walls, includeInstallation: true,
      }), productId: product.id, materialId: item.materialId, pricePerSqft: unitPrice },
      {
        pricePerSqft: unitPrice,
        minOrderAreaSqft: product.minOrderAreaSqft,
        defaultWastagePercent: product.wastagePercent,
        defaultInstallationPerSqft: product.installationChargePerSqft,
        rollWidthFt: settings.calculator.rollWidthFt,
        shippingFlat: settings.shipping.flatCharge,
        shippingFreeAbove: settings.shipping.freeAbove,
        taxPercent: settings.tax.enabled ? settings.tax.percent : 0,
      }
    );
    const lineTotal = round2(calc.total * item.quantity);
    orderItems.push({
      productId: product.id, name: product.name, slug: product.slug,
      image: product.images.find((i) => i.primary)?.url ?? product.images[0]?.url,
      materialId: item.materialId, materialName,
      widthFt: round2(item.width * (item.unit === "in" ? 1 / 12 : item.unit === "cm" ? 0.0328084 : item.unit === "m" ? 3.28084 : 1)),
      heightFt: round2(item.height * (item.unit === "in" ? 1 / 12 : item.unit === "cm" ? 0.0328084 : item.unit === "m" ? 3.28084 : 1)),
      walls: item.walls,
      areaSqft: calc.totalAreaSqft,
      wastagePercent: product.wastagePercent,
      quantity: item.quantity,
      unitPrice,
      installationPerSqft: product.installationChargePerSqft,
      lineTotal,
    });
    subtotal += calc.subtotal * item.quantity;
    installationTotal += calc.installationCost * item.quantity;
  }

  // ---- Coupon ----
  let discount = 0;
  let couponId: string | undefined;
  if (couponCode) {
    const coupon = await couponsRepo.byCode(couponCode);
    if (coupon) {
      const minOk = !coupon.minOrderValue || subtotal >= coupon.minOrderValue;
      const underLimit = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit;
      const notExpired = !coupon.expiresAt || new Date(coupon.expiresAt) > new Date();
      if (minOk && underLimit && notExpired) {
        discount = coupon.type === "percent" ? round2((subtotal * coupon.value) / 100) : Math.min(coupon.value, subtotal);
        couponId = coupon.id;
      }
    }
  }

  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping = afterDiscount >= settings.shipping.freeAbove || afterDiscount === 0 ? 0 : settings.shipping.flatCharge;
  const tax = settings.tax.enabled ? round2((afterDiscount + shipping) * (settings.tax.percent / 100)) : 0;
  const total = round2(afterDiscount + shipping + tax);

  // ---- Persist order + customer ----
  const orderId = `ORD-${new Date().getFullYear()}-${String(Math.floor(100000 + Math.random() * 900000))}`;
  const customerRec = await customersRepo.byEmail(customer.email);
  const order: Order = {
    id: orderId,
    customerId: customerRec?.id,
    customerName: customer.name, email: customer.email, phone: customer.phone,
    address: customer.address, city: customer.city, state: customer.state,
    pincode: customer.pincode, country: customer.country,
    items: orderItems, subtotal: round2(subtotal), discount, couponCode,
    installationTotal: round2(installationTotal), shippingCharge: shipping,
    taxPercent: settings.tax.percent, taxAmount: tax, total,
    paymentMethod, paymentStatus: "pending",
    status: "pending", notes: customer.notes,
    createdAt: now(), updatedAt: now(),
  };

  await mutateJson<Order[]>("orders", [], (cur) => [...cur, order]);
  if (couponId) {
    await mutateJson("coupons", [], (cur: { id: string; usedCount: number }[]) =>
      cur.map((c) => (c.id === couponId ? { ...c, usedCount: c.usedCount + 1 } : c)));
  }
  if (customerRec) {
    await mutateJson("customers", [], (cur: { id: string; orderCount: number; totalSpent: number }[]) =>
      cur.map((c) => c.id === customerRec.id
        ? { ...c, orderCount: c.orderCount + 1, totalSpent: round2(c.totalSpent + total), updatedAt: now() }
        : c));
  } else {
    await mutateJson("customers", [], (cur: Record<string, unknown>[]) => [
      ...cur,
      {
        id: uid("cus"), name: customer.name, email: customer.email, phone: customer.phone,
        addresses: [{ label: "Home", address: customer.address, city: customer.city, state: customer.state, pincode: customer.pincode, country: customer.country }],
        orderCount: 1, totalSpent: total, createdAt: now(), updatedAt: now(),
      },
    ]);
  }
  await mutateJson("analytics", [], (cur: Record<string, unknown>[]) => [
    ...cur,
    { id: uid("evt"), type: "order", meta: { orderId, total: String(total) }, createdAt: now() },
  ]);

  revalidatePath("/admin/orders");
  return NextResponse.json({ ok: true, orderId, total });
}

// prevent unused import warning for ordersRepo (kept for future order lookups)
void ordersRepo;
