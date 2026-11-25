import type { Metadata } from "next";
import { collectionsRepo } from "@/lib/data/repos";
import { FacetIndexGrid, PageHero } from "@/components/ui/PageHero";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shop by Collection" };

export default async function Page() {
  const items = await collectionsRepo.published();
  return (
    <div>
      <PageHero eyebrow="Browse" title="Shop by Collection" subtitle="Find the perfect wallpaper for every space and style." />
      <FacetIndexGrid items={items.map((i) => ({ id: i.id, name: i.name, slug: i.slug, image: (i as { image?: string }).image, hex: (i as { hex?: string }).hex, description: (i as { description?: string }).description }))} hrefFor={(s) => "/collection/" + s} label="Collection" />
    </div>
  );
}
