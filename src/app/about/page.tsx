import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pagesRepo, productsRepo } from "@/lib/data/repos";
import { PageHero } from "@/components/ui/PageHero";
import { Prose } from "@/components/ui/Prose";
import { Reveal } from "@/components/ui/Reveal";
import { ProductCard } from "@/components/ui/ProductCard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "About Us" };

export default async function AboutPage() {
  const page = await pagesRepo.bySlug("about");
  if (!page || !page.published) notFound();
  const featured = await productsRepo.featured(4);
  return (
    <div>
      <PageHero eyebrow="Our Story" title={page.title} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <Reveal><Prose content={page.content} /></Reveal>
        {featured.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl mb-8">Featured Wallpapers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {featured.map((p) => <ProductCard key={p.id} product={p} showAdd={false} />)}
            </div>
            <Link href="/shop" className="btn-lux btn-lux--outline mt-10 inline-flex">Shop All Wallpapers</Link>
          </div>
        )}
      </div>
    </div>
  );
}
