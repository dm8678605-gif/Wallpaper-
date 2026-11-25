"use client";

import { useEffect, useState } from "react";

/** Generic settings-doc editor: loads a doc resource, edits JSON fields via typed inputs, PUTs back. */
export function DocEditor({
  resource,
  title,
  description,
  sections,
}: {
  resource: string;
  title: string;
  description?: string;
  sections: {
    title: string;
    fields: { path: string; label: string; type?: "text" | "number" | "boolean" | "select" | "textarea" | "color"; options?: { value: string; label: string }[]; step?: string }[];
  }[];
}) {
  const [doc, setDoc] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`/api/admin/crud/${resource}`).then((r) => r.json()).then(setDoc).catch(() => setDoc({}));
  }, [resource]);

  function get(path: string): unknown {
    return path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], doc ?? {});
  }
  function set(path: string, value: unknown) {
    setDoc((prev) => {
      const next = JSON.parse(JSON.stringify(prev ?? {})) as Record<string, unknown>;
      const keys = path.split(".");
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = cur[keys[i]] ?? {};
        cur = cur[keys[i]] as Record<string, unknown>;
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setMsg("");
    const res = await fetch(`/api/admin/crud/${resource}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doc }),
    });
    setMsg(res.ok ? "Saved — storefront updated." : "Save failed");
    setSaving(false);
  }

  if (!doc) return <p className="text-[#8A7B6B] py-16 text-center">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl">{title}</h1>
      {description && <p className="text-sm text-[#8A7B6B] mt-1 mb-8">{description}</p>}
      <div className="space-y-8">
        {sections.map((sec) => (
          <section key={sec.title} className="bg-white border border-black/10 p-6">
            <h2 className="font-semibold mb-5 pb-3 border-b border-black/10">{sec.title}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {sec.fields.map((f) => {
                const v = get(f.path);
                return (
                  <div key={f.path} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                    <label className="label-lux">{f.label}</label>
                    {f.type === "boolean" ? (
                      <label className="flex items-center gap-2 pt-2 text-sm">
                        <input type="checkbox" className="accent-[#B79A61] w-4 h-4" checked={Boolean(v)} onChange={(e) => set(f.path, e.target.checked)} />
                        {v ? "Enabled" : "Disabled"}
                      </label>
                    ) : f.type === "select" ? (
                      <select className="input-lux" value={String(v ?? "")} onChange={(e) => set(f.path, e.target.value)}>
                        {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : f.type === "textarea" ? (
                      <textarea rows={3} className="input-lux" value={String(v ?? "")} onChange={(e) => set(f.path, e.target.value)} />
                    ) : f.type === "color" ? (
                      <div className="flex gap-2 items-center">
                        <input type="color" className="w-12 h-10 border border-black/15" value={String(v ?? "#000000")} onChange={(e) => set(f.path, e.target.value)} />
                        <input className="input-lux flex-1" value={String(v ?? "")} onChange={(e) => set(f.path, e.target.value)} />
                      </div>
                    ) : (
                      <input
                        type={f.type === "number" ? "number" : "text"}
                        step={f.step}
                        className="input-lux"
                        value={String(v ?? "")}
                        onChange={(e) => set(f.path, f.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-8">
        <button onClick={save} disabled={saving} className="btn-lux !bg-[#B79A61] !border-[#B79A61] !text-[#30251F]">
          {saving ? "Saving…" : "Save Changes"}
        </button>
        {msg && <p className="text-sm text-[#555E47]">{msg}</p>}
      </div>
    </div>
  );
}
