import type { Metadata } from "next";
import { CartView } from "@/components/store/CartView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shopping Cart" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
      <p className="eyebrow">Your Selection</p>
      <h1 className="font-display text-4xl sm:text-5xl mt-2 mb-10">Cart</h1>
      <CartView />
    </div>
  );
}
