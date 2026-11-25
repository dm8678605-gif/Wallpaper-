import type { Metadata } from "next";
import { materialsRepo } from "@/lib/data/repos";
import { FacetIndexGrid, PageHero } from "@/components/ui/PageHero";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shop by Material" };

export default async function Page() {
  const items = await materialsRepo.published();
  return (
    <div>
      <PageHero eyebrow="Browse" title="Shop by Material" subtitle="Find the perfect wallpaper for every space and style." />
      <FacetIndexGrid items={items.map((i) => ({ id: i.id, name: i.name, slug: i.slug, image: (i as { image?: string }).image, hex: (i as { hex?: string }).hex, description: (i as { description?: string }).description }))} hrefFor={(s) => "/material/" + s} label="Material" />
    </div>
  );
}
