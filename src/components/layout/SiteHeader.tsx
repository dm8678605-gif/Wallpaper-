"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, X, ChevronDown } from "lucide-react";
import type { NavigationItem } from "@/lib/data/types";
import { useStore } from "@/components/store/StoreProvider";

export function SiteHeader({
  siteName,
  tagline,
  logoUrl,
  items,
  announcement,
}: {
  siteName: string;
  tagline?: string;
  logoUrl?: string;
  items: NavigationItem[];
  announcement?: string;
}) {
  const { cartCount, wishlist } = useStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState("");
  const [mobileSub, setMobileSub] = useState<string | null>(null);
  const pathname = usePathname();

  const topItems = items.filter((i) => !i.children || i.children.length === 0 || true).sort((a, b) => a.order - b.order);

  return (
    <header className="sticky top-0 z-50">
      {announcement && (
        <div className="bg-[var(--color-ink)] text-[var(--color-bg)] text-center text-[0.6rem] sm:text-[0.68rem] tracking-[0.2em] sm:tracking-[0.25em] uppercase py-1.5 sm:py-2 px-4">
          {announcement}
        </div>
      )}
      <div className="bg-[var(--color-header)]/95 backdrop-blur border-b hairline">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            <button className="lg:hidden p-1.5 sm:p-2" onClick={() => setOpen(true)} aria-label="Menu">
              <Menu size={20} />
            </button>
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={siteName} className="h-7 sm:h-9 w-auto" />
              ) : (
                <span className="font-display text-xl sm:text-2xl tracking-wide">{siteName}</span>
              )}
              {tagline && <span className="hidden md:block text-[0.55rem] sm:text-[0.6rem] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-[var(--color-muted)]">{tagline}</span>}
            </Link>
            <nav className="hidden lg:flex items-center gap-7">
              {topItems.map((item) =>
                item.children?.length ? (
                  <div key={item.id} className="group relative">
                    <Link
                      href={item.href}
                      className={`text-[0.72rem] tracking-[0.2em] uppercase font-medium py-2 flex items-center gap-1 transition-colors ${pathname === item.href ? "text-[var(--color-primary)]" : "text-[var(--color-ink)] hover:text-[var(--color-primary)]"}`}
                    >
                      {item.label} <ChevronDown size={12} />
                    </Link>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <div className="bg-[var(--color-surface)] border hairline shadow-xl min-w-52 py-2">
                        {item.children.filter((c) => c.visible).sort((a, b) => a.order - b.order).map((c) => (
                          <Link key={c.id} href={c.href} className="block px-5 py-2.5 text-[0.78rem] tracking-wide hover:bg-[var(--color-bg)] hover:text-[var(--color-primary)] transition-colors">
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`text-[0.72rem] tracking-[0.2em] uppercase font-medium transition-colors ${pathname === item.href ? "text-[var(--color-primary)]" : "text-[var(--color-ink)] hover:text-[var(--color-primary)]"}`}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>
            <div className="flex items-center gap-1 sm:gap-2">
              <button onClick={() => setSearch((s) => !s)} className="p-1.5 sm:p-2 hover:text-[var(--color-primary)] transition-colors" aria-label="Search">
                <Search size={18} />
              </button>
              <Link href="/wishlist" className="p-1.5 sm:p-2 hover:text-[var(--color-primary)] transition-colors relative" aria-label="Wishlist">
                <Heart size={18} />
                {wishlist.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[var(--color-primary)] text-white text-[0.6rem] w-4 h-4 rounded-full flex items-center justify-center">{wishlist.length}</span>}
              </Link>
              <Link href="/cart" className="p-1.5 sm:p-2 hover:text-[var(--color-primary)] transition-colors relative" aria-label="Cart">
                <ShoppingBag size={18} />
                {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[var(--color-primary)] text-white text-[0.6rem] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
              </Link>
            </div>
          </div>
          {search && (
            <form
              className="pb-4"
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/shop?q=${encodeURIComponent(q)}`;
              }}
            >
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search wallpapers, collections, rooms…"
                className="input-lux"
              />
            </form>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-[var(--color-bg)] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-8">
              <span className="font-display text-xl">{siteName}</span>
              <button onClick={() => setOpen(false)} aria-label="Close"><X size={22} /></button>
            </div>
            <nav className="space-y-1">
              {topItems.map((item) => (
                <div key={item.id}>
                  <div className="flex items-center justify-between">
                    <Link href={item.href} onClick={() => setOpen(false)} className="block py-3 text-sm tracking-[0.15em] uppercase font-medium">
                      {item.label}
                    </Link>
                    {item.children?.length ? (
                      <button onClick={() => setMobileSub(mobileSub === item.id ? null : item.id)} className="p-2">
                        <ChevronDown size={16} className={`transition-transform ${mobileSub === item.id ? "rotate-180" : ""}`} />
                      </button>
                    ) : null}
                  </div>
                  {mobileSub === item.id && item.children && (
                    <div className="pl-4 pb-2 space-y-1">
                      {item.children.filter((c) => c.visible).map((c) => (
                        <Link key={c.id} href={c.href} onClick={() => setOpen(false)} className="block py-2 text-sm text-[var(--color-muted)]">
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
