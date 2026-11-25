import type { Metadata } from "next";
import { productsRepo } from "@/lib/data/repos";
import { PageHero } from "@/components/ui/PageHero";
import { SimpleGrid } from "@/components/shop/SimpleGrid";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New Arrivals" };
export default async function Page() {
  const products = await productsRepo.published();
  const list = products.slice(0,16);
  return (<div><PageHero eyebrow="Curated" title="New Arrivals" subtitle="The latest additions to our collection." /><SimpleGrid products={list} /></div>);
}
