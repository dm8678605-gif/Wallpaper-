import { z } from "zod";

/**
 * Shared wallpaper pricing logic — used by the calculator UI and validated
 * again server-side at checkout.
 */

export const dimensionUnit = z.enum(["ft", "in", "cm", "m"]);
export type DimensionUnit = z.infer<typeof dimensionUnit>;

export const calculatorInputSchema = z.object({
  width: z.number().positive().max(1000),
  height: z.number().positive().max(1000),
  unit: dimensionUnit.default("ft"),
  walls: z.number().int().min(1).max(20).default(1),
  productId: z.string().optional(),
  materialId: z.string().optional(),
  pricePerSqft: z.number().positive().optional(), // used when productId absent (estimate)
  wastagePercent: z.number().min(0).max(50).optional(),
  installationPerSqft: z.number().min(0).optional(),
  includeInstallation: z.boolean().default(true),
  couponCode: z.string().optional(),
});

export type CalculatorInput = z.infer<typeof calculatorInputSchema>;

export interface PriceBreakdown {
  wallAreaSqft: number;
  wastageAreaSqft: number;
  totalAreaSqft: number;
  wallpaperCost: number;
  installationCost: number;
  materialCost: number; // included in wallpaperCost breakdown alias
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  rollsNeeded: number;
  rollWidthFt: number;
  rollLengthFt: number;
  minOrderApplied: boolean;
}

const FT_PER: Record<DimensionUnit, number> = { ft: 1, in: 1 / 12, cm: 0.0328084, m: 3.28084 };

export function toFeet(value: number, unit: DimensionUnit): number {
  return value * FT_PER[unit];
}

export function computePricing(
  input: CalculatorInput,
  opts: {
    pricePerSqft: number;
    minOrderAreaSqft?: number;
    defaultWastagePercent: number;
    defaultInstallationPerSqft: number;
    rollWidthFt: number;
    rollLengthFt?: number;
    shippingFlat: number;
    shippingFreeAbove: number;
    taxPercent: number;
    couponDiscount?: number; // computed externally
  }
): PriceBreakdown {
  const widthFt = toFeet(input.width, input.unit);
  const heightFt = toFeet(input.height, input.unit);
  const wallArea = widthFt * heightFt * input.walls;
  const wastagePct = input.wastagePercent ?? opts.defaultWastagePercent;
  let totalArea = wallArea * (1 + wastagePct / 100);

  const minArea = opts.minOrderAreaSqft ?? 0;
  const minOrderApplied = minArea > 0 && totalArea < minArea;
  if (minOrderApplied) totalArea = minArea;

  const wallpaperCost = totalArea * opts.pricePerSqft;
  const installPerSqft = input.installationPerSqft ?? opts.defaultInstallationPerSqft;
  const installationCost = input.includeInstallation ? totalArea * installPerSqft : 0;
  const subtotal = wallpaperCost + installationCost;
  const discount = opts.couponDiscount ?? 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping = afterDiscount >= opts.shippingFreeAbove ? 0 : opts.shippingFlat;
  const tax = (afterDiscount + shipping) * (opts.taxPercent / 100);
  const total = afterDiscount + shipping + tax;

  const rollW = opts.rollWidthFt;
  const rollL = opts.rollLengthFt ?? 33;
  const rollArea = rollW * rollL;
  const rollsNeeded = rollArea > 0 ? Math.ceil(totalArea / rollArea) : 0;

  return {
    wallAreaSqft: round2(wallArea),
    wastageAreaSqft: round2(totalArea - wallArea),
    totalAreaSqft: round2(totalArea),
    wallpaperCost: round2(wallpaperCost),
    materialCost: round2(wallpaperCost),
    installationCost: round2(installationCost),
    subtotal: round2(subtotal),
    discount: round2(discount),
    shipping: round2(shipping),
    tax: round2(tax),
    total: round2(total),
    rollsNeeded,
    rollWidthFt: rollW,
    rollLengthFt: rollL,
    minOrderApplied,
  };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Resolve the price per sqft for a product + optional material override. */
export function resolveUnitPrice(
  product: { pricePerSqft: number; materialPricing: Record<string, number> },
  materialId?: string
): number {
  if (materialId && product.materialPricing[materialId]) return product.materialPricing[materialId];
  return product.pricePerSqft;
}
