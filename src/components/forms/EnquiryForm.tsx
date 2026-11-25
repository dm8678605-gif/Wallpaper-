"use client";

import { useState } from "react";

export function EnquiryForm({
  type = "enquiry",
  subtype = "general",
  title,
  submitLabel = "Send Enquiry",
  showDetails = false,
}: {
  type?: "enquiry" | "contact" | "general";
  subtype?: "custom-design" | "consultation" | "installation" | "general";
  title?: string;
  submitLabel?: string;
  showDetails?: boolean;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "", wallSize: "", budget: "", timeline: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    const details = showDetails ? { wallSize: form.wallSize, budget: form.budget, timeline: form.timeline } : undefined;
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          type === "contact"
            ? { type: "contact", name: form.name, email: form.email, phone: form.phone, subject: form.subject, message: form.message }
            : { type: "enquiry", subtype, name: form.name, email: form.email, phone: form.phone, message: form.message, details }
        ),
      });
      if (res.ok) {
        setState("done");
        setMsg("Thank you! We'll be in touch shortly.");
      } else {
        setState("error");
        setMsg("Something went wrong. Please try again.");
      }
    } catch {
      setState("error");
      setMsg("Network error.");
    }
  }

  if (state === "done") {
    return (
      <div className="border hairline bg-[var(--color-secondary)]/10 p-8 text-center">
        <p className="font-display text-2xl text-[var(--color-secondary)]">{msg}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {title && <h3 className="font-display text-2xl">{title}</h3>}
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className="label-lux">Name *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-lux" /></div>
        <div><label className="label-lux">Email *</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-lux" /></div>
        <div><label className="label-lux">Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-lux" /></div>
        {type === "contact" && (
          <div><label className="label-lux">Subject</label><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-lux" /></div>
        )}
      </div>
      {showDetails && (
        <div className="grid sm:grid-cols-3 gap-4">
          <div><label className="label-lux">Wall size</label><input value={form.wallSize} onChange={(e) => setForm({ ...form, wallSize: e.target.value })} placeholder="e.g. 12ft × 9ft" className="input-lux" /></div>
          <div><label className="label-lux">Budget</label><input value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="e.g. ₹50,000" className="input-lux" /></div>
          <div><label className="label-lux">Timeline</label><input value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} placeholder="e.g. 1 month" className="input-lux" /></div>
        </div>
      )}
      <div><label className="label-lux">Message *</label><textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-lux" /></div>
      {state === "error" && <p className="text-sm text-red-600">{msg}</p>}
      <button type="submit" disabled={state === "loading"} className="btn-lux">{state === "loading" ? "Sending…" : submitLabel}</button>
    </form>
  );
}
