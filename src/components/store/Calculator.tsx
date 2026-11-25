"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calculator as CalcIcon, Send } from "lucide-react";
import { computePricing, resolveUnitPrice } from "@/lib/pricing";
import { useStore } from "./StoreProvider";
import { Price } from "./Price";
import type { Product } from "@/lib/data/types";
import type { Settings } from "@/lib/data/types";

const UNITS = [
  { v: "ft", l: "Feet" }, { v: "in", l: "Inches" }, { v: "cm", l: "Centimetres" }, { v: "m", l: "Metres" },
] as const;

type CalcProduct = Pick<Product, "id" | "name" | "slug" | "pricePerSqft" | "materialPricing" | "minOrderAreaSqft" | "wastagePercent" | "installationChargePerSqft"> & { images: Product["images"] };

export function Calculator({
  settings,
  materials,
  products,
}: {
  settings: Settings;
  materials: { id: string; name: string }[];
  products: CalcProduct[];
}) {
  const { addToCart, format } = useStore();
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [materialId, setMaterialId] = useState("");
  const [width, setWidth] = useState("12");
  const [height, setHeight] = useState("9");
  const [unit, setUnit] = useState<"ft" | "in" | "cm" | "m">("ft");
  const [walls, setWalls] = useState(1);
  const [includeInstall, setIncludeInstall] = useState(true);
  const [customPrice, setCustomPrice] = useState("60");
  const [quoteSent, setQuoteSent] = useState(false);

  const product = products.find((p) => p.id === productId);
  const pricePerSqft = product ? resolveUnitPrice(product, materialId || undefined) : parseFloat(customPrice) || 0;

  const calc = useMemo(() => {
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    if (w <= 0 || h <= 0 || pricePerSqft <= 0) return null;
    return computePricing(
      { width: w, height: h, unit, walls, includeInstallation: includeInstall, pricePerSqft },
      {
        pricePerSqft,
        minOrderAreaSqft: product?.minOrderAreaSqft,
        defaultWastagePercent: product?.wastagePercent ?? settings.calculator.defaultWastagePercent,
        defaultInstallationPerSqft: product?.installationChargePerSqft ?? settings.calculator.defaultInstallationPerSqft,
        rollWidthFt: settings.calculator.rollWidthFt,
        shippingFlat: settings.shipping.flatCharge,
        shippingFreeAbove: settings.shipping.freeAbove,
        taxPercent: settings.tax.enabled ? settings.tax.percent : 0,
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, unit, walls, includeInstall, pricePerSqft, product, settings]);

  function addEstimateToCart() {
    if (!product) return;
    const full = products.find((p) => p.id === productId)!;
    // reconstruct minimal Product shape expected by addToCart
    addToCart(full as Product, {
      materialId: materialId || undefined,
      width: parseFloat(width) || 10,
      height: parseFloat(height) || 8,
      unit, walls, quantity: 1,
    }, {
      minOrderAreaSqft: product.minOrderAreaSqft,
      wastagePercent: product.wastagePercent,
      installationPerSqft: product.installationChargePerSqft,
      rollWidthFt: settings.calculator.rollWidthFt,
      shippingFlat: settings.shipping.flatCharge,
      shippingFreeAbove: settings.shipping.freeAbove,
      taxPercent: settings.tax.enabled ? settings.tax.percent : 0,
    });
    router.push("/cart");
  }

  async function requestQuote() {
    await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "enquiry", subtype: "general",
        name: "Website visitor", email: "quote@pending.local",
        message: `Wallpaper estimate request: ${width} ${unit} × ${height} ${unit}, ${walls} wall(s)${product ? `, product: ${product.name}` : ""}. Calculated total ≈ ${calc ? format(calc.total) : "n/a"}.`,
        details: { width, height, unit, walls: String(walls), product: product?.name ?? "custom estimate" },
      }),
    });
    setQuoteSent(true);
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6 sm:gap-10">
      {/* Inputs */}
      <div className="lg:col-span-3 bg-[var(--color-surface)] border hairline p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
        <div>
          <label className="label-lux">Wallpaper design (optional)</label>
          <select value={productId} onChange={(e) => setProductId(e.target.value)} className="input-lux">
            <option value="">Custom estimate (enter price below)</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {format(p.pricePerSqft)}/sqft</option>)}
          </select>
        </div>

        {product && (
          <div>
            <label className="label-lux">Material</label>
            <select value={materialId} onChange={(e) => setMaterialId(e.target.value)} className="input-lux">
              <option value="">Standard finish</option>
              {materials.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        )}
        {!product && (
          <div>
            <label className="label-lux">Price per sq ft (estimate)</label>
            <input type="number" min="1" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} className="input-lux" />
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <div>
            <label className="label-lux">Width</label>
            <input type="number" min="0" step="0.5" value={width} onChange={(e) => setWidth(e.target.value)} className="input-lux" />
          </div>
          <div>
            <label className="label-lux">Height</label>
            <input type="number" min="0" step="0.5" value={height} onChange={(e) => setHeight(e.target.value)} className="input-lux" />
          </div>
          <div>
            <label className="label-lux">Unit</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value as typeof unit)} className="input-lux">
              {UNITS.map((u) => <option key={u.v} value={u.v}>{u.l}</option>)}
            </select>
          </div>
          <div>
            <label className="label-lux">Walls</label>
            <input type="number" min="1" max="20" value={walls} onChange={(e) => setWalls(Math.max(1, parseInt(e.target.value) || 1))} className="input-lux" />
          </div>
        </div>

        <label className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
          <input type="checkbox" checked={includeInstall} onChange={(e) => setIncludeInstall(e.target.checked)} className="accent-[#B79A61] w-4 h-4" />
          Include installation ({format(product?.installationChargePerSqft ?? settings.calculator.defaultInstallationPerSqft)}/sqft)
        </label>
      </div>

      {/* Result */}
      <div className="lg:col-span-2">
        <div className="bg-[var(--color-ink)] text-[#EDE6DA] p-6 sm:p-8 sticky top-28">
          <p className="eyebrow !text-[#B79A61] flex items-center gap-2"><CalcIcon size={13} /> Estimate</p>
          {calc ? (
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[#B9AC9C]">Wall area</span><span>{calc.wallAreaSqft} sq ft</span></div>
              <div className="flex justify-between"><span className="text-[#B9AC9C]">Wastage ({product?.wastagePercent ?? settings.calculator.defaultWastagePercent}%)</span><span>{calc.wastageAreaSqft} sq ft</span></div>
              <div className="flex justify-between font-semibold"><span>Billable area</span><span>{calc.totalAreaSqft} sq ft</span></div>
              {calc.minOrderApplied && <p className="text-xs text-[#B79A61]">Minimum order area applied.</p>}
              <div className="flex justify-between"><span className="text-[#B9AC9C]">Wallpaper</span><span><Price amount={calc.wallpaperCost} /></span></div>
              {includeInstall && <div className="flex justify-between"><span className="text-[#B9AC9C]">Installation</span><span><Price amount={calc.installationCost} /></span></div>}
              <div className="flex justify-between"><span className="text-[#B9AC9C]">Shipping</span><span>{calc.shipping ? <Price amount={calc.shipping} /> : "Free"}</span></div>
              <div className="flex justify-between"><span className="text-[#B9AC9C]">Tax ({settings.tax.percent}%)</span><span><Price amount={calc.tax} /></span></div>
              <div className="border-t border-white/15 pt-4 mt-2 flex justify-between items-baseline">
                <span className="text-[#B9AC9C]">Estimated total</span>
                <span className="font-display text-3xl text-[#B79A61]"><Price amount={calc.total} /></span>
              </div>
              <p className="text-xs text-[#8d8172]">{calc.rollsNeeded} roll{calc.rollsNeeded === 1 ? "" : "s"} of {settings.calculator.rollWidthFt} ft × 33 ft needed.</p>
            </div>
          ) : (
            <p className="mt-6 text-sm text-[#B9AC9C]">Enter dimensions to see your estimate.</p>
          )}
          <div className="mt-8 space-y-3">
            {product && (
              <button type="button" onClick={addEstimateToCart} className="btn-lux w-full justify-center !bg-[#B79A61] !border-[#B79A61] !text-[#30251F] hover:!bg-white hover:!border-white">
                Add Estimate to Cart
              </button>
            )}
            <button type="button" onClick={requestQuote} className="btn-lux btn-lux--outline w-full justify-center !border-white/40 !text-white hover:!bg-white hover:!text-[#30251F]">
              <Send size={14} /> {quoteSent ? "Quote Requested ✓" : "Request a Quote"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
