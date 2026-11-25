import type { Metadata } from "next";
import Link from "next/link";
import { galleryRepo } from "@/lib/data/repos";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Inspiration Gallery" };

export default async function InspirationPage() {
  const [items] = await Promise.all([galleryRepo.published()]);
  return (
    <div>
      <PageHero eyebrow="Visual Stories" title="Inspiration Gallery" subtitle="Real walls, real textures — find the look that speaks to you." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {items.map((g, i) => (
          <Reveal key={g.id} delay={(i % 8) * 0.03} className="break-inside-avoid">
            <Link href="/shop" className="group block relative overflow-hidden bg-[var(--color-accent)]/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.image} alt={g.title} loading="lazy" className="w-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white font-display">{g.title}</p>
                {g.category && <p className="text-white/70 text-xs mt-1">{g.category}</p>}
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
