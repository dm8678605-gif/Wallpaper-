import type { Metadata } from "next";
import { settingsRepo } from "@/lib/data/repos";
import { CheckoutForm } from "@/components/store/CheckoutForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const settings = await settingsRepo.get();
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
      <p className="eyebrow">Almost There</p>
      <h1 className="font-display text-4xl sm:text-5xl mt-2 mb-10">Checkout</h1>
      <CheckoutForm settings={settings} />
    </div>
  );
}
