"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";
import type { NavigationItem } from "@/lib/data/types";

export default function NavigationManagerPage() {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    const res = await fetch("/api/admin/crud/navigation");
    const d = await res.json();
    setItems((d.items ?? []).sort((a: NavigationItem, b: NavigationItem) => a.order - b.order));
    setLoading(false);
  }, []);
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [load]);

  async function save(next: NavigationItem[]) {
    const res = await fetch("/api/admin/crud/navigation", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doc: { items: next.map((i, idx) => ({ ...i, order: idx })) } }),
    });
    if (res.ok) setItems(next.map((i, idx) => ({ ...i, order: idx })));
  }
  const flat = (arr: NavigationItem[]): NavigationItem[] => arr.flatMap((i) => [i, ...(i.children ?? [])]);
  const findParent = (id: string): { parent: NavigationItem | null; index: number; childIndex: number } | null => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx >= 0) return { parent: null, index: idx, childIndex: -1 };
    for (let i = 0; i < items.length; i++) {
      const ci = (items[i].children ?? []).findIndex((c) => c.id === id);
      if (ci >= 0) return { parent: items[i], index: i, childIndex: ci };
    }
    return null;
  };
  function move(id: string, dir: -1 | 1) {
    const loc = findParent(id); if (!loc) return;
    const next = JSON.parse(JSON.stringify(items)) as NavigationItem[];
    if (loc.parent) {
      const arr = next[loc.index].children!;
      const j = loc.childIndex + dir; if (j < 0 || j >= arr.length) return;
      [arr[loc.childIndex], arr[j]] = [arr[j], arr[loc.childIndex]];
    } else {
      const j = loc.index + dir; if (j < 0 || j >= next.length) return;
      [next[loc.index], next[j]] = [next[j], next[loc.index]];
    }
    save(next);
  }
  function patch(id: string, p: Partial<NavigationItem>) {
    const next = JSON.parse(JSON.stringify(items)) as NavigationItem[];
    const loc = findParent(id); if (!loc) return;
    if (loc.parent) Object.assign(next[loc.index].children![loc.childIndex], p);
    else Object.assign(next[loc.index], p);
    save(next);
  }
  function addChild(parentId: string) {
    const next = JSON.parse(JSON.stringify(items)) as NavigationItem[];
    const p = next.find((i) => i.id === parentId);
    if (!p) return;
    p.children = [...(p.children ?? []), { id: `nav_${Date.now()}`, label: "New Link", href: "/", order: (p.children?.length ?? 0), visible: true }];
    save(next);
  }
  function remove(id: string) {
    const loc = findParent(id); if (!loc) return;
    const next = JSON.parse(JSON.stringify(items)) as NavigationItem[];
    if (loc.parent) next[loc.index].children = next[loc.index].children!.filter((_, i) => i !== loc.childIndex);
    else next.splice(loc.index, 1);
    save(next);
  }

  if (loading) return <p className="text-[#8A7B6B] py-16 text-center">Loading…</p>;
  const inp = "input-lux !py-1.5 text-sm";

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">Navigation Manager</h1>
          <p className="text-sm text-[#8A7B6B] mt-1">Header menu — one level of dropdown children supported.</p>
        </div>
        <button onClick={() => save([...items, { id: `nav_${Date.now()}`, label: "New Link", href: "/", order: items.length, visible: true }])} className="btn-lux !bg-[#B79A61] !border-[#B79A61] !text-[#30251F]"><Plus size={15} /> Add Link</button>
      </div>
      <div className="bg-white border border-black/10 divide-y divide-black/5">
        {items.map((item) => (
          <div key={item.id}>
            <div className="flex items-center gap-2 p-3">
              <div className="flex flex-col">
                <button onClick={() => move(item.id, -1)} className="p-0.5 hover:bg-black/5"><ChevronUp size={13} /></button>
                <button onClick={() => move(item.id, 1)} className="p-0.5 hover:bg-black/5"><ChevronDown size={13} /></button>
              </div>
              <input className={`${inp} w-36`} value={item.label} onChange={(e) => patch(item.id, { label: e.target.value })} />
              <input className={`${inp} flex-1`} value={item.href} onChange={(e) => patch(item.id, { href: e.target.value })} />
              <button onClick={() => addChild(item.id)} className="p-1.5 text-xs border border-black/15 hover:border-[#B79A61] whitespace-nowrap">+ Child</button>
              <button onClick={() => patch(item.id, { visible: !item.visible })} className="p-1.5" title="Toggle visibility">{item.visible ? <Eye size={15} /> : <EyeOff size={15} />}</button>
              <button onClick={() => remove(item.id)} className="p-1.5 text-red-600"><Trash2 size={15} /></button>
            </div>
            {(item.children ?? []).map((c) => (
              <div key={c.id} className="flex items-center gap-2 p-3 pl-14 bg-black/[0.02]">
                <input className={`${inp} w-36`} value={c.label} onChange={(e) => {
                  const next = JSON.parse(JSON.stringify(items)) as NavigationItem[];
                  const p = next.find((i) => i.id === item.id);
                  const cc = p?.children?.find((x) => x.id === c.id);
                  if (cc) { cc.label = e.target.value; save(next); }
                }} />
                <input className={`${inp} flex-1`} value={c.href} onChange={(e) => {
                  const next = JSON.parse(JSON.stringify(items)) as NavigationItem[];
                  const p = next.find((i) => i.id === item.id);
                  const cc = p?.children?.find((x) => x.id === c.id);
                  if (cc) { cc.href = e.target.value; save(next); }
                }} />
                <button onClick={() => patch(c.id, { visible: !c.visible })} className="p-1.5">{c.visible ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                <button onClick={() => remove(c.id)} className="p-1.5 text-red-600"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
