import type { Metadata } from "next";
import { bannersRepo } from "@/lib/data/repos";
import { PageHero } from "@/components/ui/PageHero";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Reveal } from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Custom Wallpaper Design" };

export default async function CustomDesignPage() {
  const banners = await bannersRepo.published("hero");
  const img = banners[3]?.image;
  return (
    <div>
      <PageHero eyebrow="Bespoke Studio" title="Custom Wallpaper Design" subtitle="From hand-painted murals to your photograph recreated in wallpaper — our studio brings your vision to the wall." image={img} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid lg:grid-cols-2 gap-12">
        <Reveal>
          <h2 className="font-display text-3xl mb-6">How It Works</h2>
          <ol className="space-y-6">
            {[
              ["Share your vision", "Tell us about the space, mood and inspiration — photos and sketches welcome."],
              ["Design consultation", "Our designers prepare concepts and material recommendations."],
              ["Approval & printing", "Approve a digital proof, then we print on premium wallpaper substrates."],
              ["Installation support", "Guided installation or certified installer referrals."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-5">
                <span className="font-display text-3xl text-[var(--color-primary)] w-12 shrink-0">0{i + 1}</span>
                <div>
                  <p className="font-semibold">{t}</p>
                  <p className="text-sm text-[var(--color-muted)] mt-1 leading-relaxed">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="bg-[var(--color-surface)] border hairline p-6 sm:p-8">
            <EnquiryForm type="enquiry" subtype="custom-design" title="Start Your Project" submitLabel="Send Design Enquiry" showDetails />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
