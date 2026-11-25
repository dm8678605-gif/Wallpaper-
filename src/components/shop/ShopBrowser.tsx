import Link from "next/link";
import { Search } from "lucide-react";
import type { Category, Colour, Material, Product, Room, StyleTag, Collection } from "@/lib/data/types";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal } from "@/components/ui/Reveal";

export interface ListingFilters {
  q?: string;
  categoryId?: string;
  collectionId?: string;
  roomId?: string;
  colourId?: string;
  materialId?: string;
  styleId?: string;
  sort?: string;
}

function hrefWith(base: Record<string, string | undefined>, patch: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  const merged = { ...base, ...patch };
  for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
  const s = params.toString();
  return `/shop${s ? `?${s}` : ""}`;
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b hairline py-5">
      <p className="text-[0.68rem] tracking-[0.25em] uppercase font-semibold text-[var(--color-muted)] mb-4">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`block text-sm py-1 transition-colors ${active ? "text-[var(--color-primary)] font-semibold" : "text-[var(--color-ink)]/80 hover:text-[var(--color-primary)]"}`}>
      {children}
    </Link>
  );
}

export function ShopBrowser({
  products,
  filters,
  categories,
  collections,
  rooms,
  colours,
  materials,
  styles,
  total,
  basePath = "/shop",
}: {
  products: Product[];
  filters: ListingFilters;
  categories: Category[];
  collections: Collection[];
  rooms: Room[];
  colours: Colour[];
  materials: Material[];
  styles: StyleTag[];
  total: number;
  basePath?: string;
}) {
  // On facet pages the filter links keep the facet fixed by merging its id into every href.
  const base: Record<string, string | undefined> = {
    q: filters.q, category: filters.categoryId, collection: filters.collectionId,
    room: filters.roomId, colour: filters.colourId, material: filters.materialId,
    style: filters.styleId, sort: filters.sort,
  };
  const facetBase = basePath !== "/shop"
    ? { ...base, [basePath.replace("/", "").replace("/", "_")]: undefined }
    : base;
  void facetBase;

  const linkBase = { ...base };
  // keep facet constraints when on facet pages
  if (basePath.startsWith("/category")) linkBase.category = filters.categoryId;
  if (basePath.startsWith("/collection")) linkBase.collection = filters.collectionId;
  if (basePath.startsWith("/room")) linkBase.room = filters.roomId;
  if (basePath.startsWith("/colour")) linkBase.colour = filters.colourId;
  if (basePath.startsWith("/material")) linkBase.material = filters.materialId;
  if (basePath.startsWith("/style")) linkBase.style = filters.styleId;

  const roots = categories.filter((c) => !c.parentId && c.published);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar */}
        <aside className="lg:w-60 shrink-0">
          <form action="/shop" method="get" className="mb-6">
            {Object.entries(linkBase).filter(([k]) => k !== "q").map(([k, v]) => v ? <input key={k} type="hidden" name={k} value={v} /> : null)}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              <input name="q" defaultValue={filters.q} placeholder="Search…" className="input-lux !pl-9 !py-2.5 text-sm" />
            </div>
          </form>
          <FilterGroup title="Category">
            <FilterLink href={hrefWith(linkBase, { category: undefined })} active={!filters.categoryId}>All</FilterLink>
            {roots.map((c) => (
              <FilterLink key={c.id} href={hrefWith(linkBase, { category: c.id })} active={filters.categoryId === c.id}>{c.name}</FilterLink>
            ))}
          </FilterGroup>
          <FilterGroup title="Collection">
            <FilterLink href={hrefWith(linkBase, { collection: undefined })} active={!filters.collectionId}>All</FilterLink>
            {collections.slice(0, 8).map((c) => (
              <FilterLink key={c.id} href={hrefWith(linkBase, { collection: c.id })} active={filters.collectionId === c.id}>{c.name}</FilterLink>
            ))}
          </FilterGroup>
          <FilterGroup title="Room">
            <FilterLink href={hrefWith(linkBase, { room: undefined })} active={!filters.roomId}>All</FilterLink>
            {rooms.slice(0, 10).map((r) => (
              <FilterLink key={r.id} href={hrefWith(linkBase, { room: r.id })} active={filters.roomId === r.id}>{r.name}</FilterLink>
            ))}
          </FilterGroup>
          <FilterGroup title="Colour">
            <div className="flex flex-wrap gap-2">
              {colours.slice(0, 12).map((c) => (
                <Link key={c.id} href={hrefWith(linkBase, { colour: filters.colourId === c.id ? undefined : c.id })} title={c.name}
                  className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${filters.colourId === c.id ? "border-[var(--color-primary)] scale-110" : "border-black/10"}`}
                  style={{ background: c.hex }} />
              ))}
            </div>
          </FilterGroup>
          <FilterGroup title="Material">
            {materials.map((m) => (
              <FilterLink key={m.id} href={hrefWith(linkBase, { material: m.id })} active={filters.materialId === m.id}>{m.name}</FilterLink>
            ))}
          </FilterGroup>
          <FilterGroup title="Style">
            {styles.slice(0, 12).map((s) => (
              <FilterLink key={s.id} href={hrefWith(linkBase, { style: s.id })} active={filters.styleId === s.id}>{s.name}</FilterLink>
            ))}
          </FilterGroup>
          <FilterGroup title="Sort">
            {([["featured", "Featured"], ["price-asc", "Price: Low to High"], ["price-desc", "Price: High to Low"], ["name", "Name A–Z"]] as const).map(([v, label]) => (
              <FilterLink key={v} href={hrefWith(linkBase, { sort: v === "featured" ? undefined : v })} active={(filters.sort ?? "featured") === v}>{label}</FilterLink>
            ))}
          </FilterGroup>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          <p className="text-sm text-[var(--color-muted)] mb-6">{total} design{total === 1 ? "" : "s"} found</p>
          {products.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-display text-2xl mb-3">No wallpapers found</p>
              <p className="text-[var(--color-muted)] text-sm">Try adjusting your filters or search.</p>
              <Link href="/shop" className="btn-lux btn-lux--outline mt-8">Clear Filters</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map((p, i) => (
                <Reveal key={p.id} delay={(i % 8) * 0.04}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Server helper: load all filter taxonomies (published only). */
export async function loadFacets() {
  const [categories, collections, rooms, colours, materials, styles] = await Promise.all([
    import("@/lib/data/repos").then((r) => r.categoriesRepo.published()),
    import("@/lib/data/repos").then((r) => r.collectionsRepo.published()),
    import("@/lib/data/repos").then((r) => r.roomsRepo.published()),
    import("@/lib/data/repos").then((r) => r.coloursRepo.published()),
    import("@/lib/data/repos").then((r) => r.materialsRepo.published()),
    import("@/lib/data/repos").then((r) => r.stylesRepo.published()),
  ]);
  return { categories, collections, rooms, colours, materials, styles };
}
