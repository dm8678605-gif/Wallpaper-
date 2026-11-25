import type { Metadata } from "next";
import Link from "next/link";
import { productsRepo, settingsRepo } from "@/lib/data/repos";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Price } from "@/components/store/Price";
import { SampleOrderButton } from "@/components/store/SampleOrderButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Wallpaper Samples" };

export default async function SamplesPage() {
  const [products, settings] = await Promise.all([
    productsRepo.published(), settingsRepo.get(),
  ]);
  const sampleProducts = products.filter((p) => p.samplePrice != null);

  return (
    <div>
      <PageHero
        eyebrow="Try Before You Commit"
        title="Wallpaper Samples"
        subtitle={`Order physical samples to see true colour and texture at home. Sample fee from ${settings.currency.symbol}199.`}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {sampleProducts.map((p, i) => (
            <Reveal key={p.id} delay={(i % 8) * 0.04}>
              <div className="bg-[var(--color-surface)] border hairline overflow-hidden card-hover">
                <Link href={`/product/${p.slug}`} className="block aspect-[3/4] bg-[var(--color-accent)]/30 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.images.find((x) => x.primary)?.url ?? p.images[0]?.url} alt={p.name} loading="lazy" className="h-full w-full object-cover hover:scale-105 transition-transform duration-700" />
                </Link>
                <div className="p-4">
                  <Link href={`/product/${p.slug}`} className="font-display text-base hover:text-[var(--color-primary)] transition-colors line-clamp-1">{p.name}</Link>
                  <p className="text-xs text-[var(--color-muted)] mt-1">Sample: <Price amount={p.samplePrice!} /></p>
                  <SampleOrderButton productIds={[p.id]} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="text-center text-xs text-[var(--color-muted)] mt-12">Sample orders are shipped to your address and tracked in the admin panel. *Sample pricing shown is for demonstration.</p>
      </div>
    </div>
  );
}
