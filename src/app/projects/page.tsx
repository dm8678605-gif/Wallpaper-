import type { Metadata } from "next";
import Link from "next/link";
import { projectsRepo, categoriesRepo } from "@/lib/data/repos";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Client Projects" };

export default async function ProjectsPage() {
  const [projects, categories] = await Promise.all([projectsRepo.published(), categoriesRepo.all()]);
  const catName = (id?: string) => categories.find((c) => c.id === id)?.name;
  return (
    <div>
      <PageHero eyebrow="Portfolio" title="Client Projects" subtitle="A curated selection of installations — sample showcase imagery for demonstration." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.filter((p) => p.beforeImage == null).map((p, i) => (
            <Reveal key={p.id} delay={(i % 6) * 0.05}>
              <div className="bg-[var(--color-surface)] border hairline overflow-hidden card-hover">
                <div className="grid grid-cols-2 gap-1">
                  {p.images.slice(0, 2).map((img, j) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={j} src={img} alt={p.title} loading="lazy" className="aspect-[4/3] object-cover" />
                  ))}
                </div>
                <div className="p-5">
                  <p className="font-display text-xl">{p.title}</p>
                  <p className="text-xs text-[var(--color-muted)] mt-1">{p.location}{p.client ? ` · ${p.client}` : ""}</p>
                  {p.categoryId && <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[var(--color-primary)] mt-2">{catName(p.categoryId)}</p>}
                  {p.description && <p className="text-sm text-[var(--color-muted)] mt-3 line-clamp-2">{p.description}</p>}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
