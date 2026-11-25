import type { Product } from "@/lib/data/types";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
export function SimpleGrid({ products }: { products: Product[] }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {products.map((p, i) => <Reveal key={p.id} delay={(i % 8) * 0.04}><ProductCard product={p} /></Reveal>)}
      </div>
      {products.length === 0 && <p className="text-center text-[var(--color-muted)] py-20 text-sm">No products found.</p>}
    </div>
  );
}
