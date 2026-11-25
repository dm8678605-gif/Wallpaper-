import { TrackOrderForm } from "@/components/store/TrackOrderForm";
export const dynamic = "force-dynamic";
export const metadata = { title: "Track Order" };
export default function Page() {
  return (
    <div>
      <div className="bg-[var(--color-ink)] text-white py-14 sm:py-16 text-center px-4">
        <p className="eyebrow !text-[#B79A61]">Order Status</p>
        <h1 className="font-display text-3xl sm:text-5xl mt-3">Track Your Order</h1>
      </div>
      <TrackOrderForm />
    </div>
  );
}
