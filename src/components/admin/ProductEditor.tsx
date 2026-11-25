"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star, Trash2, Upload, ChevronUp, ChevronDown } from "lucide-react";
import type { Product } from "@/lib/data/types";

interface Opt { id: string; name: string }
interface Taxonomy { categories: Opt[]; subcategories: Opt[]; collections: Opt[]; rooms: Opt[]; colours: Opt[]; materials: Opt[]; styles: Opt[] }

const EMPTY: Partial<Product> = {
  name: "", slug: "", code: "", sku: "", description: "", shortDescription: "",
  categoryId: "", subcategoryId: null, collectionIds: [], roomIds: [], colourIds: [],
  materialIds: [], styleIds: [], pricePerSqft: 60, originalPricePerSqft: undefined,
  samplePrice: undefined, materialPricing: {}, minOrderAreaSqft: 50, wastagePercent: 10,
  installationChargePerSqft: 15, specs: [], stockStatus: "in-stock",
  featured: false, published: true, sample: false, images: [], seo: {},
};

function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

function CheckGroup({ title, options, selected, onToggle }: { title: string; listKey?: string; options: Opt[]; selected: string[]; onToggle: (id: string) => void }) {
  return (
    <div>
      <p className="label-lux">{title}</p>
      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border hairline p-3">
        {options.length === 0 && <span className="text-xs text-[#8A7B6B]">No options</span>}
        {options.map((o) => (
          <label key={o.id} className={`px-3 py-1.5 text-xs border cursor-pointer transition-colors ${selected.includes(o.id) ? "border-[#B79A61] bg-[#B79A61]/10 text-[#8a6d3b] font-medium" : "border-black/15"}`}>
            <input type="checkbox" className="hidden" checked={selected.includes(o.id)} onChange={() => onToggle(o.id)} />
            {o.name}
          </label>
        ))}
      </div>
    </div>
  );
}

