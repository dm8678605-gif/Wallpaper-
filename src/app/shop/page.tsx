import type { Metadata } from "next";
import { productsRepo, settingsRepo } from "@/lib/data/repos";
import { ShopBrowser, loadFacets, type ListingFilters } from "@/components/shop/ShopBrowser";
import type { ProductFilter } from "@/lib/data/repos";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Shop All Wallpapers" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const get = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);

  const filters: ListingFilters = {
    q: get("q"), categoryId: get("category"), collectionId: get("collection"),
    roomId: get("room"), colourId: get("colour"), materialId: get("material"),
    styleId: get("style"), sort: get("sort"),
  };

  const pf: ProductFilter = {
    q: filters.q, categoryId: filters.categoryId, collectionId: filters.collectionId,
    roomId: filters.roomId, colourId: filters.colourId, materialId: filters.materialId,
    styleId: filters.styleId,
    sort: (filters.sort as ProductFilter["sort"]) ?? "featured",
  };

  const [products, facets, settings] = await Promise.all([
    productsRepo.filter(pf), loadFacets(), settingsRepo.get(),
  ]);
  void settings;

  return (
    <div className="pt-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 pb-2">
        <p className="eyebrow">The Collection</p>
        <h1 className="font-display text-4xl sm:text-5xl mt-2">Shop Wallpapers</h1>
        <p className="text-[var(--color-muted)] mt-3 max-w-xl text-sm">
          Every design in our library — filter by style, room, colour or material.
        </p>
      </div>
      <ShopBrowser
        products={products}
        filters={filters}
        total={products.length}
        basePath="/shop"
        {...facets}
      />
    </div>
  );
}
