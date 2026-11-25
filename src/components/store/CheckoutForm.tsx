"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, MessageCircle } from "lucide-react";
import { useStore } from "./StoreProvider";
import { Price } from "./Price";
import type { Settings } from "@/lib/data/types";

export function CheckoutForm({ settings }: { settings: Settings }) {
  const { cart, cartTotal, clearCart, format, hydrated } = useStore();
  const router = useRouter();
  const [coupon, setCoupon] = useState("");
  const [couponState, setCouponState] = useState<{ discount: number; code: string } | null>(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [payment, setPayment] = useState<"cod" | "whatsapp">("cod");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "", country: "India", notes: "",
  });

  const subtotal = cartTotal;
  const discount = couponState?.discount ?? 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping = afterDiscount >= settings.shipping.freeAbove || afterDiscount === 0 ? 0 : settings.shipping.flatCharge;
  const tax = settings.tax.enabled ? Math.round((afterDiscount + shipping) * (settings.tax.percent / 100) * 100) / 100 : 0;
  const total = Math.round((afterDiscount + shipping + tax) * 100) / 100;

  const whatsappLink = useMemo(() => {
    if (!settings.business.whatsapp) return "";
    const num = settings.business.whatsapp.replace(/\D/g, "");
    const text = encodeURIComponent(`Hello, I'd like to place order for: ${cart.map((l) => `${l.name} (${l.areaSqft} sqft)`).join(", ")}. Estimated total: ${format(total)}`);
    return `https://wa.me/${num}?text=${text}`;
  }, [cart, total, format, settings.business.whatsapp]);

  async function applyCoupon() {
    setCouponMsg("");
    const res = await fetch(`/api/coupon?code=${encodeURIComponent(coupon)}&subtotal=${subtotal}`);
    const data = await res.json();
    if (data.valid) {
      setCouponState({ discount: data.discount, code: data.code });
      setCouponMsg(`Coupon applied: −${format(data.discount)}`);
    } else {
      setCouponState(null);
      setCouponMsg(data.error ?? "Invalid coupon");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: cart.map((l) => ({
            productId: l.productId, materialId: l.materialId,
            width: l.width, height: l.height, unit: l.unit, walls: l.walls, quantity: l.quantity,
          })),
          couponCode: couponState?.code,
          paymentMethod: payment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Order failed. Please try again.");
        setSubmitting(false);
        return;
      }
      clearCart();
      router.push(`/order-confirmation/${data.orderId}`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (!hydrated) return <p className="text-[var(--color-muted)] text-sm py-16 text-center">Loading…</p>;
  if (cart.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="font-display text-3xl mb-4">Nothing to check out</p>
        <Link href="/shop" className="btn-lux">Browse Wallpapers</Link>
      </div>
    );
  }

  const input = (key: keyof typeof form, label: string, type = "text", required = true) => (
    <div>
      <label className="label-lux">{label}</label>
      <input
        type={type} required={required} value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="input-lux"
      />
    </div>
  );

  return (
    <form onSubmit={submit} className="grid lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-8">
        {/* Contact */}
        <section className="bg-[var(--color-surface)] border hairline p-6 sm:p-8">
          <h2 className="font-display text-2xl mb-6">Contact Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {input("name", "Full name")}
            {input("email", "Email", "email")}
            {input("phone", "Phone")}
            {input("pincode", "PIN code")}
          </div>
        </section>

        {/* Address */}
        <section className="bg-[var(--color-surface)] border hairline p-6 sm:p-8">
          <h2 className="font-display text-2xl mb-6">Delivery Address</h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {input("address", "Street address")}
              {input("city", "City")}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {input("state", "State")}
              {input("country", "Country")}
            </div>
            <div>
              <label className="label-lux">Order notes (optional)</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="input-lux" />
            </div>
          </div>
        </section>

        {/* Payment */}
        <section className="bg-[var(--color-surface)] border hairline p-6 sm:p-8">
          <h2 className="font-display text-2xl mb-6">Payment Method</h2>
          <div className="space-y-3">
            {settings.payments.cod.enabled && (
              <label className={`flex items-center gap-3 border p-4 cursor-pointer transition-colors ${payment === "cod" ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" : "hairline"}`}>
                <input type="radio" name="payment" checked={payment === "cod"} onChange={() => setPayment("cod")} className="accent-[#B79A61]" />
                <div>
                  <p className="font-medium text-sm">Cash on Delivery</p>
                  <p className="text-xs text-[var(--color-muted)]">Pay when your order arrives</p>
                </div>
              </label>
            )}
            {settings.payments.whatsapp.enabled && (
              <label className={`flex items-center gap-3 border p-4 cursor-pointer transition-colors ${payment === "whatsapp" ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" : "hairline"}`}>
                <input type="radio" name="payment" checked={payment === "whatsapp"} onChange={() => setPayment("whatsapp")} className="accent-[#B79A61]" />
                <div>
                  <p className="font-medium text-sm flex items-center gap-2"><MessageCircle size={14} /> WhatsApp Order</p>
                  <p className="text-xs text-[var(--color-muted)]">We&apos;ll confirm your order on WhatsApp</p>
                </div>
              </label>
            )}
            <div className="flex items-center gap-3 border hairline p-4 opacity-60">
              <Lock size={16} className="text-[var(--color-muted)]" />
              <div>
                <p className="font-medium text-sm">Online Payment</p>
                <p className="text-xs text-[var(--color-muted)]">Coming soon — payment gateway integration pending</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Summary */}
      <aside>
        <div className="border hairline bg-[var(--color-surface)] p-6 sticky top-28">
          <h2 className="font-display text-xl mb-5">Order Summary</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {cart.map((l) => (
              <div key={l.key} className="flex justify-between text-sm gap-3">
                <span className="text-[var(--color-muted)] line-clamp-2">{l.name} × {l.quantity}</span>
                <Price amount={l.lineTotal} className="shrink-0" />
              </div>
            ))}
          </div>

          <div className="mt-5">
            <div className="flex gap-2">
              <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Coupon code" className="input-lux !py-2.5 text-sm" />
              <button type="button" onClick={applyCoupon} className="btn-lux !px-4 !py-2.5 text-[0.65rem]">Apply</button>
            </div>
            {couponMsg && <p className={`text-xs mt-2 ${couponState ? "text-[var(--color-secondary)]" : "text-red-600"}`}>{couponMsg}</p>}
          </div>

          <div className="border-t hairline mt-5 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[var(--color-muted)]">Subtotal</span><Price amount={subtotal} /></div>
            {discount > 0 && <div className="flex justify-between text-[var(--color-secondary)]"><span>Discount ({couponState?.code})</span><span>−<Price amount={discount} /></span></div>}
            <div className="flex justify-between"><span className="text-[var(--color-muted)]">Shipping</span><span>{shipping ? <Price amount={shipping} /> : "Free"}</span></div>
            {settings.tax.enabled && <div className="flex justify-between"><span className="text-[var(--color-muted)]">{settings.tax.label} ({settings.tax.percent}%)</span><Price amount={tax} /></div>}
            <div className="flex justify-between font-semibold text-base pt-2 border-t hairline">
              <span>Total</span><Price amount={total} />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-lux btn-lux--gold w-full justify-center mt-6">
            {submitting ? "Placing order…" : `Place Order — ${format(total)}`}
          </button>
          <p className="text-[0.65rem] text-[var(--color-muted)] text-center mt-3">Prices re-validated on the server before order confirmation.</p>
          {payment === "whatsapp" && whatsappLink && (
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="block text-center text-xs text-[#25D366] mt-3 hover:underline">
              Or send this order via WhatsApp →
            </a>
          )}
        </div>
      </aside>
    </form>
  );
}
