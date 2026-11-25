import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isReadOnlyStorage } from "@/lib/data/store";
import { createItem, updateItem, deleteItem } from "@/lib/data/repos";
import { mutateJson, readJson, uid, now } from "@/lib/data/store";
import type { DataFileKey } from "@/lib/data/types";
import {
  productsRepo, categoriesRepo, collectionsRepo, roomsRepo, coloursRepo,
  materialsRepo, stylesRepo, bannersRepo, pagesRepo, blogRepo, projectsRepo,
  galleryRepo, ordersRepo, customersRepo, reviewsRepo, couponsRepo,
  enquiriesRepo, samplesRepo, messagesRepo, newsletterRepo, mediaRepo,
} from "@/lib/data/repos";
import { revalidatePath } from "next/cache";

/**
 * Generic admin CRUD over the local JSON store.
 * GET    /api/admin/crud/<resource>            -> list (or doc for singletons)
 * POST   /api/admin/crud/<resource>            -> create item (body = item)
 * PUT    /api/admin/crud/<resource>            -> update (body = { id, patch }) or singleton { doc }
 * DELETE /api/admin/crud/<resource>?id=        -> delete item
 */

type Getter = () => Promise<unknown>;

const LIST_RESOURCES: Record<string, { key: DataFileKey; fallback: unknown[]; get: Getter }> = {
  products: { key: "products", fallback: [], get: productsRepo.all },
  categories: { key: "categories", fallback: [], get: categoriesRepo.all },
  collections: { key: "collections", fallback: [], get: collectionsRepo.all },
  rooms: { key: "rooms", fallback: [], get: roomsRepo.all },
  colours: { key: "colours", fallback: [], get: coloursRepo.all },
  materials: { key: "materials", fallback: [], get: materialsRepo.all },
  styles: { key: "styles", fallback: [], get: stylesRepo.all },
  banners: { key: "banners", fallback: [], get: bannersRepo.all },
  pages: { key: "pages", fallback: [], get: pagesRepo.all },
  blog: { key: "blog", fallback: [], get: blogRepo.all },
  projects: { key: "projects", fallback: [], get: projectsRepo.all },
  gallery: { key: "gallery", fallback: [], get: galleryRepo.all },
  orders: { key: "orders", fallback: [], get: ordersRepo.all },
  customers: { key: "customers", fallback: [], get: customersRepo.all },
  reviews: { key: "reviews", fallback: [], get: reviewsRepo.all },
  coupons: { key: "coupons", fallback: [], get: couponsRepo.all },
  enquiries: { key: "enquiries", fallback: [], get: enquiriesRepo.all },
  samples: { key: "samples", fallback: [], get: samplesRepo.all },
  messages: { key: "messages", fallback: [], get: messagesRepo.all },
  newsletter: { key: "newsletter", fallback: [], get: newsletterRepo.all },
  media: { key: "media", fallback: [], get: mediaRepo.all },
};

const DOC_RESOURCES: Record<string, { key: DataFileKey; fallback: unknown }> = {
  theme: { key: "theme", fallback: {} },
  settings: { key: "settings", fallback: {} },
  homepage: { key: "homepage", fallback: { sections: [] } },
  navigation: { key: "navigation", fallback: { items: [] } },
  footer: { key: "footer", fallback: { columns: [] } },
};

function revalidateAll() {
  revalidatePath("/", "layout");
}

async function guard() {
  try {
    await requireAdmin();
    return null;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ resource: string }> }) {
  const denied = await guard();
  if (denied) return denied;
  const { resource } = await ctx.params;
  const listRes = LIST_RESOURCES[resource];
  if (listRes) return NextResponse.json({ items: await listRes.get() });
  const docRes = DOC_RESOURCES[resource];
  if (docRes) return NextResponse.json(await readJson(docRes.key, docRes.fallback));
  return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ resource: string }> }) {
  const denied = await guard();
  if (denied) return denied;
  const { resource } = await ctx.params;
  const listRes = LIST_RESOURCES[resource];
  if (!listRes) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  if (isReadOnlyStorage()) return NextResponse.json({ error: "Read-only demo mode" }, { status: 503 });
  const body = await req.json();
  const item = body?.item ?? body;
  const created = await createItem(listRes.key, listRes.fallback, item);
  revalidateAll();
  return NextResponse.json({ item: created }, { status: 201 });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ resource: string }> }) {
  const denied = await guard();
  if (denied) return denied;
  const { resource } = await ctx.params;
  const body = await req.json();

  const docRes = DOC_RESOURCES[resource];
  if (docRes) {
    if (isReadOnlyStorage()) return NextResponse.json({ error: "Read-only demo mode" }, { status: 503 });
    const doc = body?.doc ?? body;
    await mutateJson(docRes.key, docRes.fallback, () => {
      if (doc && typeof doc === "object" && !Array.isArray(doc)) {
        return { ...(doc as object), updatedAt: now() } as never;
      }
      return doc as never;
    });
    revalidateAll();
    return NextResponse.json({ ok: true });
  }

  const listRes = LIST_RESOURCES[resource];
  if (!listRes) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  if (isReadOnlyStorage()) return NextResponse.json({ error: "Read-only demo mode" }, { status: 503 });
  const id = body?.id;
  const patch = body?.patch ?? body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const updated = await updateItem(listRes.key, listRes.fallback, id, patch);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  revalidateAll();
  return NextResponse.json({ item: updated });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ resource: string }> }) {
  const denied = await guard();
  if (denied) return denied;
  const { resource } = await ctx.params;
  const listRes = LIST_RESOURCES[resource];
  if (!listRes) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  if (isReadOnlyStorage()) return NextResponse.json({ error: "Read-only demo mode" }, { status: 503 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const ok = await deleteItem(listRes.key, listRes.fallback, id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  revalidateAll();
  return NextResponse.json({ ok: true });
}

// keep uid import used for future per-resource id schemes
void uid;
