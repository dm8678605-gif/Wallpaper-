import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { ordersRepo, settingsRepo } from "@/lib/data/repos";
import { Price } from "@/components/store/Price";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order Confirmation" };

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await ordersRepo.get(decodeURIComponent(id));
  if (!order) notFound();
  const settings = await settingsRepo.get();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
      <CheckCircle2 size={56} className="mx-auto text-[var(--color-secondary)]" />
      <p className="eyebrow mt-6">Order Confirmed</p>
      <h1 className="font-display text-4xl sm:text-5xl mt-3">Thank You, {order.customerName.split(" ")[0]}</h1>
      <p className="text-[var(--color-muted)] mt-4">
        Your order <span className="font-semibold text-[var(--color-ink)]">{order.id}</span> has been received.
        {order.paymentMethod === "cod" && " Pay cash on delivery."}
        {order.paymentMethod === "whatsapp" && " We'll confirm details on WhatsApp."}
      </p>

      <div className="mt-10 border hairline bg-[var(--color-surface)] text-left p-6 sm:p-8">
        <h2 className="font-display text-xl mb-5">Order Details</h2>
        <div className="space-y-3 text-sm">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between gap-4">
              <span className="text-[var(--color-muted)]">{item.name}{item.materialName ? ` (${item.materialName})` : ""} — {item.areaSqft} sq ft × {item.quantity}</span>
              <Price amount={item.lineTotal} className="shrink-0" />
            </div>
          ))}
          <div className="border-t hairline pt-3 space-y-1.5">
            <div className="flex justify-between text-[var(--color-muted)]"><span>Subtotal</span><Price amount={order.subtotal} /></div>
            {order.discount > 0 && <div className="flex justify-between text-[var(--color-secondary)]"><span>Discount</span><span>−<Price amount={order.discount} /></span></div>}
            <div className="flex justify-between text-[var(--color-muted)]"><span>Shipping</span><span>{order.shippingCharge ? <Price amount={order.shippingCharge} /> : "Free"}</span></div>
            <div className="flex justify-between text-[var(--color-muted)]"><span>Tax</span><Price amount={order.taxAmount} /></div>
            <div className="flex justify-between font-semibold text-base pt-2"><span>Total</span><Price amount={order.total} /></div>
          </div>
        </div>
        <p className="text-xs text-[var(--color-muted)] mt-6">
          Delivering to: {order.address}, {order.city}, {order.state} — {order.pincode}
          {settings.business.email ? ` · Questions? ${settings.business.email}` : ""}
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/shop" className="btn-lux">Continue Shopping</Link>
        <Link href="/" className="btn-lux btn-lux--outline">Back to Home</Link>
      </div>
    </div>
  );
}
