import type { Metadata } from "next";
import { settingsRepo } from "@/lib/data/repos";
import { PageHero } from "@/components/ui/PageHero";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Reveal } from "@/components/ui/Reveal";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const settings = await settingsRepo.get();
  const b = settings.business;
  return (
    <div>
      <PageHero eyebrow="Get in Touch" title="Contact Us" subtitle="Questions about products, installation or custom designs? We'd love to hear from you." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid lg:grid-cols-5 gap-12">
        <Reveal className="lg:col-span-2 space-y-6">
          {[
            { icon: Mail, label: "Email", value: b.email },
            { icon: Phone, label: "Phone", value: b.phone },
            { icon: MapPin, label: "Address", value: `${b.address}, ${b.city}, ${b.state} ${b.pincode}` },
            { icon: Clock, label: "Hours", value: b.hours },
          ].filter((x) => x.value).map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex gap-4 items-start">
              <div className="w-11 h-11 border border-[var(--color-primary)]/40 flex items-center justify-center text-[var(--color-primary)] shrink-0"><Icon size={18} /></div>
              <div>
                <p className="text-[0.65rem] tracking-[0.25em] uppercase text-[var(--color-muted)]">{label}</p>
                <p className="mt-1 text-sm">{value}</p>
              </div>
            </div>
          ))}
          {settings.business.whatsapp && (
            <a
              href={`https://wa.me/${settings.business.whatsapp.replace(/\D/g, "")}`}
              target="_blank" rel="noreferrer"
              className="btn-lux btn-lux--gold inline-flex mt-4"
            >Chat on WhatsApp</a>
          )}
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-3">
          <div className="bg-[var(--color-surface)] border hairline p-6 sm:p-8">
            <EnquiryForm type="contact" title="Send a Message" submitLabel="Send Message" />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
