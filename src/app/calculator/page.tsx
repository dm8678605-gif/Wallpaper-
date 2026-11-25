import type { Metadata } from "next";
import { productsRepo, materialsRepo, settingsRepo } from "@/lib/data/repos";
import { Calculator } from "@/components/store/Calculator";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Wallpaper Calculator" };

export default async function CalculatorPage() {
  const [settings, materials, products] = await Promise.all([
    settingsRepo.get(), materialsRepo.published(), productsRepo.published(),
  ]);
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
      <p className="eyebrow text-center">Plan Ahead</p>
      <h1 className="font-display text-4xl sm:text-5xl text-center mt-3">Wallpaper Calculator</h1>
      <p className="text-center text-[var(--color-muted)] mt-4 max-w-xl mx-auto text-sm">
        Estimate rolls, cost and installation for any wall. Final pricing is validated at checkout.
      </p>
      <div className="mt-12">
        <Calculator
          settings={settings}
          materials={materials.map((m) => ({ id: m.id, name: m.name }))}
          products={products.slice(0, 60).map((p) => ({
            id: p.id, name: p.name, slug: p.slug, pricePerSqft: p.pricePerSqft,
            materialPricing: p.materialPricing, minOrderAreaSqft: p.minOrderAreaSqft,
            wastagePercent: p.wastagePercent, installationChargePerSqft: p.installationChargePerSqft,
            images: p.images,
          }))}
        />
      </div>
    </div>
  );
}
