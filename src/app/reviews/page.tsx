import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { reviewsRepo, productsRepo } from "@/lib/data/repos";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Star } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const reviews = await reviewsRepo.all();
  const approved = reviews.filter((r) => r.status === "approved");
  const products = await productsRepo.all();
  const nameOf = (id: string) => products.find((p) => p.id === id)?.name ?? "Wallpaper";

  return (
    <div>
      <PageHero eyebrow="Testimonials" title="Customer Reviews" subtitle="What clients say about our wallpapers and service." />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        {approved.length === 0 ? (
          <p className="text-center text-[var(--color-muted)] py-16">No reviews published yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {approved.map((r, i) => (
              <Reveal key={r.id} delay={(i % 4) * 0.05}>
                <div className="border hairline bg-[var(--color-surface)] p-6 h-full">
                  <p className="text-[var(--color-primary)] flex gap-0.5">{Array.from({ length: 5 }).map((_, s) => <Star key={s} size={14} className={s < r.rating ? "fill-[var(--color-primary)]" : "text-black/15"} />)}</p>
                  {r.title && <p className="font-semibold mt-3">{r.title}</p>}
                  <p className="text-sm text-[var(--color-muted)] mt-2 leading-relaxed">{r.body}</p>
                  <p className="text-xs text-[var(--color-muted)] mt-4">— {r.authorName}{r.authorLocation ? `, ${r.authorLocation}` : ""}</p>
                  <Link href={`/product/${products.find((p) => p.id === r.productId)?.slug ?? ""}`} className="text-xs text-[var(--color-primary)] hover:underline mt-2 inline-block">
                    on {nameOf(r.productId)}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
