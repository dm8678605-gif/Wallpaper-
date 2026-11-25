"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Star } from "lucide-react";

export function ProductRowActions({ id, published, featured }: { id: string; published: boolean; featured: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function patch(p: Record<string, unknown>) {
    setBusy(true);
    await fetch("/api/admin/crud/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, patch: p }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex justify-end gap-1">
      <button
        title={published ? "Unpublish" : "Publish"}
        disabled={busy}
        onClick={() => patch({ published: !published })}
        className="p-2 hover:bg-black/5"
      >
        {published ? <Eye size={15} /> : <EyeOff size={15} />}
      </button>
      <button
        title={featured ? "Unfeature" : "Feature"}
        disabled={busy}
        onClick={() => patch({ featured: !featured })}
        className={`p-2 hover:bg-black/5 ${featured ? "text-[#B79A61]" : ""}`}
      >
        <Star size={15} className={featured ? "fill-[#B79A61]" : ""} />
      </button>
      <a href={`/admin/products/${id}`} className="px-3 py-1.5 text-xs border border-black/15 hover:border-[#B79A61] hover:text-[#8a6d3b] transition-colors ml-1">
        Edit
      </a>
    </div>
  );
}
