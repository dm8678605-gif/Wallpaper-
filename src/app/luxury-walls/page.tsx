import type { Metadata } from "next";
import { productsRepo } from "@/lib/data/repos";
import { PageHero } from "@/components/ui/PageHero";
import { SimpleGrid } from "@/components/shop/SimpleGrid";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Luxury Wallpapers" };
export default async function Page() {
  const products = await productsRepo.published();
  const list = products.filter(p=>p.pricePerSqft>=120).slice(0,16);
  return (<div><PageHero eyebrow="Curated" title="Luxury Wallpapers" subtitle="Premium finishes for statement walls." /><SimpleGrid products={list} /></div>);
}
