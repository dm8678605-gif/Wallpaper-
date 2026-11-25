"use client";

import { useState } from "react";
import { Filter, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { MobileFilterSidebar } from "./MobileFilterSidebar";
import type { Category, Collection, Room, Colour, Material, StyleTag } from "@/lib/data/types";

interface MobileFilterWrapperProps {
  filters: {
    q?: string;
    categoryId?: string;
    collectionId?: string;
    roomId?: string;
    colourId?: string;
    materialId?: string;
    styleId?: string;
    sort?: string;
  };
  categories: Category[];
  collections: Collection[];
  rooms: Room[];
  colours: Colour[];
  materials: Material[];
  styles: StyleTag[];
  basePath: string;
  linkBase: Record<string, string | undefined>;
  activeFilterCount: number;
}

export function MobileFilterWrapper({
  filters,
  categories,
  collections,
  rooms,
  colours,
  materials,
  styles,
  basePath,
  linkBase,
  activeFilterCount,
}: MobileFilterWrapperProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  function hrefWith(base: Record<string, string | undefined>, patch: Record<string, string | undefined>): string {
    const params = new URLSearchParams();
    const merged = { ...base, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const s = params.toString();
    return `${basePath}${s ? `?${s}` : ""}`;
  }

  return (
    <>
      {/* Mobile Filter & Sort Controls */}
      <div className="lg:hidden flex items-center gap-3 mb-4">
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border hairline bg-[var(--color-surface)] hover:border-[var(--color-primary)] transition-colors text-sm"
        >
          <Filter size={16} />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="bg-[var(--color-primary)] text-white text-xs px-1.5 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
        <Link
          href={hrefWith(linkBase, { sort: (filters.sort ?? "featured") === "price-asc" ? "price-desc" : "price-asc" })}
          className="flex items-center gap-2 px-4 py-2 border hairline bg-[var(--color-surface)] hover:border-[var(--color-primary)] transition-colors text-sm"
        >
          <ArrowUpDown size={16} />
          <span>Sort</span>
        </Link>
      </div>

      {/* Mobile Filter Sidebar */}
      <MobileFilterSidebar
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        categories={categories}
        collections={collections}
        rooms={rooms}
        colours={colours}
        materials={materials}
        styles={styles}
        filters={{
          q: filters.q,
          categoryId: filters.categoryId,
          collectionId: filters.collectionId,
          roomId: filters.roomId,
          colourId: filters.colourId,
          materialId: filters.materialId,
          styleId: filters.styleId,
          sort: filters.sort,
        }}
        basePath={basePath}
      />
    </>
  );
}
