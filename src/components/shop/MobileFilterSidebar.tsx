"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import type { Category, Collection, Room, Colour, Material, StyleTag } from "@/lib/data/types";

interface MobileFilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  collections: Collection[];
  rooms: Room[];
  colours: Colour[];
  materials: Material[];
  styles: StyleTag[];
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
  basePath: string;
}

export function MobileFilterSidebar({
  isOpen,
  onClose,
  categories,
  collections,
  rooms,
  colours,
  materials,
  styles,
  filters,
  basePath,
}: MobileFilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true,
    collection: false,
    room: false,
    colour: false,
    material: false,
    style: false,
    sort: false,
  });

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Sync local filters with props when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [isOpen, filters]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const activeFilterCount = [
    localFilters.categoryId,
    localFilters.collectionId,
    localFilters.roomId,
    localFilters.colourId,
    localFilters.materialId,
    localFilters.styleId,
  ].filter(Boolean).length;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const clearAll = () => {
    setLocalFilters({
      q: localFilters.q,
      sort: localFilters.sort,
    });
  };

  const buildUrl = (updates: Partial<typeof localFilters>) => {
    const params = new URLSearchParams();
    const merged = { ...localFilters, ...updates };
    if (merged.q) params.set("q", merged.q);
    if (merged.categoryId) params.set("category", merged.categoryId);
    if (merged.collectionId) params.set("collection", merged.collectionId);
    if (merged.roomId) params.set("room", merged.roomId);
    if (merged.colourId) params.set("colour", merged.colourId);
    if (merged.materialId) params.set("material", merged.materialId);
    if (merged.styleId) params.set("style", merged.styleId);
    if (merged.sort && merged.sort !== "featured") params.set("sort", merged.sort);
    const queryString = params.toString();
    return `${basePath}${queryString ? `?${queryString}` : ""}`;
  };

  const applyFilters = () => {
    window.location.href = buildUrl(localFilters);
  };

  const roots = categories.filter((c) => !c.parentId && c.published);

  const sidebarContent = (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[9999] lg:hidden"
          onClick={onClose}
          style={{ animation: "fadeIn 0.3s ease-out" }}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-[85vw] max-w-sm bg-[var(--color-surface)] z-[10000] lg:hidden transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b hairline">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-[var(--color-primary)]" />
              <span className="font-display text-lg">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-[var(--color-primary)] text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--color-bg)] rounded-full transition-colors"
              aria-label="Close filters"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Category */}
            <div className="border-b hairline pb-4">
              <button
                onClick={() => toggleSection("category")}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-[0.65rem] tracking-[0.25em] uppercase font-semibold text-[var(--color-muted)]">
                  Category
                </span>
                {expandedSections.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.category && (
                <div className="mt-3 space-y-2">
                  <Link
                    href={buildUrl({ categoryId: undefined })}
                    onClick={() => setLocalFilters((prev) => ({ ...prev, categoryId: undefined }))}
                    className={`block text-sm py-1 transition-colors ${
                      !localFilters.categoryId
                        ? "text-[var(--color-primary)] font-semibold"
                        : "text-[var(--color-ink)]/80 hover:text-[var(--color-primary)]"
                    }`}
                  >
                    All
                  </Link>
                  {roots.map((c) => (
                    <Link
                      key={c.id}
                      href={buildUrl({ categoryId: c.id })}
                      onClick={() => setLocalFilters((prev) => ({ ...prev, categoryId: c.id }))}
                      className={`block text-sm py-1 transition-colors ${
                        localFilters.categoryId === c.id
                          ? "text-[var(--color-primary)] font-semibold"
                          : "text-[var(--color-ink)]/80 hover:text-[var(--color-primary)]"
                      }`}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Collection */}
            <div className="border-b hairline pb-4">
              <button
                onClick={() => toggleSection("collection")}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-[0.65rem] tracking-[0.25em] uppercase font-semibold text-[var(--color-muted)]">
                  Collection
                </span>
                {expandedSections.collection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.collection && (
                <div className="mt-3 space-y-2">
                  <Link
                    href={buildUrl({ collectionId: undefined })}
                    onClick={() => setLocalFilters((prev) => ({ ...prev, collectionId: undefined }))}
                    className={`block text-sm py-1 transition-colors ${
                      !localFilters.collectionId
                        ? "text-[var(--color-primary)] font-semibold"
                        : "text-[var(--color-ink)]/80 hover:text-[var(--color-primary)]"
                    }`}
                  >
                    All
                  </Link>
                  {collections.slice(0, 8).map((c) => (
                    <Link
                      key={c.id}
                      href={buildUrl({ collectionId: c.id })}
                      onClick={() => setLocalFilters((prev) => ({ ...prev, collectionId: c.id }))}
                      className={`block text-sm py-1 transition-colors ${
                        localFilters.collectionId === c.id
                          ? "text-[var(--color-primary)] font-semibold"
                          : "text-[var(--color-ink)]/80 hover:text-[var(--color-primary)]"
                      }`}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Room */}
            <div className="border-b hairline pb-4">
              <button
                onClick={() => toggleSection("room")}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-[0.65rem] tracking-[0.25em] uppercase font-semibold text-[var(--color-muted)]">
                  Room
                </span>
                {expandedSections.room ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.room && (
                <div className="mt-3 space-y-2">
                  <Link
                    href={buildUrl({ roomId: undefined })}
                    onClick={() => setLocalFilters((prev) => ({ ...prev, roomId: undefined }))}
                    className={`block text-sm py-1 transition-colors ${
                      !localFilters.roomId
                        ? "text-[var(--color-primary)] font-semibold"
                        : "text-[var(--color-ink)]/80 hover:text-[var(--color-primary)]"
                    }`}
                  >
                    All
                  </Link>
                  {rooms.slice(0, 10).map((r) => (
                    <Link
                      key={r.id}
                      href={buildUrl({ roomId: r.id })}
                      onClick={() => setLocalFilters((prev) => ({ ...prev, roomId: r.id }))}
                      className={`block text-sm py-1 transition-colors ${
                        localFilters.roomId === r.id
                          ? "text-[var(--color-primary)] font-semibold"
                          : "text-[var(--color-ink)]/80 hover:text-[var(--color-primary)]"
                      }`}
                    >
                      {r.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Colour */}
            <div className="border-b hairline pb-4">
              <button
                onClick={() => toggleSection("colour")}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-[0.65rem] tracking-[0.25em] uppercase font-semibold text-[var(--color-muted)]">
                  Colour
                </span>
                {expandedSections.colour ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.colour && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {colours.slice(0, 12).map((c) => (
                    <Link
                      key={c.id}
                      href={buildUrl({ colourId: localFilters.colourId === c.id ? undefined : c.id })}
                      onClick={() =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          colourId: prev.colourId === c.id ? undefined : c.id,
                        }))
                      }
                      title={c.name}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                        localFilters.colourId === c.id
                          ? "border-[var(--color-primary)] scale-110"
                          : "border-black/10"
                      }`}
                      style={{ background: c.hex }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Material */}
            <div className="border-b hairline pb-4">
              <button
                onClick={() => toggleSection("material")}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-[0.65rem] tracking-[0.25em] uppercase font-semibold text-[var(--color-muted)]">
                  Material
                </span>
                {expandedSections.material ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.material && (
                <div className="mt-3 space-y-2">
                  {materials.map((m) => (
                    <Link
                      key={m.id}
                      href={buildUrl({ materialId: m.id })}
                      onClick={() => setLocalFilters((prev) => ({ ...prev, materialId: m.id }))}
                      className={`block text-sm py-1 transition-colors ${
                        localFilters.materialId === m.id
                          ? "text-[var(--color-primary)] font-semibold"
                          : "text-[var(--color-ink)]/80 hover:text-[var(--color-primary)]"
                      }`}
                    >
                      {m.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Style */}
            <div className="border-b hairline pb-4">
              <button
                onClick={() => toggleSection("style")}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-[0.65rem] tracking-[0.25em] uppercase font-semibold text-[var(--color-muted)]">
                  Style
                </span>
                {expandedSections.style ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.style && (
                <div className="mt-3 space-y-2">
                  {styles.slice(0, 12).map((s) => (
                    <Link
                      key={s.id}
                      href={buildUrl({ styleId: s.id })}
                      onClick={() => setLocalFilters((prev) => ({ ...prev, styleId: s.id }))}
                      className={`block text-sm py-1 transition-colors ${
                        localFilters.styleId === s.id
                          ? "text-[var(--color-primary)] font-semibold"
                          : "text-[var(--color-ink)]/80 hover:text-[var(--color-primary)]"
                      }`}
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="pb-4">
              <button
                onClick={() => toggleSection("sort")}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-[0.65rem] tracking-[0.25em] uppercase font-semibold text-[var(--color-muted)]">
                  Sort
                </span>
                {expandedSections.sort ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.sort && (
                <div className="mt-3 space-y-2">
                  {(
                    [
                      ["featured", "Featured"],
                      ["price-asc", "Price: Low to High"],
                      ["price-desc", "Price: High to Low"],
                      ["name", "Name A–Z"],
                    ] as const
                  ).map(([v, label]) => (
                    <Link
                      key={v}
                      href={buildUrl({ sort: v === "featured" ? undefined : v })}
                      onClick={() => setLocalFilters((prev) => ({ ...prev, sort: v }))}
                      className={`block text-sm py-1 transition-colors ${
                        (localFilters.sort ?? "featured") === v
                          ? "text-[var(--color-primary)] font-semibold"
                          : "text-[var(--color-ink)]/80 hover:text-[var(--color-primary)]"
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t hairline space-y-2 bg-[var(--color-surface)]">
            <button
              onClick={clearAll}
              disabled={activeFilterCount === 0}
              className="w-full py-2.5 text-sm border hairline hover:bg-[var(--color-bg)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear All
            </button>
            <button
              onClick={applyFilters}
              className="w-full py-2.5 text-sm bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );

  // Render sidebar at document.body level using createPortal
  if (typeof document !== "undefined" && document.body) {
    return createPortal(sidebarContent, document.body);
  }

  return sidebarContent;
}
