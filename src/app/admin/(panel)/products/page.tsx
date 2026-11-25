import Link from "next/link";
import { Plus } from "lucide-react";
import { productsRepo, categoriesRepo, settingsRepo } from "@/lib/data/repos";
import { Price } from "@/components/store/Price";
import { ProductRowActions } from "@/components/admin/ProductRowActions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories, settings] = await Promise.all([
    productsRepo.all(), categoriesRepo.all(), settingsRepo.get(),
  ]);
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";
  void settings;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl">Wallpaper Products</h1>
          <p className="text-sm text-[#8A7B6B] mt-1">{products.length} products · sample catalogue data</p>
        </div>
        <Link href="/admin/products/new" className="btn-lux !bg-[#B79A61] !border-[#B79A61] !text-[#30251F]"><Plus size={15} /> Add Product</Link>
      </div>
      <div className="bg-white border border-black/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="border-b border-black/10 text-left">
              {["Image", "Name / Code", "Category", "Price / sq ft", "Stock", "Status", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-[0.65rem] tracking-[0.2em] uppercase text-[#8A7B6B] font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const img = p.images.find((i) => i.primary)?.url ?? p.images[0]?.url;
              return (
                <tr key={p.id} className="border-b border-black/5 hover:bg-black/[0.02]">
                  <td className="px-4 py-3 w-16">
                    {img && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={p.name} className="w-12 h-14 object-cover border border-black/10" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-[#B79A61] transition-colors">{p.name}</Link>
                    <p className="text-xs text-[#8A7B6B]">{p.code} · /product/{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-[#4a3f36]">{catName(p.categoryId)}</td>
                  <td className="px-4 py-3"><Price amount={p.pricePerSqft} />{p.originalPricePerSqft ? <span className="text-xs text-[#8A7B6B] line-through ml-2"><Price amount={p.originalPricePerSqft} /></span> : null}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 ${p.stockStatus === "out-of-stock" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{p.stockStatus.replace("-", " ")}</span></td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 ${p.published ? "bg-[#B79A61]/15 text-[#8a6d3b]" : "bg-black/5 text-[#8A7B6B]"}`}>{p.published ? "Published" : "Draft"}</span>
                    {p.featured && <span className="text-xs px-2 py-1 bg-black/5 ml-1">Featured</span>}
                  </td>
                  <td className="px-4 py-3 text-right"><ProductRowActions id={p.id} published={p.published} featured={p.featured} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
