"use client";

import { useState } from "react";
import { Package } from "lucide-react";

export function SampleOrderButton({ productIds, productName }: { productIds: string[]; productName?: string }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "sample", ...form, productIds }),
      });
      if (res.ok) {
        setState("done");
        setMsg("Sample request received! We'll contact you shortly.");
      } else {
        setState("error");
        setMsg("Something went wrong. Please try again.");
      }
    } catch {
      setState("error");
      setMsg("Network error.");
    }
  }

  return (
    <div>
      <button type="button" onClick={() => setOpen((o) => !o)} className="btn-lux btn-lux--outline w-full justify-center mt-3">
        <Package size={15} /> Order {productName ? "Sample" : "Samples"}
      </button>
      {open && (
        <form onSubmit={submit} className="mt-4 border hairline bg-[var(--color-surface)] p-5 space-y-3">
          <p className="text-sm font-semibold">Request wallpaper samples{productName ? ` — ${productName}` : ""}</p>
          {[["name", "Full name"], ["email", "Email"], ["phone", "Phone"], ["address", "Delivery address"]].map(([k, label]) => (
            <div key={k}>
              <label className="label-lux">{label}</label>
              <input
                required={k !== "phone"}
                type={k === "email" ? "email" : "text"}
                className="input-lux"
                value={form[k as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              />
            </div>
          ))}
          <button type="submit" disabled={state === "loading"} className="btn-lux w-full justify-center">
            {state === "loading" ? "Submitting…" : "Request Samples"}
          </button>
          {state === "done" && <p className="text-sm text-[var(--color-secondary)]">{msg}</p>}
          {state === "error" && <p className="text-sm text-red-600">{msg}</p>}
        </form>
      )}
    </div>
  );
}
