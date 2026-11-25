"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Zap } from "lucide-react";
import { useStore, type PricingOpts } from "./StoreProvider";
import type { Product } from "@/lib/data/types";

export function AddToCart({
  product,
  pricing,
  className = "",
}: {
  product: Product;
  pricing?: PricingOpts;
  className?: string;
}) {
  const { addToCart, buyNow } = useStore();
  const [added, setAdded] = useState(false);
  const router = useRouter();

  const handleAdd = () => {
    addToCart(product, {}, pricing);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <button type="button" onClick={handleAdd} className="btn-lux flex-1 justify-center">
        <ShoppingBag size={14} /> {added ? "Added" : "Add to Cart"}
      </button>
      <button
        type="button"
        onClick={() => {
          buyNow(product, {}, pricing);
          router.push("/checkout");
        }}
        className="btn-lux btn-lux--gold flex-1 justify-center"
      >
        <Zap size={14} /> Buy Now
      </button>
    </div>
  );
}
