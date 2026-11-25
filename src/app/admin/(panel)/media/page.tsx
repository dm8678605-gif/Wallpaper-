"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, Trash2, Copy } from "lucide-react";

interface Asset { id: string; filename: string; url: string; mimeType: string; size: number; folder?: string; createdAt: string }

export default function MediaLibraryPage() {
  const [items, setItems] = useState<Asset[]>([]);
  const [folder, setFolder] = useState("general");
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/crud/media");
    const d = await res.json();
    setItems(Array.isArray(d.items) ? d.items : []);
  }, []);
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [load]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      await fetch("/api/admin/upload", { method: "POST", body: fd });
    }
    setUploading(false);
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this media asset?")) return;
    await fetch(`/api/admin/crud/media?id=${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl">Media Library</h1>
          <p className="text-sm text-[#8A7B6B] mt-1">{items.length} assets · uploaded files are stored locally in /public/uploads</p>
        </div>
        <div className="flex gap-2">
          <input value={folder} onChange={(e) => setFolder(e.target.value.replace(/[^a-z0-9-_]/gi, "-"))} className="input-lux !py-2 !w-40 text-sm" placeholder="folder" />
          <button onClick={() => ref.current?.click()} disabled={uploading} className="btn-lux !bg-[#B79A61] !border-[#B79A61] !text-[#30251F]">
            <Upload size={15} /> {uploading ? "Uploading…" : "Upload"}
          </button>
          <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((m) => (
          <div key={m.id} className="bg-white border border-black/10 group relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt={m.filename} className="w-full aspect-square object-cover" />
            <div className="p-2">
              <p className="text-xs truncate">{m.filename}</p>
              <p className="text-[0.6rem] text-[#8A7B6B]">{m.folder} · {(m.size / 1024).toFixed(0)}KB</p>
            </div>
            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { navigator.clipboard.writeText(m.url); }} className="p-1.5 bg-white/90" title="Copy URL"><Copy size={13} /></button>
              <button onClick={() => remove(m.id)} className="p-1.5 bg-white/90 text-red-600" title="Delete"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <p className="text-[#8A7B6B] text-sm py-16 text-center">No media yet — upload images to use across the site.</p>}
    </div>
  );
}
