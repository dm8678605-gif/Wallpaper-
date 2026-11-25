import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  bannersRepo, categoriesRepo, collectionsRepo, coloursRepo,
  galleryRepo, homepageRepo, materialsRepo, productsRepo, roomsRepo, stylesRepo,
} from "@/lib/data/repos";
import type { HomepageSection, Product } from "@/lib/data/types";
import { HeroCarousel } from "./HeroCarousel";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal } from "@/components/ui/Reveal";

const BG: Record<string, string> = {
  ivory: "bg-[var(--color-bg)]",
  white: "bg-[var(--color-surface)]",
  espresso: "bg-[var(--color-ink)] text-[#EDE6DA]",
  gold: "bg-[var(--color-primary)] text-[#30251F]",
  olive: "bg-[var(--color-secondary)] text-[#F8F5EE]",
};

function SectionShell({ section, children, dark }: { section: HomepageSection; children: React.ReactNode; dark?: boolean }) {
  return (
    <section className={`section-pad ${BG[section.background ?? ""] ?? (dark ? BG.espresso : BG.ivory)}`}>
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        {(section.title || section.subtitle) && (
          <Reveal className="text-center mb-8 sm:mb-12">
            {section.title && <h2 className="font-display text-2xl sm:text-3xl lg:text-5xl mt-2 sm:mt-3">{section.title}</h2>}
            {section.subtitle && <p className={`mt-3 sm:mt-4 max-w-2xl mx-auto text-xs sm:text-sm sm:text-base ${dark || section.background === "espresso" || section.background === "olive" || section.background === "gold" ? "opacity-80" : "text-[var(--color-muted)]"}`}>{section.subtitle}</p>}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}

async function resolveProducts(source?: string, limit = 8): Promise<Product[]> {
  if (!source) return [];
  if (source === "featured") return productsRepo.featured(limit);
  if (source.startsWith("category:")) {
    const slug = source.split(":")[1];
    const cat = await categoriesRepo.bySlug(slug);
    return cat ? productsRepo.byCategory(cat.id).then((p) => p.slice(0, limit)) : [];
  }
  if (source.startsWith("collection:")) {
    const slug = source.split(":")[1];
    const col = await collectionsRepo.bySlug(slug);
    if (!col) return [];
    const all = await productsRepo.published();
    return all.filter((p) => p.collectionIds.includes(col.id)).slice(0, limit);
  }
  const all = await productsRepo.published();
  return all.slice(0, limit);
}

function ProductRail({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {products.map((p, i) => (
        <Reveal key={p.id} delay={i * 0.05}>
          <ProductCard product={p} />
        </Reveal>
      ))}
    </div>
  );
}

function FacetGrid({ items, hrefFor, limit }: { items: { id: string; name: string; image?: string; slug: string; hex?: string }[]; hrefFor: (slug: string) => string; limit: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {items.slice(0, limit).map((it, i) => (
        <Reveal key={it.id} delay={i * 0.04}>
          <Link href={hrefFor(it.slug)} className="group block relative aspect-[4/5] overflow-hidden bg-[var(--color-accent)]/30">
            {it.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.image} alt={it.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
            ) : it.hex ? (
              <div className="h-full w-full" style={{ background: it.hex }} />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 p-4 w-full">
              <p className="text-white font-display text-lg">{it.name}</p>
              <p className="text-white/70 text-[0.65rem] tracking-[0.25em] uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Explore →</p>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

export async function HomeSections() {
  const sections = await homepageRepo.sections();
  const out: React.ReactNode[] = [];

  for (const s of sections.filter((x) => x.visible)) {
    switch (s.type) {
      case "hero": {
        const banners = await bannersRepo.published("hero");
        out.push(<HeroCarousel key={s.id} banners={banners} />);
        break;
      }
      case "featured-products": {
        const products = await resolveProducts(s.itemsSource ?? "featured", s.limit ?? 8);
        out.push(<SectionShell key={s.id} section={s}><ProductRail products={products} /></SectionShell>);
        break;
      }
      case "categories": {
        const cats = await categoriesRepo.roots();
        out.push(
          <SectionShell key={s.id} section={s}>
            <FacetGrid items={cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug, image: c.image }))} hrefFor={(slug) => `/category/${slug}`} limit={s.limit ?? 8} />
          </SectionShell>
        );
        break;
      }
      case "collections": {
        const cols = await collectionsRepo.published();
        out.push(
          <SectionShell key={s.id} section={s}>
            <FacetGrid items={cols.map((c) => ({ id: c.id, name: c.name, slug: c.slug, image: c.image }))} hrefFor={(slug) => `/collection/${slug}`} limit={s.limit ?? 6} />
          </SectionShell>
        );
        break;
      }
      case "rooms": {
        const rooms = await roomsRepo.published();
        out.push(
          <SectionShell key={s.id} section={s}>
            <FacetGrid items={rooms.map((r) => ({ id: r.id, name: r.name, slug: r.slug, image: r.image }))} hrefFor={(slug) => `/room/${slug}`} limit={s.limit ?? 8} />
          </SectionShell>
        );
        break;
      }
      case "colours": {
        const cols = await coloursRepo.published();
        out.push(
          <SectionShell key={s.id} section={s}>
            <FacetGrid items={cols.map((c) => ({ id: c.id, name: c.name, slug: c.slug, image: c.image, hex: c.hex }))} hrefFor={(slug) => `/colour/${slug}`} limit={s.limit ?? 10} />
          </SectionShell>
        );
        break;
      }
      case "materials": {
        const mats = await materialsRepo.published();
        out.push(
          <SectionShell key={s.id} section={s}>
            <FacetGrid items={mats.map((m) => ({ id: m.id, name: m.name, slug: m.slug, image: m.image }))} hrefFor={(slug) => `/material/${slug}`} limit={s.limit ?? 10} />
          </SectionShell>
        );
        break;
      }
      case "styles": {
        const styles = await stylesRepo.published();
        out.push(
          <SectionShell key={s.id} section={s}>
            <FacetGrid items={styles.map((t) => ({ id: t.id, name: t.name, slug: t.slug, image: t.image }))} hrefFor={(slug) => `/style/${slug}`} limit={s.limit ?? 12} />
          </SectionShell>
        );
        break;
      }
      case "banner": {
        const bg = s.background === "espresso" ? "bg-[var(--color-ink)] text-[#EDE6DA]" : s.background === "gold" ? "bg-[var(--color-primary)]" : "bg-[var(--color-secondary)] text-[#F8F5EE]";
        out.push(
          <section key={s.id} className={`section-pad ${bg}`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <Reveal className="grid lg:grid-cols-2 gap-10 items-center">
                <div>
                  {s.title && <h2 className="font-display text-3xl sm:text-5xl">{s.title}</h2>}
                  {s.content && <p className="mt-5 opacity-85 leading-relaxed max-w-lg">{s.content}</p>}
                  {s.link && <Link href={s.link} className="btn-lux mt-8">{s.linkLabel ?? "Learn More"} <ArrowRight size={14} /></Link>}
                </div>
                {s.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image} alt={s.title ?? ""} className="w-full h-72 lg:h-96 object-cover" />
                )}
              </Reveal>
            </div>
          </section>
        );
        break;
      }
      case "editorial": {
        out.push(
          <section key={s.id} className={`section-pad ${BG[s.background ?? "ivory"]}`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <Reveal className="grid lg:grid-cols-2 gap-12 items-center">
                {s.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image} alt={s.title ?? ""} className="w-full h-80 lg:h-[480px] object-cover order-2 lg:order-1" />
                )}
                <div className={s.image ? "order-1 lg:order-2" : ""}>
                  {s.title && <h2 className="font-display text-3xl sm:text-5xl">{s.title}</h2>}
                  {s.content && <p className="mt-6 text-[var(--color-muted)] leading-relaxed whitespace-pre-line">{s.content}</p>}
                  {s.link && <Link href={s.link} className="btn-lux btn-lux--outline mt-8">{s.linkLabel ?? "Read More"} <ArrowRight size={14} /></Link>}
                </div>
              </Reveal>
            </div>
          </section>
        );
        break;
      }
      case "inspiration": {
        const items = (await galleryRepo.published()).slice(0, s.limit ?? 6);
        out.push(
          <SectionShell key={s.id} section={s}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((g, i) => (
                <Reveal key={g.id} delay={i * 0.05}>
                  <Link href="/inspiration" className="group block relative aspect-[3/4] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.image} alt={g.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="absolute bottom-3 left-3 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">{g.title}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/inspiration" className="btn-lux btn-lux--outline">View Gallery <ArrowRight size={14} /></Link>
            </div>
          </SectionShell>
        );
        break;
      }
      case "custom-cta": {
        out.push(
          <SectionShell key={s.id} section={s} dark>
            <div className="text-center max-w-2xl mx-auto">
              {s.title && <h2 className="font-display text-3xl sm:text-5xl">{s.title}</h2>}
              {s.content && <p className="mt-5 opacity-80">{s.content}</p>}
              {s.link && <Link href={s.link} className="btn-lux mt-8 !bg-[#B79A61] !border-[#B79A61] !text-[#30251F]">{s.linkLabel ?? "Get Started"}</Link>}
            </div>
          </SectionShell>
        );
        break;
      }
      default:
        break;
    }
  }
  return <>{out}</>;
}
