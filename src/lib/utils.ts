import type { Settings } from "./data/types";

export function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function formatMoney(amount: number, settings?: Pick<Settings, "currency"> | null): string {
  const cur = settings?.currency ?? { code: "INR", symbol: "₹", position: "before" as const };
  const n = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(amount));
  return cur.position === "before" ? `${cur.symbol}${n}` : `${n} ${cur.symbol}`;
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export const PALETTE = {
  ivory: "#F8F5EE",
  beige: "#DDD0BE",
  gold: "#B79A61",
  olive: "#555E47",
  espresso: "#30251F",
  white: "#FFFFFF",
};
