"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Search, X, Upload, Eye } from "lucide-react";

export interface AdminField {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "boolean" | "image" | "json" | "password" | "date";
  options?: { value: string; label: string }[];
  optionsResource?: string; // fetch /api/admin/crud/<resource> for select options
  optionsLabelKey?: string;
  optionsValueKey?: string;
  placeholder?: string;
  half?: boolean;
  required?: boolean;
}

export interface AdminColumn {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

interface Props {
  resource: string;
  title: string;
  description?: string;
  fields: AdminField[];
  columns: AdminColumn[];
  rowKey?: string;
  searchableKeys?: string[];
  statusField?: { key: string; options: { value: string; label: string }[]; label: string };
  filterId?: string; // when set, only show rows whose `filterKey` equals this
  filterKey?: string;
  hideAdd?: boolean;
  defaultValues?: Record<string, unknown>;
  actions?: (row: Record<string, unknown>, refresh: () => void) => React.ReactNode;
}

export function AdminCrud({
  resource, title, description, fields, columns, rowKey = "id",
  searchableKeys, statusField, filterId, filterKey = "type", hideAdd, defaultValues, actions,
}: Props) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [optionCache, setOptionCache] = useState<Record<string, { value: string; label: string }[]>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadField, setUploadField] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/crud/${resource}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setItems(Array.isArray(data.items) ? data.items : data.items ? [data.items] : []);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [load]);

  // fetch select options
  useEffect(() => {
    for (const f of fields) {
      if (f.optionsResource && !optionCache[f.key]) {
        fetch(`/api/admin/crud/${f.optionsResource}`)
          .then((r) => r.json())
          .then((d) => {
            const arr = Array.isArray(d.items) ? d.items : [];
            setOptionCache((c) => ({
              ...c,
              [f.key]: arr.map((o: Record<string, unknown>) => ({
                value: String(o[f.optionsValueKey ?? "id"]),
                label: String(o[f.optionsLabelKey ?? "name"] ?? o[f.optionsLabelKey ?? "id"]),
              })),
            }));
          })
          .catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, optionCache]);

  const visible = useMemo(() => {
    let rows = items;
    if (filterId === "!") rows = rows.filter((r) => r[filterKey] != null && r[filterKey] !== "");
    else if (filterId && filterKey) rows = rows.filter((r) => r[filterKey] === filterId);
    if (query) {
      const q = query.toLowerCase();
      const keys = searchableKeys ?? fields.map((f) => f.key);
      rows = rows.filter((r) => keys.some((k) => String(r[k] ?? "").toLowerCase().includes(q)));
    }
    return rows;
  }, [items, filterId, filterKey, query, searchableKeys, fields]);

  async function save() {
    if (!editing) return;
    setSaving(true);
    setFormError("");
    try {
      const payload = { ...editing };
      // coerce types
      for (const f of fields) {
        if (f.type === "number" && payload[f.key] !== "" && payload[f.key] != null) payload[f.key] = Number(payload[f.key]);
        if (f.type === "json" && typeof payload[f.key] === "string") {
          try { payload[f.key] = JSON.parse(payload[f.key] as string); } catch { /* keep string */ }
        }
      }
      const isCreate = isNew || !payload[rowKey];
      const res = await fetch(`/api/admin/crud/${resource}`, {
        method: isCreate ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isCreate ? { item: payload } : { id: payload[rowKey], patch: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setEditing(null);
      await load();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: Record<string, unknown>) {
    if (!confirm(`Delete this ${title.toLowerCase().replace(/s$/, "")}?`)) return;
    const res = await fetch(`/api/admin/crud/${resource}?id=${row[rowKey]}`, { method: "DELETE" });
    if (!res.ok) alert("Delete failed");
    await load();
  }

  async function setStatus(row: Record<string, unknown>, value: string) {
    const res = await fetch(`/api/admin/crud/${resource}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row[rowKey], patch: { [statusField!.key]: value } }),
    });
    if (res.ok) await load();
  }

  async function uploadImage(fieldKey: string, file: File) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", resource);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok && editing) {
      setEditing({ ...editing, [fieldKey]: data.url });
    } else {
      alert(data.error ?? "Upload failed");
    }
  }

  function fieldOptions(f: AdminField) {
    if (f.options) return f.options;
    if (f.optionsResource) return optionCache[f.key] ?? [];
    return [];
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl">{title}</h1>
          {description && <p className="text-sm text-[#8A7B6B] mt-1">{description}</p>}
        </div>
        {!hideAdd && (
          <button
            onClick={() => { setIsNew(true); setEditing({ ...(defaultValues ?? {}) }); setFormError(""); }}
            className="btn-lux !bg-[#B79A61] !border-[#B79A61] !text-[#30251F]"
          >
            <Plus size={15} /> Add New
          </button>
        )}
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A7B6B]" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="input-lux !pl-9 !py-2.5 text-sm" />
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="bg-white border border-black/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-black/10 text-left">
              {columns.map((c) => <th key={c.key} className="px-4 py-3 text-[0.65rem] tracking-[0.2em] uppercase text-[#8A7B6B] font-semibold">{c.label}</th>)}
              {statusField && <th className="px-4 py-3 text-[0.65rem] tracking-[0.2em] uppercase text-[#8A7B6B] font-semibold">{statusField.label}</th>}
              <th className="px-4 py-3 text-[0.65rem] tracking-[0.2em] uppercase text-[#8A7B6B] font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length + 2} className="px-4 py-12 text-center text-[#8A7B6B]">Loading…</td></tr>
            ) : visible.length === 0 ? (
              <tr><td colSpan={columns.length + 2} className="px-4 py-12 text-center text-[#8A7B6B]">No records found.</td></tr>
            ) : visible.map((row) => (
              <tr key={String(row[rowKey])} className="border-b border-black/5 hover:bg-black/[0.02]">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 align-top">
                    {c.render ? c.render(row) : <span className="line-clamp-2">{String(row[c.key] ?? "—")}</span>}
                  </td>
                ))}
                {statusField && (
                  <td className="px-4 py-3">
                    <select
                      value={String(row[statusField.key] ?? "")}
                      onChange={(e) => setStatus(row, e.target.value)}
                      className="border border-black/15 px-2 py-1 text-xs bg-white"
                    >
                      {statusField.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                )}
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {actions?.(row, load)}
                    <button onClick={() => { setIsNew(false); setEditing({ ...row }); setFormError(""); }} className="p-2 hover:bg-black/5" title="Edit"><Pencil size={15} /></button>
                    <button onClick={() => remove(row)} className="p-2 hover:bg-red-50 text-red-600" title="Delete"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[#8A7B6B] mt-3">{visible.length} of {items.length} records</p>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 overflow-y-auto bg-black/50" onClick={() => setEditing(null)}>
          <div className="bg-white w-full max-w-2xl my-10 p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl">{isNew ? `New ${title.replace(/s$/, "")}` : `Edit ${title.replace(/s$/, "")}`}</h2>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-black/5"><X size={18} /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {fields.map((f) => {
                const val = editing[f.key];
                const opts = fieldOptions(f);
                return (
                  <div key={f.key} className={f.half === false || f.type === "textarea" || f.type === "json" || f.type === "image" ? "sm:col-span-2" : ""}>
                    <label className="label-lux">{f.label}{f.required ? " *" : ""}</label>
                    {f.type === "textarea" ? (
                      <textarea rows={4} value={String(val ?? "")} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} className="input-lux" placeholder={f.placeholder} />
                    ) : f.type === "json" ? (
                      <textarea rows={3} value={typeof val === "string" ? val : JSON.stringify(val ?? "", null, 0)} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} className="input-lux font-mono text-xs" placeholder='[{"label":"..","value":".."}]' />
                    ) : f.type === "select" ? (
                      <select value={String(val ?? "")} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} className="input-lux">
                        <option value="">—</option>
                        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : f.type === "boolean" ? (
                      <label className="flex items-center gap-2 pt-2 text-sm">
                        <input type="checkbox" checked={Boolean(val)} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.checked })} className="accent-[#B79A61] w-4 h-4" />
                        Enabled
                      </label>
                    ) : f.type === "image" ? (
                      <div className="flex gap-2">
                        <input value={String(val ?? "")} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} className="input-lux flex-1" placeholder="https://… or /uploads/…" />
                        <button
                          type="button"
                          onClick={() => { setUploadField(f.key); fileRef.current?.click(); }}
                          className="btn-lux !px-3 !py-2"
                          title="Upload image"
                        ><Upload size={14} /></button>
                        {typeof val === "string" && val && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={val} alt="" className="w-12 h-12 object-cover border border-black/10" />
                        )}
                      </div>
                    ) : (
                      <input
                        type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "password" ? "password" : "text"}
                        step={f.type === "number" ? "any" : undefined}
                        value={String(val ?? "")}
                        onChange={(e) => setEditing({ ...editing, [f.key]: f.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value })}
                        className="input-lux"
                        placeholder={f.placeholder}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {formError && <p className="text-sm text-red-600 mt-4">{formError}</p>}
            <div className="flex gap-3 mt-8">
              <button onClick={save} disabled={saving} className="btn-lux !bg-[#B79A61] !border-[#B79A61] !text-[#30251F]">
                {saving ? "Saving…" : "Save"}
              </button>
              <button onClick={() => setEditing(null)} className="btn-lux btn-lux--outline">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && uploadField) uploadImage(uploadField, file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
