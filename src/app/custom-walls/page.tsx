import type { Metadata } from "next";
import { productsRepo } from "@/lib/data/repos";
import { PageHero } from "@/components/ui/PageHero";
import { SimpleGrid } from "@/components/shop/SimpleGrid";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Custom Wallpapers" };
export default async function Page() {
  const products = await productsRepo.published();
  const list = products.filter(p=>p.collectionIds.length>0).slice(0,16);
  return (<div><PageHero eyebrow="Curated" title="Custom Wallpapers" subtitle="Design-led pieces ready for bespoke rooms." /><SimpleGrid products={list} /></div>);
}
