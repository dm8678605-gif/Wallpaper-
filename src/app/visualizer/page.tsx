import type { Metadata } from "next";
import { productsRepo } from "@/lib/data/repos";
import { PageHero } from "@/components/ui/PageHero";
import { SimpleGrid } from "@/components/shop/SimpleGrid";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Wallpaper Visualizer" };
export default async function Page() {
  const products = await productsRepo.published();
  const list = products.slice(0,8);
  return (<div><PageHero eyebrow="Curated" title="Wallpaper Visualizer" subtitle="Preview wallpapers in your space — upload a room photo coming soon." /><SimpleGrid products={list} /></div>);
}
