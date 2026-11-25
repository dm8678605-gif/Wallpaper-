"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Ruler, ShoppingBag, Zap } from "lucide-react";
import { useStore, type PricingOpts } from "./StoreProvider";
import type { Product } from "@/lib/data/types";
import { computePricing, resolveUnitPrice, round2 } from "@/lib/pricing";
import { Price } from "./Price";

const UNITS = [
  { v: "ft", l: "Feet" }, { v: "in", l: "Inches" }, { v: "cm", l: "Centimetres" }, { v: "m", l: "Metres" },
] as const;

export function ProductPurchase({
  product,
  materials,
  pricing,
}: {
  product: Product;
  materials: { id: string; name: string }[];
  pricing: PricingOpts;
}) {
  const { addToCart, buyNow } = useStore();
  const router = useRouter();
  const [materialId, setMaterialId] = useState<string>("");
  const [width, setWidth] = useState("12");
  const [height, setHeight] = useState("9");
  const [unit, setUnit] = useState<"ft" | "in" | "cm" | "m">("ft");
  const [walls, setWalls] = useState(1);
  const [qty, setQty] = useState(1);
  const [includeInstall, setIncludeInstall] = useState(true);
  const [added, setAdded] = useState(false);

  const unitPrice = resolveUnitPrice(product, materialId || undefined);

  const breakdown = useMemo(() => {
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    if (w <= 0 || h <= 0) return null;
    return computePricing(
      { width: w, height: h, unit, walls, includeInstallation: includeInstall, productId: product.id, materialId: materialId || undefined, pricePerSqft: unitPrice },
      {
        pricePerSqft: unitPrice,
        minOrderAreaSqft: pricing.minOrderAreaSqft ?? product.minOrderAreaSqft,
        defaultWastagePercent: pricing.wastagePercent ?? product.wastagePercent,
        defaultInstallationPerSqft: pricing.installationPerSqft ?? product.installationChargePerSqft,
        rollWidthFt: pricing.rollWidthFt ?? 2.05,
        shippingFlat: pricing.shippingFlat ?? 0,
        shippingFreeAbove: pricing.shippingFreeAbove ?? Infinity,
        taxPercent: pricing.taxPercent ?? 0,
      }
    );
  }, [width, height, unit, walls, includeInstall, product, materialId, unitPrice, pricing, qty]);

  const lineOpts = () => ({
    materialId: materialId || undefined,
    width: parseFloat(width) || 10,
    height: parseFloat(height) || 8,
    unit,
    walls,
    quantity: qty,
  });

  return (
    <div className="space-y-6">
      {/* Material selector */}
      <div>
        <p className="label-lux">Material / Finish</p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setMaterialId("")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[0.65rem] sm:text-xs tracking-wide border transition-colors ${!materialId ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "border-black/15 hover:border-[var(--color-primary)]"}`}
          >
            Standard — <Price amount={product.pricePerSqft} />/sqft
          </button>
          {materials.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMaterialId(m.id)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[0.65rem] sm:text-xs tracking-wide border transition-colors ${materialId === m.id ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "border-black/15 hover:border-[var(--color-primary)]"}`}
            >
              {m.name} — <Price amount={product.materialPricing[m.id] ?? product.pricePerSqft} />/sqft
            </button>
          ))}
        </div>
      </div>

      {/* Dimensions */}
      <div>
        <p className="label-lux flex items-center gap-2"><Ruler size={12} /> Wall Dimensions</p>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div>
            <label className="text-[0.7rem] sm:text-xs text-[var(--color-muted)]">Width</label>
            <input type="number" min="0" step="0.5" value={width} onChange={(e) => setWidth(e.target.value)} className="input-lux mt-1" />
          </div>
          <div>
            <label className="text-[0.7rem] sm:text-xs text-[var(--color-muted)]">Height</label>
            <input type="number" min="0" step="0.5" value={height} onChange={(e) => setHeight(e.target.value)} className="input-lux mt-1" />
          </div>
          <div>
            <label className="text-[0.7rem] sm:text-xs text-[var(--color-muted)]">Unit</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value as typeof unit)} className="input-lux mt-1">
              {UNITS.map((u) => <option key={u.v} value={u.v}>{u.l}</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 mt-3 sm:mt-4">
          <div className="flex items-center border hairline">
            <button type="button" onClick={() => setWalls(Math.max(1, walls - 1))} className="px-2.5 py-1.5 sm:px-3 sm:py-2"><Minus size={14} /></button>
            <span className="px-3 sm:px-4 text-xs sm:text-sm w-16 sm:w-20 text-center">{walls} wall{walls > 1 ? "s" : ""}</span>
            <button type="button" onClick={() => setWalls(Math.min(20, walls + 1))} className="px-2.5 py-1.5 sm:px-3 sm:py-2"><Plus size={14} /></button>
          </div>
          <label className="flex items-center gap-2 text-xs sm:text-sm">
            <input type="checkbox" checked={includeInstall} onChange={(e) => setIncludeInstall(e.target.checked)} className="accent-[#B79A61]" />
            Include installation
          </label>
        </div>
      </div>

      {/* Estimate */}
      {breakdown && (
        <div className="border hairline bg-[var(--color-surface)] p-5 space-y-2 text-sm">
          <Row label="Wall area" value={`${breakdown.wallAreaSqft} sq ft`} />
          <Row label={`Wastage allowance (${product.wastagePercent}%)`} value={`${breakdown.wastageAreaSqft} sq ft`} />
          <Row label="Billable area" value={`${breakdown.totalAreaSqft} sq ft`} strong />
          {breakdown.minOrderApplied && <p className="text-xs text-[var(--color-primary)]">Minimum order area applied.</p>}
          <Row label="Wallpaper" value={<Price amount={breakdown.wallpaperCost} />} />
          {includeInstall && <Row label="Installation" value={<Price amount={breakdown.installationCost} />} />}
          <Row label="Est. shipping" value={breakdown.shipping ? <Price amount={breakdown.shipping} /> : "Free"} />
          <Row label="Est. tax" value={<Price amount={breakdown.tax} />} />
          <div className="border-t hairline pt-3 mt-2 flex justify-between font-semibold">
            <span>Estimated total</span>
            <Price amount={round2(breakdown.total * qty)} className="font-display text-lg" />
          </div>
          <p className="text-[0.65rem] text-[var(--color-muted)]">Final price confirmed at checkout. {breakdown.rollsNeeded} roll{breakdown.rollsNeeded === 1 ? "" : "s"} required.</p>
        </div>
      )}

      {/* Quantity + actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center border hairline">
          <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2.5"><Minus size={14} /></button>
          <span className="px-4 text-sm w-12 text-center">{qty}</span>
          <button type="button" onClick={() => setQty(Math.min(50, qty + 1))} className="px-3 py-2.5"><Plus size={14} /></button>
        </div>
        <span className="text-xs text-[var(--color-muted)]">Quantity = sets of the dimensions above</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => {
            addToCart(product, lineOpts(), pricing);
            setAdded(true);
            setTimeout(() => setAdded(false), 1600);
          }}
          className="btn-lux flex-1 justify-center"
        >
          <ShoppingBag size={15} /> {added ? "Added to Cart" : "Add to Cart"}
        </button>
        <button
          type="button"
          onClick={() => {
            buyNow(product, lineOpts(), pricing);
            router.push("/checkout");
          }}
          className="btn-lux btn-lux--gold flex-1 justify-center"
        >
          <Zap size={15} /> Buy Now
        </button>
      </div>
      <p className="text-xs text-[var(--color-muted)]">Cash on Delivery available · Final pricing validated on the server at checkout.</p>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "font-semibold" : "text-[var(--color-muted)]"}`}>
      <span>{label}</span>
      <span className="text-[var(--color-ink)]">{value}</span>
    </div>
  );
}
