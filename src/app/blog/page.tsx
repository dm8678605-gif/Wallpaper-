import type { Metadata } from "next";
import Link from "next/link";
import { blogRepo } from "@/lib/data/repos";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Journal" };

export default async function BlogPage() {
  const posts = await blogRepo.published();
  const [featured, ...rest] = posts;
  return (
    <div>
      <PageHero eyebrow="The Journal" title="Design Stories & Guides" subtitle="Ideas, inspiration and practical advice for beautiful walls." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        {featured && (
          <Reveal>
            <Link href={`/blog/${featured.slug}`} className="group grid md:grid-cols-2 gap-8 items-center mb-16">
              <div className="aspect-[16/10] overflow-hidden bg-[var(--color-accent)]/30">
                {featured.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featured.image} alt={featured.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                )}
              </div>
              <div>
                <p className="eyebrow">Latest</p>
                <h2 className="font-display text-3xl sm:text-4xl mt-3 group-hover:text-[var(--color-primary)] transition-colors">{featured.title}</h2>
                <p className="mt-4 text-[var(--color-muted)] leading-relaxed">{featured.excerpt}</p>
                <p className="text-xs text-[var(--color-muted)] mt-4">{formatDate(featured.publishedAt)}{featured.author ? ` · ${featured.author}` : ""}</p>
              </div>
            </Link>
          </Reveal>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {rest.map((p, i) => (
            <Reveal key={p.id} delay={(i % 6) * 0.05}>
              <Link href={`/blog/${p.slug}`} className="group block">
                <div className="aspect-[16/10] overflow-hidden bg-[var(--color-accent)]/30">
                  {p.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  )}
                </div>
                <p className="eyebrow mt-5">{p.tags[0]}</p>
                <h3 className="font-display text-xl mt-2 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">{p.title}</h3>
                <p className="text-sm text-[var(--color-muted)] mt-2 line-clamp-2">{p.excerpt}</p>
                <p className="text-xs text-[var(--color-muted)] mt-3">{formatDate(p.publishedAt)}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
