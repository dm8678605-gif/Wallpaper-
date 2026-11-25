import type { Metadata } from "next";
import { productsRepo } from "@/lib/data/repos";
import { PageHero } from "@/components/ui/PageHero";
import { SimpleGrid } from "@/components/shop/SimpleGrid";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Search" };
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const products = await productsRepo.filter({ q, sort: "featured" });
  return (<div><PageHero eyebrow="Search" title={`Results for “${q}”`} subtitle={`${products.length} design${products.length === 1 ? "" : "s"} found`} /><SimpleGrid products={products} /></div>);
}
