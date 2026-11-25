"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useStore } from "./StoreProvider";
import { Price } from "./Price";

export function CartView() {
  const { cart, cartTotal, removeLine, updateLine, hydrated } = useStore();

  function setQty(key: string, qty: number, prevQty: number, prevTotal: number) {
    const clamped = Math.max(1, Math.min(50, qty));
    updateLine(key, {
      quantity: clamped,
      lineTotal: Math.round((prevTotal / prevQty) * clamped * 100) / 100,
    });
  }

  if (!hydrated) return <p className="text-[var(--color-muted)] text-sm py-16 text-center">Loading cart…</p>;

  if (cart.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="font-display text-3xl mb-4">Your cart is empty</p>
        <p className="text-[var(--color-muted)] text-sm mb-8">Discover wallpapers crafted for extraordinary walls.</p>
        <Link href="/shop" className="btn-lux">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-4">
        {cart.map((line) => (
          <div key={line.key} className="flex gap-5 border hairline bg-[var(--color-surface)] p-4">
            <Link href={`/product/${line.slug}`} className="w-24 h-28 shrink-0 bg-[var(--color-accent)]/30 overflow-hidden">
              {line.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={line.image} alt={line.name} className="h-full w-full object-cover" />
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/product/${line.slug}`} className="font-display text-lg hover:text-[var(--color-primary)] transition-colors line-clamp-1">{line.name}</Link>
              {line.materialName && <p className="text-xs text-[var(--color-muted)] mt-1">Material: {line.materialName}</p>}
              <p className="text-xs text-[var(--color-muted)] mt-1">
                {line.width} {line.unit} × {line.height} {line.unit} × {line.walls} wall{line.walls > 1 ? "s" : ""} · {line.areaSqft} sq ft · <Price amount={line.unitPrice} />/sqft
              </p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center border hairline">
                  <button
                    type="button"
                    className="px-3 py-1 text-sm hover:bg-[var(--color-bg)]"
                    onClick={() => setQty(line.key, line.quantity - 1, line.quantity, line.lineTotal)}
                    aria-label="Decrease quantity"
                  >−</button>
                  <span className="px-3 text-sm">{line.quantity}</span>
                  <button
                    type="button"
                    className="px-3 py-1 text-sm hover:bg-[var(--color-bg)]"
                    onClick={() => setQty(line.key, line.quantity + 1, line.quantity, line.lineTotal)}
                    aria-label="Increase quantity"
                  >+</button>
                </div>
                <button type="button" onClick={() => removeLine(line.key)} className="text-[var(--color-muted)] hover:text-red-600 transition-colors" aria-label="Remove">
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-sm font-semibold mt-2"><Price amount={line.lineTotal} /></p>
            </div>
          </div>
        ))}
      </div>

      <aside className="lg:col-span-1">
        <div className="border hairline bg-[var(--color-surface)] p-6 sticky top-28">
          <h2 className="font-display text-xl mb-5">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[var(--color-muted)]">Subtotal ({cart.reduce((s, l) => s + l.quantity, 0)} items)</span><Price amount={cartTotal} /></div>
            <p className="text-xs text-[var(--color-muted)]">Shipping, discounts and taxes calculated at checkout.</p>
          </div>
          <Link href="/checkout" className="btn-lux w-full justify-center mt-6">Proceed to Checkout</Link>
          <Link href="/shop" className="block text-center text-xs text-[var(--color-muted)] hover:text-[var(--color-primary)] mt-4 tracking-widest uppercase">Continue shopping</Link>
        </div>
      </aside>
    </div>
  );
}
