"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { FooterConfig } from "@/lib/data/types";

export default function FooterManagerPage() {
  const [doc, setDoc] = useState<FooterConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/crud/footer");
    setDoc(await res.json());
  }, []);
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [load]);

  async function save(next: FooterConfig) {
    setSaving(true);
    const res = await fetch("/api/admin/crud/footer", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ doc: next }),
    });
    setMsg(res.ok ? "Saved." : "Save failed");
    setSaving(false);
    if (res.ok) setDoc(next);
  }

  if (!doc) return <p className="text-[#8A7B6B] py-16 text-center">Loading…</p>;
  const inp = "input-lux !py-1.5 text-sm";

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl mb-1">Footer Manager</h1>
      <p className="text-sm text-[#8A7B6B] mb-6">Link columns, about text and toggles for the site footer.</p>

      <div className="bg-white border border-black/10 p-6 mb-6 space-y-4">
        <div><label className="label-lux">About Text</label>
          <textarea rows={3} className="input-lux" value={doc.aboutText ?? ""} onChange={(e) => setDoc({ ...doc, aboutText: e.target.value })} /></div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-[#B79A61]" checked={Boolean(doc.showNewsletter)} onChange={(e) => setDoc({ ...doc, showNewsletter: e.target.checked })} /> Newsletter signup</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-[#B79A61]" checked={Boolean(doc.showSocial)} onChange={(e) => setDoc({ ...doc, showSocial: e.target.checked })} /> Social icons</label>
        </div>
      </div>

      <div className="space-y-4">
        {(doc.columns ?? []).map((col, ci) => (
          <div key={ci} className="bg-white border border-black/10 p-5">
            <div className="flex items-center gap-2 mb-4">
              <input className={`${inp} flex-1 font-semibold`} value={col.title} onChange={(e) => {
                const next = JSON.parse(JSON.stringify(doc)) as FooterConfig;
                next.columns[ci].title = e.target.value;
                setDoc(next);
              }} />
              <button onClick={() => {
                const next = JSON.parse(JSON.stringify(doc)) as FooterConfig;
                next.columns.splice(ci, 1);
                setDoc(next);
              }} className="p-2 text-red-600"><Trash2 size={15} /></button>
            </div>
            <div className="space-y-2">
              {col.links.map((l, li) => (
                <div key={li} className="flex gap-2">
                  <input className={`${inp} w-40`} placeholder="Label" value={l.label} onChange={(e) => {
                    const next = JSON.parse(JSON.stringify(doc)) as FooterConfig;
                    next.columns[ci].links[li].label = e.target.value;
                    setDoc(next);
                  }} />
                  <input className={`${inp} flex-1`} placeholder="/href" value={l.href} onChange={(e) => {
                    const next = JSON.parse(JSON.stringify(doc)) as FooterConfig;
                    next.columns[ci].links[li].href = e.target.value;
                    setDoc(next);
                  }} />
                  <button onClick={() => {
                    const next = JSON.parse(JSON.stringify(doc)) as FooterConfig;
                    next.columns[ci].links.splice(li, 1);
                    setDoc(next);
                  }} className="p-1.5 text-red-600"><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => {
                const next = JSON.parse(JSON.stringify(doc)) as FooterConfig;
                next.columns[ci].links.push({ label: "New Link", href: "/" });
                setDoc(next);
              }} className="text-xs text-[#8a6d3b] hover:underline flex items-center gap-1"><Plus size={12} /> Add link</button>
            </div>
          </div>
        ))}
        <button onClick={() => setDoc({ ...doc, columns: [...(doc.columns ?? []), { title: "New Column", links: [{ label: "Link", href: "/" }] }] })} className="btn-lux btn-lux--outline text-xs">
          <Plus size={13} /> Add Column
        </button>
      </div>

      <div className="flex items-center gap-4 mt-8">
        <button onClick={() => save(doc)} disabled={saving} className="btn-lux !bg-[#B79A61] !border-[#B79A61] !text-[#30251F]">{saving ? "Saving…" : "Save Footer"}</button>
        {msg && <p className="text-sm text-[#555E47]">{msg}</p>}
      </div>
    </div>
  );
}
