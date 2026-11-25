import type { Metadata } from "next";
import { WishlistView } from "@/components/store/WishlistView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
      <p className="eyebrow">Saved Designs</p>
      <h1 className="font-display text-4xl sm:text-5xl mt-2 mb-10">Wishlist</h1>
      <WishlistView />
    </div>
  );
}
