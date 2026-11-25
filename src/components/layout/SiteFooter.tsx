import Link from "next/link";
import { Share2, AtSign, Globe, Camera, Mail, Phone, MapPin } from "lucide-react";
import type { FooterConfig, Settings } from "@/lib/data/types";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

export function SiteFooter({
  config,
  siteName,
  settings,
}: {
  config: FooterConfig;
  siteName: string;
  settings: Settings;
}) {
  const b = settings.business;
  return (
    <footer className="bg-[var(--color-footer)] text-[#EDE6DA] mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <p className="font-display text-2xl">{siteName}</p>
            {config.aboutText && <p className="mt-4 text-sm text-[#B9AC9C] leading-relaxed max-w-xs">{config.aboutText}</p>}
            {(b.email || b.phone || b.address) && (
              <div className="mt-6 space-y-2 text-sm text-[#B9AC9C]">
                {b.email && <p className="flex items-center gap-2"><Mail size={14} className="text-[#B79A61]" /> {b.email}</p>}
                {b.phone && <p className="flex items-center gap-2"><Phone size={14} className="text-[#B79A61]" /> {b.phone}</p>}
                {b.address && <p className="flex items-center gap-2"><MapPin size={14} className="text-[#B79A61]" /> {b.address}{b.city ? `, ${b.city}` : ""}</p>}
              </div>
            )}
            {config.showNewsletter && (
              <div className="mt-6">
                <p className="text-[0.7rem] tracking-[0.25em] uppercase text-[#B79A61] mb-3">Newsletter</p>
                <NewsletterForm />
              </div>
            )}
            {config.showSocial && (
              <div className="flex gap-3 mt-6">
                {[Camera, AtSign, Share2, Globe].map((Icon, i) => (
                  <a key={i} href="#" aria-label="Social link" className="w-9 h-9 border border-white/20 flex items-center justify-center hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] transition-colors">
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            )}
          </div>
          {config.columns.map((col) => (
            <div key={col.title}>
              <p className="text-[0.7rem] tracking-[0.25em] uppercase text-[#B79A61] mb-5">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-sm text-[#CFC4B4] hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8d8172]">
          <p>© {new Date().getFullYear()} {siteName}. All rights reserved. Sample storefront — prices and content are for demonstration.</p>
          <div className="flex gap-6">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
