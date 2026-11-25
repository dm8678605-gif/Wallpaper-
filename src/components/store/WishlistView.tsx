"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "./StoreProvider";
import { ProductCard } from "@/components/ui/ProductCard";
import type { Product } from "@/lib/data/types";

// Client components can't call the repo directly — fetch via a tiny API instead.
export function WishlistView() {
  const { wishlist, hydrated } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!hydrated) return;
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      fetch("/api/products")
        .then((r) => r.json())
        .then((data: { items: Product[] }) => {
          setProducts(data.items.filter((p) => wishlist.includes(p.id)));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 0);
    return () => clearTimeout(t);
  }, [wishlist, hydrated]);

  if (!hydrated || loading) return <p className="text-[var(--color-muted)] text-sm py-16 text-center">Loading…</p>;
  if (products.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="font-display text-3xl mb-4">Your wishlist is empty</p>
        <p className="text-[var(--color-muted)] text-sm mb-8">Tap the heart on any wallpaper to save it here.</p>
        <Link href="/shop" className="btn-lux">Discover Wallpapers</Link>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

