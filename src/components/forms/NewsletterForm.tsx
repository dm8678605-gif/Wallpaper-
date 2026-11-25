"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "newsletter", email }),
      });
      const data = await res.json();
      if (res.ok) {
        setState("done");
        setMsg("Thank you for subscribing.");
        setEmail("");
      } else {
        setState("error");
        setMsg(data.error ?? "Something went wrong.");
      }
    } catch {
      setState("error");
      setMsg("Network error.");
    }
  }

  if (state === "done") return <p className="text-sm text-[#B79A61]">{msg}</p>;
  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="flex-1 bg-white/10 border border-white/20 px-3 py-2.5 text-sm text-white placeholder:text-[#8d8172] outline-none focus:border-[#B79A61]"
      />
      <button type="submit" disabled={state === "loading"} className="bg-[#B79A61] text-[#30251F] px-4 text-[0.7rem] tracking-[0.2em] uppercase font-semibold hover:bg-white transition-colors">
        {state === "loading" ? "…" : "Join"}
      </button>
      {state === "error" && <p className="text-xs text-red-300 self-center">{msg}</p>}
    </form>
  );
}
