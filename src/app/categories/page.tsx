import type { Metadata } from "next";
import { categoriesRepo } from "@/lib/data/repos";
import { FacetIndexGrid, PageHero } from "@/components/ui/PageHero";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "All Wallpaper Categories" };

export default async function Page() {
  const items = await categoriesRepo.roots();
  return (
    <div>
      <PageHero eyebrow="Categories" title="All Wallpaper Categories" subtitle="From hand-painted florals to metallic luxe — explore every style." />
      <FacetIndexGrid items={items.map((i) => ({ id: i.id, name: i.name, slug: i.slug, image: i.image, description: i.description }))} hrefFor={(s) => "/category/" + s} label="Category" />
    </div>
  );
}
