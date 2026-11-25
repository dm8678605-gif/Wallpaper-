"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronUp, ChevronDown, Eye, EyeOff, Copy, Trash2, Plus } from "lucide-react";
import type { HomepageSection } from "@/lib/data/types";

const SECTION_TYPES: { value: HomepageSection["type"]; label: string }[] = [
  { value: "hero", label: "Hero Carousel" },
  { value: "featured-products", label: "Featured Products" },
  { value: "categories", label: "Categories Grid" },
  { value: "collections", label: "Collections" },
  { value: "rooms", label: "Rooms" },
  { value: "colours", label: "Colours" },
  { value: "materials", label: "Materials" },
  { value: "styles", label: "Style Tags" },
  { value: "banner", label: "Banner / CTA" },
  { value: "editorial", label: "Editorial Split" },
  { value: "inspiration", label: "Inspiration Gallery" },
  { value: "custom-cta", label: "Custom CTA" },
];

const BGS = ["", "ivory", "white", "espresso", "gold", "olive"];

export default function HomepageManagerPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [editing, setEditing] = useState<HomepageSection | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/crud/homepage");
    const d = await res.json();
    setSections((d.sections ?? []).sort((a: HomepageSection, b: HomepageSection) => a.order - b.order));
    setLoading(false);
  }, []);
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [load]);

  async function saveAll(next: HomepageSection[]) {
    const res = await fetch("/api/admin/crud/homepage", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doc: { sections: next.map((s, i) => ({ ...s, order: i })) } }),
    });
    if (res.ok) setSections(next.map((s, i) => ({ ...s, order: i })));
    else alert("Save failed");
  }

  function move(idx: number, dir: -1 | 1) {
    const next = [...sections];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    saveAll(next);
  }

  function toggleVisible(s: HomepageSection) {
    saveAll(sections.map((x) => (x.id === s.id ? { ...x, visible: !x.visible } : x)));
  }

  function duplicate(s: HomepageSection) {
    const copy = { ...s, id: `hs_${Date.now()}`, title: (s.title ?? "") + " (copy)", visible: false };
    const idx = sections.findIndex((x) => x.id === s.id);
    const next = [...sections];
    next.splice(idx + 1, 0, copy);
    saveAll(next);
  }

  function remove(s: HomepageSection) {
    if (!confirm("Remove this section?")) return;
    saveAll(sections.filter((x) => x.id !== s.id));
  }

  async function saveEdit() {
    if (!editing) return;
    const exists = sections.some((s) => s.id === editing.id);
    const next = exists ? sections.map((s) => (s.id === editing.id ? editing : s)) : [...sections, editing];
    await saveAll(next);
    setEditing(null);
  }

  if (loading) return <p className="text-[#8A7B6B] py-16 text-center">Loading…</p>;

  const inp = "input-lux";
  const lbl = "label-lux";

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">Homepage Manager</h1>
          <p className="text-sm text-[#8A7B6B] mt-1">Reorder, show/hide, edit or add homepage sections. Changes appear on the storefront immediately.</p>
        </div>
        <button
          onClick={() => setEditing({ id: `hs_${Date.now()}`, type: "banner", title: "New Section", visible: true, order: sections.length, layout: "grid" })}
          className="btn-lux !bg-[#B79A61] !border-[#B79A61] !text-[#30251F]"
        ><Plus size={15} /> Add Section</button>
      </div>

      <div className="space-y-2">
        {sections.map((s, i) => (
          <div key={s.id} className={`bg-white border p-4 flex items-center gap-3 ${s.visible ? "border-black/10" : "border-black/10 opacity-60"}`}>
            <div className="flex flex-col">
              <button onClick={() => move(i, -1)} className="p-1 hover:bg-black/5" disabled={i === 0}><ChevronUp size={14} /></button>
              <button onClick={() => move(i, 1)} className="p-1 hover:bg-black/5" disabled={i === sections.length - 1}><ChevronDown size={14} /></button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{s.title || SECTION_TYPES.find((t) => t.value === s.type)?.label || s.type}</p>
              <p className="text-xs text-[#8A7B6B]">{SECTION_TYPES.find((t) => t.value === s.type)?.label ?? s.type}{s.itemsSource ? ` · ${s.itemsSource}` : ""}{s.background ? ` · ${s.background}` : ""}</p>
            </div>
            <button onClick={() => toggleVisible(s)} className="p-2 hover:bg-black/5" title={s.visible ? "Hide" : "Show"}>{s.visible ? <Eye size={16} /> : <EyeOff size={16} />}</button>
            <button onClick={() => duplicate(s)} className="p-2 hover:bg-black/5" title="Duplicate"><Copy size={15} /></button>
            <button onClick={() => setEditing({ ...s })} className="px-3 py-1.5 text-xs border border-black/15 hover:border-[#B79A61]">Edit</button>
            <button onClick={() => remove(s)} className="p-2 hover:bg-red-50 text-red-600" title="Delete"><Trash2 size={15} /></button>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 overflow-y-auto bg-black/50" onClick={() => setEditing(null)}>
          <div className="bg-white w-full max-w-2xl my-10 p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl mb-6">Edit Section</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className={lbl}>Section Type</label>
                <select className={inp} value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as HomepageSection["type"] })}>
                  {SECTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div><label className={lbl}>Background</label>
                <select className={inp} value={editing.background ?? ""} onChange={(e) => setEditing({ ...editing, background: e.target.value || undefined })}>
                  {BGS.map((b) => <option key={b} value={b}>{b || "default"}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2"><label className={lbl}>Title</label><input className={inp} value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div className="sm:col-span-2"><label className={lbl}>Subtitle</label><input className={inp} value={editing.subtitle ?? ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} /></div>
              <div className="sm:col-span-2"><label className={lbl}>Content / Description</label><textarea rows={3} className={inp} value={editing.content ?? ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} /></div>
              <div><label className={lbl}>Image URL</label><input className={inp} value={editing.image ?? ""} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="/uploads/… or https://…" /></div>
              <div><label className={lbl}>Link</label><input className={inp} value={editing.link ?? ""} onChange={(e) => setEditing({ ...editing, link: e.target.value })} placeholder="/shop" /></div>
              <div><label className={lbl}>Link Label</label><input className={inp} value={editing.linkLabel ?? ""} onChange={(e) => setEditing({ ...editing, linkLabel: e.target.value })} /></div>
              <div><label className={lbl}>Items Source</label>
                <select className={inp} value={editing.itemsSource ?? ""} onChange={(e) => setEditing({ ...editing, itemsSource: e.target.value || undefined })}>
                  <option value="">—</option>
                  <option value="featured">Featured products</option>
                  <option value="categories">Categories</option>
                  <option value="collections">Collections</option>
                  <option value="rooms">Rooms</option>
                  <option value="colours">Colours</option>
                  <option value="materials">Materials</option>
                  <option value="styles">Style tags</option>
                  <option value="gallery">Inspiration gallery</option>
                </select>
              </div>
              <div><label className={lbl}>Item Limit</label><input type="number" className={inp} value={editing.limit ?? ""} onChange={(e) => setEditing({ ...editing, limit: e.target.value ? Number(e.target.value) : undefined })} /></div>
              <div><label className={lbl}>Layout</label>
                <select className={inp} value={editing.layout ?? "grid"} onChange={(e) => setEditing({ ...editing, layout: e.target.value as HomepageSection["layout"] })}>
                  {["grid", "carousel", "editorial", "split"].map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={saveEdit} className="btn-lux !bg-[#B79A61] !border-[#B79A61] !text-[#30251F]">Save Section</button>
              <button onClick={() => setEditing(null)} className="btn-lux btn-lux--outline">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
