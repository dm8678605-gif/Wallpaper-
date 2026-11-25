import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Reveal } from "@/components/ui/Reveal";
import { PaintRoller, Ruler, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Installation Services" };

export default function InstallationPage() {
  return (
    <div>
      <PageHero eyebrow="Professional Finish" title="Wallpaper Installation" subtitle="Perfect walls deserve perfect installation. Book a certified installer or get guidance for DIY." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid lg:grid-cols-2 gap-12">
        <Reveal>
          <div className="space-y-8">
            {[
              { icon: Ruler, title: "Site Assessment", desc: "We evaluate wall condition, moisture and surface prep needed before hanging." },
              { icon: PaintRoller, title: "Expert Hanging", desc: "Certified installers ensure pattern matching, seamless joints and clean edges." },
              { icon: Sparkles, title: "Finishing Touches", desc: "Trimming, sealing and a final walkthrough so every wall looks flawless." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-5">
                <div className="w-12 h-12 border border-[var(--color-primary)]/40 flex items-center justify-center shrink-0 text-[var(--color-primary)]"><Icon size={20} /></div>
                <div>
                  <p className="font-display text-xl">{title}</p>
                  <p className="text-sm text-[var(--color-muted)] mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="bg-[var(--color-surface)] border hairline p-6 sm:p-8">
            <EnquiryForm type="enquiry" subtype="installation" title="Request Installation" submitLabel="Request Installer" showDetails />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
