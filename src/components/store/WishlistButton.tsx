"use client";

import { Heart } from "lucide-react";
import { useStore } from "./StoreProvider";

export function WishlistButton({ productId, className = "" }: { productId: string; className?: string }) {
  const { inWishlist, toggleWishlist } = useStore();
  const active = inWishlist(productId);
  return (
    <button
      type="button"
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(productId);
      }}
      className={`p-2 rounded-full bg-white/90 backdrop-blur shadow-sm transition-colors ${className}`}
    >
      <Heart size={16} className={active ? "fill-[#B79A61] text-[#B79A61]" : "text-[#30251F]"} />
    </button>
  );
}
