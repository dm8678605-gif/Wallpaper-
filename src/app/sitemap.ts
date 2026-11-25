import type { MetadataRoute } from "next";
import { productsRepo, categoriesRepo, collectionsRepo, roomsRepo, coloursRepo, materialsRepo, stylesRepo, blogRepo, pagesRepo } from "@/lib/data/repos";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [products, cats, cols, rooms, colours, mats, styles, blog, pages] = await Promise.all([
    productsRepo.published(), categoriesRepo.published(), collectionsRepo.published(),
    roomsRepo.published(), coloursRepo.published(), materialsRepo.published(), stylesRepo.published(),
    blogRepo.published(), pagesRepo.published(),
  ]);
  const staticPaths = ["", "/shop", "/categories", "/collections", "/rooms", "/colours", "/materials", "/styles", "/calculator", "/samples", "/custom-design", "/inspiration", "/projects", "/before-after", "/blog", "/about", "/contact", "/reviews", "/installation", "/track-order", "/best-sellers", "/new-arrivals"];
  return [
    ...staticPaths.map((p) => ({ url: `${base}${p}`, lastModified: new Date() })),
    ...products.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: new Date(p.updatedAt) })),
    ...cats.map((c) => ({ url: `${base}/category/${c.slug}`, lastModified: new Date(c.updatedAt) })),
    ...cols.map((c) => ({ url: `${base}/collection/${c.slug}`, lastModified: new Date(c.updatedAt) })),
    ...rooms.map((r) => ({ url: `${base}/room/${r.slug}`, lastModified: new Date(r.updatedAt) })),
    ...colours.map((c) => ({ url: `${base}/colour/${c.slug}`, lastModified: new Date(c.updatedAt) })),
    ...mats.map((m) => ({ url: `${base}/material/${m.slug}`, lastModified: new Date(m.updatedAt) })),
    ...styles.map((s) => ({ url: `${base}/style/${s.slug}`, lastModified: new Date(s.updatedAt) })),
    ...blog.map((b) => ({ url: `${base}/blog/${b.slug}`, lastModified: new Date(b.updatedAt) })),
    ...pages.map((p) => ({ url: `${base}/page/${p.slug}`, lastModified: new Date(p.updatedAt) })),
  ];
}