export function ProductEditor({ productId }: { productId?: string }) {
  const router = useRouter();
  const [p, setP] = useState<Partial<Product>>(EMPTY);
  const [tax, setTax] = useState<Taxonomy>({ categories: [], subcategories: [], collections: [], rooms: [], colours: [], materials: [], styles: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const addImgRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((prev) => ({ ...prev, [k]: v }));

  const loadTax = useCallback(async () => {
    const get = async (r: string) => {
      const res = await fetch(`/api/admin/crud/${r}`);
      const d = await res.json();
      return (Array.isArray(d.items) ? d.items : []).map((x: Record<string, unknown>) => ({ id: String(x.id), name: String(x.name) }));
    };
    const [categories, collections, rooms, colours, materials, styles] = await Promise.all([
      get("categories"), get("collections"), get("rooms"), get("colours"), get("materials"), get("styles"),
    ]);
    const allCats = await get("categories");
    void allCats;
    setTax({
      categories: (categories as (Opt & { parentId?: string | null })[]).filter((c) => !c.parentId),
      subcategories: [], collections, rooms, colours, materials, styles,
    });
    // subcategories need parentId — refetch raw
    const res = await fetch("/api/admin/crud/categories");
    const d = await res.json();
    const subs = (Array.isArray(d.items) ? d.items : []).filter((x: Record<string, unknown>) => x.parentId);
    setTax((t) => ({ ...t, subcategories: subs.map((x: Record<string, unknown>) => ({ id: String(x.id), name: String(x.name) })) }));
  }, []);

  useEffect(() => {
    (async () => {
      await loadTax();
      if (productId) {
        const res = await fetch("/api/admin/crud/products");
        const d = await res.json();
        const found = (Array.isArray(d.items) ? d.items : []).find((x: { id: string }) => x.id === productId);
        if (found) setP(found as Product);
      }
      setLoading(false);
    })();
  }, [productId, loadTax]);

  async function upload(file: File, index?: number) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "products");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) { alert(data.error ?? "Upload failed"); return; }
    const url = data.url as string;
    if (index != null) {
      setP((prev) => {
        const imgs = [...(prev.images ?? [])];
        imgs[index] = { ...imgs[index], url };
        return { ...prev, images: imgs };
      });
    } else {
      setP((prev) => ({
        ...prev,
        images: [...(prev.images ?? []), { id: `img_${Date.now()}`, url, primary: !(prev.images ?? []).length }],
      }));
    }
  }

  function moveImage(idx: number, dir: -1 | 1) {
    setP((prev) => {
      const imgs = [...(prev.images ?? [])];
      const j = idx + dir;
      if (j < 0 || j >= imgs.length) return prev;
      [imgs[idx], imgs[j]] = [imgs[j], imgs[idx]];
      return { ...prev, images: imgs };
    });
  }

  function removeImage(idx: number) {
    setP((prev) => {
      const imgs = (prev.images ?? []).filter((_, i) => i !== idx);
      if (imgs.length && !imgs.some((i) => i.primary)) imgs[0].primary = true;
      return { ...prev, images: imgs };
    });
  }

  function setPrimary(idx: number) {
    setP((prev) => ({ ...prev, images: (prev.images ?? []).map((im, i) => ({ ...im, primary: i === idx })) }));
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const body = { ...p };
      if (!body.slug && body.name) body.slug = slugify(String(body.name));
      if (!body.code) body.code = `WP-${Date.now().toString().slice(-6)}`;
      if (!body.sku) body.sku = `SKU-${Date.now().toString().slice(-6)}`;
      const res = await fetch("/api/admin/crud/products", {
        method: productId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productId ? { id: productId, patch: body } : { item: body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      router.push("/admin/products");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  }

  function toggle(listKey: keyof Product, id: string) {
    setP((prev) => {
      const arr = (prev[listKey] as string[] | undefined) ?? [];
      return { ...prev, [listKey]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id] };
    });
  }

  if (loading) return <p className="text-[#8A7B6B] py-16 text-center">Loading…</p>;

  const inp = "input-lux";
  const lbl = "label-lux";

  return (
    <div className="max-w-5xl">
      <button onClick={() => router.push("/admin/products")} className="flex items-center gap-2 text-sm text-[#8A7B6B] hover:text-[#30251F] mb-6">
        <ArrowLeft size={15} /> Back to products
      </button>
      <h1 className="font-display text-3xl mb-8">{productId ? "Edit Product" : "Add Product"}</h1>

      {/* Images */}
      <section className="bg-white border border-black/10 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Images <span className="text-xs text-[#8A7B6B] font-normal">({(p.images ?? []).length}/10 — first is primary unless starred)</span></h2>
          <button type="button" onClick={() => addImgRef.current?.click()} className="btn-lux !px-3 !py-2 text-xs"><Upload size={13} /> Add Image</button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {(p.images ?? []).map((im, i) => (
            <div key={im.id} className={`relative group border ${im.primary ? "border-[#B79A61] ring-2 ring-[#B79A61]/40" : "border-black/10"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.url} alt={im.alt ?? ""} className="w-full aspect-[3/4] object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button type="button" onClick={() => moveImage(i, -1)} className="p-1.5 bg-white/90"><ChevronUp size={13} /></button>
                <button type="button" onClick={() => moveImage(i, 1)} className="p-1.5 bg-white/90"><ChevronDown size={13} /></button>
                <button type="button" onClick={() => setPrimary(i)} className={`p-1.5 ${im.primary ? "bg-[#B79A61] text-white" : "bg-white/90"}`} title="Set primary"><Star size={13} className={im.primary ? "fill-white" : ""} /></button>
                <button type="button" onClick={() => removeImage(i)} className="p-1.5 bg-white/90 text-red-600"><Trash2 size={13} /></button>
              </div>
              {i === 0 && !im.primary && <span className="absolute bottom-1 left-1 text-[0.55rem] bg-black/60 text-white px-1">first</span>}
            </div>
          ))}
          {(p.images ?? []).length === 0 && (
            <button type="button" onClick={() => addImgRef.current?.click()} className="col-span-3 sm:col-span-5 border-2 border-dashed border-black/15 aspect-[3/4] flex items-center justify-center text-sm text-[#8A7B6B] hover:border-[#B79A61] transition-colors">
              <Upload size={18} className="mr-2" /> Upload up to 10 images
            </button>
          )}
        </div>
        <input
          ref={addImgRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
        />
        {/* replace image */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f && uploading != null) upload(f, uploading);
            setUploading(null);
            e.target.value = "";
          }}
        />
      </section>

      {/* Basics */}
      <section className="bg-white border border-black/10 p-6 mb-6 grid sm:grid-cols-2 gap-4">
        <h2 className="font-semibold sm:col-span-2">Basic Information</h2>
        <div className="sm:col-span-2"><label className={lbl}>Product Name *</label><input className={inp} value={String(p.name ?? "")} onChange={(e) => set("name", e.target.value)} /></div>
        <div><label className={lbl}>Slug</label><input className={inp} value={String(p.slug ?? "")} onChange={(e) => set("slug", e.target.value)} placeholder="auto-generated" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={lbl}>Product Code</label><input className={inp} value={String(p.code ?? "")} onChange={(e) => set("code", e.target.value)} /></div>
          <div><label className={lbl}>SKU</label><input className={inp} value={String(p.sku ?? "")} onChange={(e) => set("sku", e.target.value)} /></div>
        </div>
        <div className="sm:col-span-2"><label className={lbl}>Short Description</label><input className={inp} value={String(p.shortDescription ?? "")} onChange={(e) => set("shortDescription", e.target.value)} /></div>
        <div className="sm:col-span-2"><label className={lbl}>Description</label><textarea rows={4} className={inp} value={String(p.description ?? "")} onChange={(e) => set("description", e.target.value)} /></div>
        <div><label className={lbl}>Category *</label>
          <select className={inp} value={String(p.categoryId ?? "")} onChange={(e) => set("categoryId", e.target.value)}>
            <option value="">Select…</option>
            {tax.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div><label className={lbl}>Subcategory</label>
          <select className={inp} value={String(p.subcategoryId ?? "")} onChange={(e) => set("subcategoryId", e.target.value || null)}>
            <option value="">None</option>
            {tax.subcategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </section>

      {/* Taxonomy */}
      <section className="bg-white border border-black/10 p-6 mb-6">
        <h2 className="font-semibold mb-5">Classification</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <CheckGroup title="Collections" listKey="collectionIds" options={tax.collections} selected={(p.collectionIds as string[] | undefined) ?? []} onToggle={(id) => toggle("collectionIds", id)} />
          <CheckGroup title="Suitable Rooms" listKey="roomIds" options={tax.rooms} selected={(p.roomIds as string[] | undefined) ?? []} onToggle={(id) => toggle("roomIds", id)} />
          <CheckGroup title="Colours" listKey="colourIds" options={tax.colours} selected={(p.colourIds as string[] | undefined) ?? []} onToggle={(id) => toggle("colourIds", id)} />
          <CheckGroup title="Materials" listKey="materialIds" options={tax.materials} selected={(p.materialIds as string[] | undefined) ?? []} onToggle={(id) => toggle("materialIds", id)} />
          <CheckGroup title="Style Tags" listKey="styleIds" options={tax.styles} selected={(p.styleIds as string[] | undefined) ?? []} onToggle={(id) => toggle("styleIds", id)} />
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white border border-black/10 p-6 mb-6">
        <h2 className="font-semibold mb-5">Pricing & Ordering</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div><label className={lbl}>Price / sq ft *</label><input type="number" step="any" className={inp} value={Number(p.pricePerSqft ?? 0)} onChange={(e) => set("pricePerSqft", Number(e.target.value))} /></div>
          <div><label className={lbl}>Original Price / sq ft</label><input type="number" step="any" className={inp} value={p.originalPricePerSqft ?? ""} onChange={(e) => set("originalPricePerSqft", e.target.value === "" ? undefined : Number(e.target.value))} /></div>
          <div><label className={lbl}>Sample Price</label><input type="number" step="any" className={inp} value={p.samplePrice ?? ""} onChange={(e) => set("samplePrice", e.target.value === "" ? undefined : Number(e.target.value))} /></div>
          <div><label className={lbl}>Min Order Area (sq ft)</label><input type="number" className={inp} value={Number(p.minOrderAreaSqft ?? 0)} onChange={(e) => set("minOrderAreaSqft", Number(e.target.value))} /></div>
          <div><label className={lbl}>Wastage %</label><input type="number" className={inp} value={Number(p.wastagePercent ?? 0)} onChange={(e) => set("wastagePercent", Number(e.target.value))} /></div>
          <div><label className={lbl}>Installation / sq ft</label><input type="number" step="any" className={inp} value={Number(p.installationChargePerSqft ?? 0)} onChange={(e) => set("installationChargePerSqft", Number(e.target.value))} /></div>
        </div>
        {/* Material-specific pricing */}
        {tax.materials.length > 0 && (
          <div className="mt-6">
            <p className={lbl}>Material-Specific Pricing (per sq ft)</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tax.materials.map((m) => (
                <div key={m.id} className="flex items-center gap-2 border hairline px-3 py-2">
                  <span className="text-xs flex-1 truncate">{m.name}</span>
                  <input
                    type="number" step="any" className="input-lux !py-1.5 !px-2 w-24 text-sm"
                    value={p.materialPricing?.[m.id] ?? ""}
                    placeholder={String(p.pricePerSqft ?? "")}
                    onChange={(e) => set("materialPricing", { ...(p.materialPricing ?? {}), [m.id]: e.target.value === "" ? undefined : Number(e.target.value) } as Record<string, number>)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Status & SEO */}
      <section className="bg-white border border-black/10 p-6 mb-6">
        <h2 className="font-semibold mb-5">Status, Specs & SEO</h2>
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div><label className={lbl}>Stock Status</label>
            <select className={inp} value={String(p.stockStatus ?? "in-stock")} onChange={(e) => set("stockStatus", e.target.value as Product["stockStatus"])}>
              {["in-stock", "low-stock", "out-of-stock", "made-to-order"].map((s) => <option key={s} value={s}>{s.replace("-", " ")}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-6 pb-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-[#B79A61] w-4 h-4" checked={Boolean(p.featured)} onChange={(e) => set("featured", e.target.checked)} /> Featured</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-[#B79A61] w-4 h-4" checked={Boolean(p.published)} onChange={(e) => set("published", e.target.checked)} /> Published</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-[#B79A61] w-4 h-4" checked={Boolean(p.sample)} onChange={(e) => set("sample", e.target.checked)} /> Sample product</label>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className={lbl}>Specifications (JSON)</label>
            <textarea rows={4} className={`${inp} font-mono text-xs`} value={JSON.stringify(p.specs ?? [], null, 1)} onChange={(e) => { try { set("specs", JSON.parse(e.target.value)); } catch { /* typing */ } }} />
          </div>
          <div>
            <label className={lbl}>Installation Instructions</label>
            <textarea rows={4} className={inp} value={String(p.installationInstructions ?? "")} onChange={(e) => set("installationInstructions", e.target.value)} />
            <label className={`${lbl} mt-4`}>Video URL</label>
            <input className={inp} value={String(p.videoUrl ?? "")} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://…" />
            <label className={`${lbl} mt-4`}>SEO (JSON: title, description, keywords)</label>
            <textarea rows={3} className={`${inp} font-mono text-xs`} value={JSON.stringify(p.seo ?? {}, null, 1)} onChange={(e) => { try { set("seo", JSON.parse(e.target.value)); } catch { /* typing */ } }} />
          </div>
        </div>
      </section>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      <div className="flex gap-3">
        <button onClick={save} disabled={saving} className="btn-lux !bg-[#B79A61] !border-[#B79A61] !text-[#30251F]">
          {saving ? "Saving…" : productId ? "Save Changes" : "Create Product"}
        </button>
        <button onClick={() => router.push("/admin/products")} className="btn-lux btn-lux--outline">Cancel</button>
      </div>
    </div>
  );
}
