import Link from "next/link";
import { notFound } from "next/navigation";
import type { Category, Collection, Colour, Material, Room, StyleTag } from "@/lib/data/types";
import { productsRepo, categoriesRepo, collectionsRepo, roomsRepo, coloursRepo, materialsRepo, stylesRepo } from "@/lib/data/repos";
import { ShopBrowser, loadFacets, type ListingFilters } from "./ShopBrowser";
import type { ProductFilter } from "@/lib/data/repos";
import { Reveal } from "@/components/ui/Reveal";

type FacetKind = "category" | "collection" | "room" | "colour" | "material" | "style";

const PARAM_KEY: Record<FacetKind, keyof ListingFilters> = {
  category: "categoryId", collection: "collectionId", room: "roomId",
  colour: "colourId", material: "materialId", style: "styleId",
};

export async function FacetPage({
  kind,
  slug,
  searchParams,
}: {
  kind: FacetKind;
  slug: string;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);

  let entity: Category | Collection | Room | Colour | Material | StyleTag | null = null;

  if (kind === "category") {
    entity = await categoriesRepo.bySlug(slug);
    if (!entity) notFound();
  } else if (kind === "collection") {
    entity = await collectionsRepo.bySlug(slug);
    if (!entity) notFound();
  } else if (kind === "room") {
    entity = await roomsRepo.bySlug(slug);
    if (!entity) notFound();
  } else if (kind === "colour") {
    entity = await coloursRepo.bySlug(slug);
    if (!entity) notFound();
  } else if (kind === "material") {
    entity = await materialsRepo.bySlug(slug);
    if (!entity) notFound();
  } else {
    entity = await stylesRepo.bySlug(slug);
    if (!entity) notFound();
  }

  const filters: ListingFilters = {
    q: get("q"), sort: get("sort"),
    [PARAM_KEY[kind]]: entity.id,
    // preserve other active filters from querystring
    categoryId: kind === "category" ? entity.id : get("category"),
    collectionId: kind === "collection" ? entity.id : get("collection"),
    roomId: kind === "room" ? entity.id : get("room"),
    colourId: kind === "colour" ? entity.id : get("colour"),
    materialId: kind === "material" ? entity.id : get("material"),
    styleId: kind === "style" ? entity.id : get("style"),
  };

  const pf: ProductFilter = {
    q: filters.q,
    categoryId: filters.categoryId, collectionId: filters.collectionId, roomId: filters.roomId,
    colourId: filters.colourId, materialId: filters.materialId, styleId: filters.styleId,
    sort: (filters.sort as ProductFilter["sort"]) ?? "featured",
  };

  const [products, facets] = await Promise.all([productsRepo.filter(pf), loadFacets()]);

  const banner = (entity as Category).bannerImage ?? (entity as Collection).bannerImage ?? (entity as Room).image;
  const subcats = kind === "category" ? await categoriesRepo.children(entity.id) : [];

  return (
    <div>
      {/* Facet banner */}
      <section className="relative h-72 sm:h-96 overflow-hidden bg-[var(--color-ink)]">
        {banner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={banner} alt={entity.name} className="absolute inset-0 h-full w-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
        <div className="relative h-full flex items-end mx-auto max-w-7xl px-4 sm:px-6 pb-10">
          <Reveal>
            <p className="eyebrow !text-[#B79A61] mb-3">{kind === "category" ? "Category" : kind === "collection" ? "Collection" : `Shop by ${kind}`}</p>
            <h1 className="font-display text-4xl sm:text-6xl text-white">{entity.name}</h1>
            {"description" in entity && entity.description && <p className="mt-4 text-white/80 max-w-xl text-sm sm:text-base">{entity.description}</p>}
            {"hex" in entity && entity.hex && (
              <span className="inline-flex items-center gap-2 mt-4 text-white/80 text-sm">
                <span className="w-6 h-6 rounded-full border border-white/40 inline-block" style={{ background: entity.hex }} /> {entity.hex}
              </span>
            )}
          </Reveal>
        </div>
      </section>

      {subcats.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8">
          <div className="flex flex-wrap gap-2">
            {subcats.map((s) => (
              <Link key={s.id} href={`/category/${s.slug}`} className="px-4 py-2 text-xs tracking-widest uppercase border hairline hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors">
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <ShopBrowser products={products} filters={filters} total={products.length} basePath={`/${kind === "category" ? "category" : kind === "collection" ? "collection" : kind === "room" ? "room" : kind === "colour" ? "colour" : kind === "material" ? "material" : "style"}`} {...facets} />
    </div>
  );
}
