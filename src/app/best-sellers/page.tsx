import type { Metadata } from "next";
import { productsRepo } from "@/lib/data/repos";
import { PageHero } from "@/components/ui/PageHero";
import { SimpleGrid } from "@/components/shop/SimpleGrid";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Best Sellers" };
export default async function Page() {
  const products = await productsRepo.published();
  const list = products.filter(p=>p.featured).slice(0,16);
  return (<div><PageHero eyebrow="Curated" title="Best Sellers" subtitle="Our most-loved wallpaper designs." /><SimpleGrid products={list} /></div>);
}
