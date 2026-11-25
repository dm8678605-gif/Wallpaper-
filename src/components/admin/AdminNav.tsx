"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function AdminNav({ sections }: { sections: { section: string; links: { href: string; label: string }[] }[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  return (
    <nav className="py-3">
      {sections.map((sec) => {
        const isOpen = open[sec.section] ?? sec.links.some((l) => pathname === l.href || pathname.startsWith(l.href + "/"));
        return (
          <div key={sec.section} className="mb-1">
            <button
              onClick={() => setOpen((o) => ({ ...o, [sec.section]: !isOpen }))}
              className="w-full flex items-center justify-between px-5 py-2.5 text-[0.62rem] tracking-[0.25em] uppercase font-semibold text-[#8A7B6B] hover:text-[#30251F]"
            >
              {sec.section} <ChevronDown size={12} className={`transition-transform ${isOpen ? "" : "-rotate-90"}`} />
            </button>
            {isOpen && (
              <div className="pb-2">
                {sec.links.map((l) => {
                  const active = pathname === l.href;
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={`block px-5 py-2 text-[0.82rem] transition-colors ${active ? "bg-[#B79A61]/10 text-[#8a6d3b] font-semibold border-r-2 border-[#B79A61]" : "text-[#4a3f36] hover:bg-black/5"}`}
                    >
                      {l.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
