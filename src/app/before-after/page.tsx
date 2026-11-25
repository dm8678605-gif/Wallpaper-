import type { Metadata } from "next";
import { projectsRepo } from "@/lib/data/repos";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Before & After" };

export default async function BeforeAfterPage() {
  const items = await projectsRepo.withBeforeAfter();
  return (
    <div>
      <PageHero eyebrow="Transformations" title="Before & After" subtitle="Drag-free comparisons — see how wallpaper transforms a plain wall into a statement." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 space-y-16">
        {items.map((p, i) => (
          <Reveal key={p.id}>
            <div className="grid md:grid-cols-2 gap-4">
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.beforeImage} alt={`${p.title} — before`} className="w-full aspect-[16/10] object-cover" />
                <figcaption className="text-center text-xs tracking-[0.3em] uppercase text-[var(--color-muted)] mt-3">Before</figcaption>
              </figure>
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.afterImage} alt={`${p.title} — after`} className="w-full aspect-[16/10] object-cover" />
                <figcaption className="text-center text-xs tracking-[0.3em] uppercase text-[var(--color-primary)] mt-3">After</figcaption>
              </figure>
            </div>
            <div className="text-center mt-6">
              <p className="font-display text-2xl">{p.title}</p>
              {p.location && <p className="text-sm text-[var(--color-muted)] mt-1">{p.location}</p>}
            </div>
          </Reveal>
        ))}
        <p className="text-center text-xs text-[var(--color-muted)]">* Showcase imagery is for demonstration purposes.</p>
      </div>
    </div>
  );
}
