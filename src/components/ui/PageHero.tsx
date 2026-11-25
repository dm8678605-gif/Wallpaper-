import Link from "next/link";
import { Reveal } from "./Reveal";

export function PageHero({ eyebrow, title, subtitle, image }: { eyebrow?: string; title: string; subtitle?: string; image?: string }) {
  return (
    <section className="relative h-60 sm:h-80 overflow-hidden bg-[var(--color-ink)]">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover opacity-50" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
      <div className="relative h-full flex items-end mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 pb-8 sm:pb-12">
        <Reveal>
          {eyebrow && <p className="eyebrow !text-[#B79A61] mb-2 sm:mb-3 text-[0.6rem] sm:text-[0.7rem]">{eyebrow}</p>}
          <h1 className="font-display text-2xl sm:text-4xl lg:text-6xl text-white leading-tight">{title}</h1>
          {subtitle && <p className="mt-3 sm:mt-4 text-white/80 max-w-xl text-xs sm:text-sm sm:text-base">{subtitle}</p>}
        </Reveal>
      </div>
    </section>
  );
}

export function FacetIndexGrid({ items, hrefFor, label }: { items: { id: string; name: string; image?: string; slug: string; hex?: string; description?: string }[]; hrefFor: (slug: string) => string; label: string }) {
  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-10 sm:py-16">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {items.map((it, i) => (
          <Reveal key={it.id} delay={i * 0.04}>
            <Link href={hrefFor(it.slug)} className="group block relative aspect-[4/3] overflow-hidden bg-[var(--color-accent)]/30">
              {it.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.image} alt={it.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : it.hex ? (
                <div className="h-full w-full" style={{ background: it.hex }} />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 p-3 sm:p-4">
                <p className="text-white font-display text-sm sm:text-lg">{it.name}</p>
                <p className="text-white/60 text-[0.55rem] sm:text-[0.65rem] tracking-[0.2em] sm:tracking-[0.25em] uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{label} →</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
