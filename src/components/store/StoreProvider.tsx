"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/data/types";
import { computePricing, resolveUnitPrice, round2, type CalculatorInput } from "@/lib/pricing";

export interface CartLine {
  key: string;
  productId: string;
  materialId?: string;
  name: string;
  slug: string;
  image?: string;
  materialName?: string;
  width: number;
  height: number;
  unit: "ft" | "in" | "cm" | "m";
  walls: number;
  quantity: number;
  unitPrice: number;
  areaSqft: number;
  lineTotal: number;
}

interface StoreCtx {
  cart: CartLine[];
  wishlist: string[];
  cartCount: number;
  cartTotal: number;
  currency: { code: string; symbol: string; position: "before" | "after" };
  format: (n: number) => string;
  addToCart: (product: Product, opts?: Partial<CartLine>, pricing?: PricingOpts) => void;
  buyNow: (product: Product, opts?: Partial<CartLine>, pricing?: PricingOpts) => void;
  updateLine: (key: string, patch: Partial<CartLine>) => void;
  removeLine: (key: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  inWishlist: (productId: string) => boolean;
  hydrated: boolean;
}

export interface PricingOpts {
  minOrderAreaSqft?: number;
  wastagePercent?: number;
  installationPerSqft?: number;
  rollWidthFt?: number;
  shippingFlat?: number;
  shippingFreeAbove?: number;
  taxPercent?: number;
}

const Ctx = createContext<StoreCtx | null>(null);
const CART_KEY = "lux_cart_v1";
const WISH_KEY = "lux_wish_v1";

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({
  children,
  currency = { code: "INR", symbol: "₹", position: "before" },
}: {
  children: React.ReactNode;
  currency?: { code: string; symbol: string; position: "before" | "after" };
}) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setCart(load<CartLine[]>(CART_KEY, []));
      setWishlist(load<string[]>(WISH_KEY, []));
      setHydrated(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const buildLine = useCallback(
    (product: Product, opts: Partial<CartLine> = {}, pricing: PricingOpts = {}): CartLine => {
      const input: CalculatorInput = {
        width: opts.width ?? 10,
        height: opts.height ?? 8,
        unit: opts.unit ?? "ft",
        walls: opts.walls ?? 1,
        productId: product.id,
        materialId: opts.materialId,
        pricePerSqft: resolveUnitPrice(product, opts.materialId),
        includeInstallation: true,
      };
      const calc = computePricing(input, {
        pricePerSqft: resolveUnitPrice(product, opts.materialId),
        minOrderAreaSqft: pricing.minOrderAreaSqft ?? product.minOrderAreaSqft,
        defaultWastagePercent: pricing.wastagePercent ?? product.wastagePercent,
        defaultInstallationPerSqft: pricing.installationPerSqft ?? product.installationChargePerSqft,
        rollWidthFt: pricing.rollWidthFt ?? 2.05,
        shippingFlat: pricing.shippingFlat ?? 0,
        shippingFreeAbove: pricing.shippingFreeAbove ?? Infinity,
        taxPercent: pricing.taxPercent ?? 0,
      });
      const unitPrice = resolveUnitPrice(product, opts.materialId);
      return {
        key: `${product.id}:${opts.materialId ?? "base"}:${opts.width ?? 10}x${opts.height ?? 8}x${opts.walls ?? 1}`,
        productId: product.id,
        materialId: opts.materialId,
        name: product.name,
        slug: product.slug,
        image: product.images.find((i) => i.primary)?.url ?? product.images[0]?.url,
        materialName: opts.materialName,
        width: opts.width ?? 10,
        height: opts.height ?? 8,
        unit: opts.unit ?? "ft",
        walls: opts.walls ?? 1,
        quantity: opts.quantity ?? 1,
        unitPrice,
        areaSqft: calc.totalAreaSqft,
        lineTotal: round2(calc.total * (opts.quantity ?? 1)),
      };
    },
    []
  );

  const addToCart = useCallback(
    (product: Product, opts?: Partial<CartLine>, pricing?: PricingOpts) => {
      const line = buildLine(product, opts, pricing);
      setCart((prev) => {
        const idx = prev.findIndex((l) => l.key === line.key);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + line.quantity };
          return next;
        }
        return [...prev, line];
      });
    },
    [buildLine]
  );

  const buyNow = useCallback(
    (product: Product, opts?: Partial<CartLine>, pricing?: PricingOpts) => {
      const line = buildLine(product, opts, pricing);
      setCart([line]);
      if (typeof window !== "undefined") window.location.href = "/checkout";
    },
    [buildLine]
  );

  const updateLine = useCallback((key: string, patch: Partial<CartLine>) => {
    setCart((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }, []);

  const removeLine = useCallback((key: string) => {
    setCart((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) => (prev.includes(productId) ? prev.filter((p) => p !== productId) : [...prev, productId]));
  }, []);

  const inWishlist = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const cartCount = useMemo(() => cart.reduce((s, l) => s + l.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((s, l) => s + l.lineTotal, 0), [cart]);

  const format = useCallback(
    (n: number) => {
      const v = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));
      return currency.position === "before" ? `${currency.symbol}${v}` : `${v} ${currency.symbol}`;
    },
    [currency]
  );

  const value = useMemo<StoreCtx>(
    () => ({ cart, wishlist, cartCount, cartTotal, currency, format, addToCart, buyNow, updateLine, removeLine, clearCart, toggleWishlist, inWishlist, hydrated }),
    [cart, wishlist, cartCount, cartTotal, currency, format, addToCart, buyNow, updateLine, removeLine, clearCart, toggleWishlist, inWishlist, hydrated]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
