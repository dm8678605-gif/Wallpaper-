import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, Truck, ShieldCheck, RotateCcw, Ruler } from "lucide-react";
import {
  productsRepo, categoriesRepo, materialsRepo, reviewsRepo, settingsRepo,
} from "@/lib/data/repos";
import { ProductPurchase } from "@/components/store/ProductPurchase";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { Price } from "@/components/store/Price";
import { SampleOrderButton } from "@/components/store/SampleOrderButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await productsRepo.bySlug(slug);
  if (!p) return {};
  return { title: p.seo?.title ?? p.name, description: p.seo?.description ?? p.shortDescription };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await productsRepo.bySlug(slug);
  if (!product || !product.published) notFound();

  const [category, settings, reviews, allProducts, materials] = await Promise.all([
    categoriesRepo.get(product.categoryId),
    settingsRepo.get(),
    reviewsRepo.forProduct(product.id),
    productsRepo.published(),
    materialsRepo.published(),
  ]);

  const productMaterials = materials.filter((m) => product.materialIds.includes(m.id));
  const related = allProducts
    .filter((p) => p.id !== product.id && (p.categoryId === product.categoryId || p.collectionIds.some((c) => product.collectionIds.includes(c))))
    .slice(0, 4);

  const primaryImg = product.images.find((i) => i.primary)?.url ?? product.images[0]?.url;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[var(--color-muted)] mb-8 flex-wrap">
        <Link href="/" className="hover:text-[var(--color-primary)]">Home</Link>
        <ChevronRight size={12} />
        <Link href="/shop" className="hover:text-[var(--color-primary)]">Shop</Link>
        {category && (<><ChevronRight size={12} /><Link href={`/category/${category.slug}`} className="hover:text-[var(--color-primary)]">{category.name}</Link></>)}
        <ChevronRight size={12} />
        <span className="text-[var(--color-ink)]">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div>
          <Reveal>
            <div className="aspect-[3/4] bg-[var(--color-accent)]/30 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={primaryImg} alt={product.name} className="h-full w-full object-cover" />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mt-3">
                {product.images.map((im) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={im.id} src={im.url} alt={im.alt ?? product.name} className="aspect-[3/4] object-cover border hairline" />
                ))}
              </div>
            )}
          </Reveal>
        </div>

        {/* Info */}
        <div>
          <Reveal>
            <p className="eyebrow">{product.code} · {category?.name}</p>
            <h1 className="font-display text-3xl sm:text-5xl mt-3 leading-tight">{product.name}</h1>
            {product.rating != null && (
              <p className="mt-3 text-sm text-[var(--color-muted)]">★ {product.rating.toFixed(1)} · {product.reviewCount ?? 0} reviews</p>
            )}
            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-display text-3xl"><Price amount={product.pricePerSqft} /></span>
              <span className="text-sm text-[var(--color-muted)]">per sq ft</span>
              {product.originalPricePerSqft && product.originalPricePerSqft > product.pricePerSqft && (
                <span className="text-sm line-through text-[var(--color-muted)]"><Price amount={product.originalPricePerSqft} /></span>
              )}
            </div>
            <p className="mt-5 text-[var(--color-muted)] leading-relaxed">{product.description}</p>

            {/* Stock */}
            <p className={`mt-4 text-xs tracking-widest uppercase ${product.stockStatus === "out-of-stock" ? "text-red-600" : "text-[var(--color-secondary)]"}`}>
              ● {product.stockStatus.replace("-", " ")}
            </p>

            <div className="mt-6">
              <ProductPurchase
                product={product}
                materials={productMaterials.map((m) => ({ id: m.id, name: m.name }))}
                pricing={{
                  minOrderAreaSqft: product.minOrderAreaSqft,
                  wastagePercent: product.wastagePercent,
                  installationPerSqft: product.installationChargePerSqft,
                  rollWidthFt: settings.calculator.rollWidthFt,
                  shippingFlat: settings.shipping.flatCharge,
                  shippingFreeAbove: settings.shipping.freeAbove,
                  taxPercent: settings.tax.enabled ? settings.tax.percent : 0,
                }}
              />
              {product.samplePrice != null && (
                <SampleOrderButton product={product} />
              )}
            </div>

            {/* Services strip */}
            <div className="grid grid-cols-3 gap-3 mt-8 pt-8 border-t hairline text-center">
              {[
                { icon: Truck, label: settings.shipping.estimatedDays, sub: "Estimated delivery" },
                { icon: ShieldCheck, label: "Quality assured", sub: "Premium print" },
                { icon: RotateCcw, label: "Easy returns", sub: "On unused rolls" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label}>
                  <Icon size={20} className="mx-auto text-[var(--color-primary)]" />
                  <p className="text-xs font-semibold mt-2">{label}</p>
                  <p className="text-[0.65rem] text-[var(--color-muted)]">{sub}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* Specs */}
      {product.specs.length > 0 && (
        <section className="mt-20">
          <Reveal>
            <h2 className="font-display text-2xl sm:text-3xl mb-8">Specifications</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {product.specs.map((s) => (
                <div key={s.label} className="border hairline p-5 bg-[var(--color-surface)]">
                  <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[var(--color-muted)]">{s.label}</p>
                  <p className="mt-2 font-medium">{s.value}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {product.installationInstructions && (
        <section className="mt-16 max-w-3xl">
          <Reveal>
            <h2 className="font-display text-2xl sm:text-3xl mb-4 flex items-center gap-3"><Ruler size={22} className="text-[var(--color-primary)]" /> Installation Guide</h2>
            <p className="text-[var(--color-muted)] leading-relaxed whitespace-pre-line">{product.installationInstructions}</p>
          </Reveal>
        </section>
      )}

      {/* Reviews */}
      <section className="mt-20">
        <Reveal>
          <h2 className="font-display text-2xl sm:text-3xl mb-8">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-[var(--color-muted)] text-sm">No reviews yet. Be the first to share your experience after purchase.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {reviews.map((r) => (
                <div key={r.id} className="border hairline p-6 bg-[var(--color-surface)]">
                  <p className="text-[var(--color-primary)]">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                  <p className="font-semibold mt-2">{r.title}</p>
                  <p className="text-sm text-[var(--color-muted)] mt-2 leading-relaxed">{r.body}</p>
                  <p className="text-xs text-[var(--color-muted)] mt-4">— {r.authorName}{r.authorLocation ? `, ${r.authorLocation}` : ""}</p>
                </div>
              ))}
            </div>
          )}
        </Reveal>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-24">
          <Reveal className="mb-10">
            <p className="eyebrow">You may also like</p>
            <h2 className="font-display text-3xl sm:text-4xl mt-3">Related Wallpapers</h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
