import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/lib/data/types";
import { Price } from "@/components/store/Price";
import { WishlistButton } from "@/components/store/WishlistButton";
import { AddToCart } from "@/components/store/AddToCart";

export function ProductCard({ product, showAdd = true }: { product: Product; showAdd?: boolean }) {
  const img = product.images.find((i) => i.primary)?.url ?? product.images[0]?.url ?? "";
  const original = product.originalPricePerSqft;
  const hasDiscount = original && original > product.pricePerSqft;
  return (
    <div className="group relative card-hover bg-[var(--color-surface)] border hairline overflow-hidden" style={{ borderRadius: "var(--radius-card)" }}>
      <Link href={`/product/${product.slug}`} className="block img-zoom relative aspect-[3/4] overflow-hidden bg-[var(--color-accent)]/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-[var(--color-primary)] text-white text-[0.65rem] tracking-widest uppercase px-2.5 py-1">
            Save {Math.round((1 - product.pricePerSqft / original) * 100)}%
          </span>
        )}
        {product.sample && (
          <span className="absolute bottom-3 left-3 bg-[var(--color-ink)]/80 text-[var(--color-bg)] text-[0.6rem] tracking-widest uppercase px-2 py-1">
            Sample
          </span>
        )}
      </Link>
      <WishlistButton productId={product.id} className="absolute top-3 right-3 z-10" />
      <div className="p-3 sm:p-4">
        <p className="text-[0.6rem] sm:text-[0.65rem] tracking-[0.2em] sm:tracking-[0.25em] uppercase text-[var(--color-muted)]">{product.code}</p>
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-display text-sm sm:text-lg leading-tight sm:leading-snug mt-1 group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">{product.name}</h3>
        </Link>
        {product.rating != null && (
          <p className="flex items-center gap-1 text-[0.7rem] sm:text-xs text-[var(--color-muted)] mt-1">
            <Star size={12} className="fill-[var(--color-primary)] text-[var(--color-primary)]" />
            {product.rating.toFixed(1)} <span className="text-[0.65rem] sm:text-xs">({product.reviewCount ?? 0})</span>
          </p>
        )}
        <div className="flex items-baseline gap-1.5 sm:gap-2 mt-2">
          <Price amount={product.pricePerSqft} className="text-xs sm:text-sm font-semibold" />
          <span className="text-[0.65rem] sm:text-[0.7rem] text-[var(--color-muted)]">/ sq ft</span>
          {hasDiscount && <Price amount={original!} className="text-[0.65rem] sm:text-xs line-through text-[var(--color-muted)]" />}
        </div>
        {showAdd && (
          <AddToCart product={product} className="mt-2 sm:mt-3 opacity-0 group-hover:opacity-100 transition-opacity max-sm:opacity-100" />
        )}
      </div>
    </div>
  );
}
