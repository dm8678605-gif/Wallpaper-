import type { Metadata } from "next";
import { productsRepo } from "@/lib/data/repos";
import { PageHero } from "@/components/ui/PageHero";
import { SimpleGrid } from "@/components/shop/SimpleGrid";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Trending Wallpapers" };
export default async function Page() {
  const products = await productsRepo.published();
  const list = [...products].sort((a,b)=>(b.reviewCount??0)-(a.reviewCount??0)).slice(0,16);
  return (<div><PageHero eyebrow="Curated" title="Trending Wallpapers" subtitle="What everyone is pinning right now." /><SimpleGrid products={list} /></div>);
}
