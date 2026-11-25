"use client";
import { useState } from "react";
import { Price } from "./Price";
import { useStore } from "./StoreProvider";
interface OrderInfo { id: string; status: string; paymentMethod: string; paymentStatus: string; total: number; createdAt: string; items: { name: string; areaSqft: number; quantity: number }[]; city: string; pincode: string }
export function TrackOrderForm() {
  const { format } = useStore();
  const [id, setId] = useState("");
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  async function search(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setErr(""); setOrder(null);
    const res = await fetch(`/api/order?id=${encodeURIComponent(id.trim())}`);
    const d = await res.json();
    if (res.ok) setOrder(d.order); else setErr(d.error ?? "Not found");
    setLoading(false);
  }
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <form onSubmit={search} className="flex gap-2">
        <input value={id} onChange={(e) => setId(e.target.value)} placeholder="e.g. ORD-2026-123456" className="input-lux flex-1" required />
        <button className="btn-lux">Track</button>
      </form>
      {err && <p className="text-sm text-red-600 mt-4">{err}</p>}
      {order && (
        <div className="mt-8 border hairline bg-[var(--color-surface)] p-6">
          <div className="flex justify-between items-start">
            <div><p className="font-display text-xl">{order.id}</p><p className="text-xs text-[var(--color-muted)] mt-1">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p></div>
            <span className="text-xs tracking-widest uppercase bg-[var(--color-primary)]/15 text-[#8a6d3b] px-3 py-1.5">{order.status}</span>
          </div>
          <div className="mt-5 space-y-2 text-sm">
            {order.items.map((it, i) => <div key={i} className="flex justify-between"><span className="text-[var(--color-muted)]">{it.name} × {it.quantity}</span><span>{it.areaSqft} sq ft</span></div>)}
            <div className="border-t hairline pt-3 flex justify-between font-semibold"><span>Total</span><Price amount={order.total} /></div>
          </div>
          <p className="text-xs text-[var(--color-muted)] mt-4">Delivering to {order.city} — {order.pincode} · Payment: {order.paymentMethod.toUpperCase()} ({order.paymentStatus})</p>
        </div>
      )}
    </div>
  );
}
