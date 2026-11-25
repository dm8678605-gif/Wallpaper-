import { readJson, mutateJson, uid, now, isSeeded } from "./store";
import { seedIfNeeded } from "./seed";
import type {
  Banner,
  BlogPost,
  Category,
  Collection,
  Colour,
  ContactMessage,
  Coupon,
  Customer,
  Enquiry,
  FooterConfig,
  GalleryItem,
  HomepageSection,
  ID,
  Material,
  MediaAsset,
  NavigationItem,
  NewsletterSubscriber,
  Order,
  Page,
  Product,
  Project,
  Review,
  Room,
  SampleOrder,
  Settings,
  StyleTag,
  ThemeConfig,
} from "./types";

/** Ensures seed data exists (no-op after first run). Cached per process. */
let seeded: Promise<void> | null = null;
export function ensureSeeded(): Promise<void> {
  if (!seeded) seeded = seedIfNeeded().catch((e) => { seeded = null; throw e; });
  return seeded;
}

// ---------- Generic list helpers ----------
async function list<T>(key: Parameters<typeof readJson>[0], fallback: T[]): Promise<T[]> {
  await ensureSeeded();
  return readJson(key, fallback);
}

async function get<T extends { id: ID }>(key: Parameters<typeof readJson>[0], fallback: T[], id: ID): Promise<T | null> {
  const items = await list(key, fallback);
  return items.find((i) => i.id === id) ?? null;
}

async function getBySlug<T extends { slug: string }>(key: Parameters<typeof readJson>[0], fallback: T[], slug: string): Promise<T | null> {
  const items = await list(key, fallback);
  return items.find((i) => i.slug === slug) ?? null;
}

// ---------- Catalogue ----------
export const productsRepo = {
  all: () => list<Product>("products", []),
  published: async () => (await productsRepo.all()).filter((p) => p.published),
  get: (id: ID) => get<Product>("products", [], id),
  bySlug: (slug: string) => getBySlug<Product>("products", [], slug),
  featured: async (limit = 8) => (await productsRepo.published()).filter((p) => p.featured).slice(0, limit),
  byCategory: async (categoryId: ID) =>
    (await productsRepo.published()).filter((p) => p.categoryId === categoryId || p.subcategoryId === categoryId),
  filter: async (f: ProductFilter) => {
    let items = await productsRepo.published();
    if (f.q) {
      const q = f.q.toLowerCase();
      items = items.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
    }
    if (f.categoryId) items = items.filter((p) => p.categoryId === f.categoryId || p.subcategoryId === f.categoryId);
    if (f.collectionId) items = items.filter((p) => p.collectionIds.includes(f.collectionId!));
    if (f.roomId) items = items.filter((p) => p.roomIds.includes(f.roomId!));
    if (f.colourId) items = items.filter((p) => p.colourIds.includes(f.colourId!));
    if (f.materialId) items = items.filter((p) => p.materialIds.includes(f.materialId!));
    if (f.styleId) items = items.filter((p) => p.styleIds.includes(f.styleId!));
    if (f.minPrice != null) items = items.filter((p) => p.pricePerSqft >= f.minPrice!);
    if (f.maxPrice != null) items = items.filter((p) => p.pricePerSqft <= f.maxPrice!);
    if (f.sort === "price-asc") items = [...items].sort((a, b) => a.pricePerSqft - b.pricePerSqft);
    else if (f.sort === "price-desc") items = [...items].sort((a, b) => b.pricePerSqft - a.pricePerSqft);
    else if (f.sort === "name") items = [...items].sort((a, b) => a.name.localeCompare(b.name));
    else items = [...items].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return items;
  },
};

export interface ProductFilter {
  q?: string;
  categoryId?: ID;
  collectionId?: ID;
  roomId?: ID;
  colourId?: ID;
  materialId?: ID;
  styleId?: ID;
  minPrice?: number;
  maxPrice?: number;
  sort?: "featured" | "price-asc" | "price-desc" | "name";
}

export const categoriesRepo = {
  all: () => list<Category>("categories", []),
  roots: async () => (await categoriesRepo.all()).filter((c) => !c.parentId),
  children: async (parentId: ID) => (await categoriesRepo.all()).filter((c) => c.parentId === parentId),
  get: (id: ID) => get<Category>("categories", [], id),
  bySlug: (slug: string) => getBySlug<Category>("categories", [], slug),
  published: async () => (await categoriesRepo.all()).filter((c) => c.published),
};

export const collectionsRepo = {
  all: () => list<Collection>("collections", []),
  published: async () => (await collectionsRepo.all()).filter((c) => c.published),
  get: (id: ID) => get<Collection>("collections", [], id),
  bySlug: (slug: string) => getBySlug<Collection>("collections", [], slug),
};

export const roomsRepo = {
  all: () => list<Room>("rooms", []),
  published: async () => (await roomsRepo.all()).filter((r) => r.published),
  bySlug: (slug: string) => getBySlug<Room>("rooms", [], slug),
};

export const coloursRepo = {
  all: () => list<Colour>("colours", []),
  published: async () => (await coloursRepo.all()).filter((c) => c.published),
  bySlug: (slug: string) => getBySlug<Colour>("colours", [], slug),
};

export const materialsRepo = {
  all: () => list<Material>("materials", []),
  published: async () => (await materialsRepo.all()).filter((m) => m.published),
  get: (id: ID) => get<Material>("materials", [], id),
  bySlug: (slug: string) => getBySlug<Material>("materials", [], slug),
};

export const stylesRepo = {
  all: () => list<StyleTag>("styles", []),
  published: async () => (await stylesRepo.all()).filter((s) => s.published),
  bySlug: (slug: string) => getBySlug<StyleTag>("styles", [], slug),
};

// ---------- Content ----------
export const bannersRepo = {
  all: () => list<Banner>("banners", []),
  published: async (placement?: Banner["placement"]) =>
    (await bannersRepo.all()).filter((b) => b.published && b.active && (!placement || b.placement === placement)),
};

export const homepageRepo = {
  sections: async (): Promise<HomepageSection[]> => {
    await ensureSeeded();
    const data = await readJson<{ sections: HomepageSection[] }>("homepage", { sections: [] });
    return data.sections.sort((a, b) => a.order - b.order);
  },
};

export const pagesRepo = {
  all: () => list<Page>("pages", []),
  published: async () => (await pagesRepo.all()).filter((p) => p.published),
  bySlug: (slug: string) => getBySlug<Page>("pages", [], slug),
};

export const blogRepo = {
  all: () => list<BlogPost>("blog", []),
  published: async () =>
    (await blogRepo.all()).filter((b) => b.published).sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")),
  bySlug: (slug: string) => getBySlug<BlogPost>("blog", [], slug),
};

export const projectsRepo = {
  all: () => list<Project>("projects", []),
  published: async () => (await projectsRepo.all()).filter((p) => p.published),
  withBeforeAfter: async () => (await projectsRepo.published()).filter((p) => p.beforeImage && p.afterImage),
};

export const galleryRepo = {
  all: () => list<GalleryItem>("gallery", []),
  published: async () => (await galleryRepo.all()).filter((g) => g.published),
};

// ---------- Commerce ----------
export const ordersRepo = {
  all: () => list<Order>("orders", []),
  get: (id: ID) => get<Order>("orders", [], id),
};

export const customersRepo = {
  all: () => list<Customer>("customers", []),
  byEmail: async (email: string) =>
    (await customersRepo.all()).find((c) => c.email.toLowerCase() === email.toLowerCase()) ?? null,
};

export const reviewsRepo = {
  all: () => list<Review>("reviews", []),
  forProduct: async (productId: ID) =>
    (await reviewsRepo.all()).filter((r) => r.productId === productId && r.status === "approved"),
};

export const couponsRepo = {
  all: () => list<Coupon>("coupons", []),
  byCode: async (code: string) =>
    (await couponsRepo.all()).find((c) => c.code.toUpperCase() === code.toUpperCase() && c.active) ?? null,
};

export const samplesRepo = {
  all: () => list<SampleOrder>("samples", []),
};

export const enquiriesRepo = {
  all: () => list<Enquiry>("enquiries", []),
  ofType: async (type: Enquiry["type"]) => (await enquiriesRepo.all()).filter((e) => e.type === type),
};

export const messagesRepo = {
  all: () => list<ContactMessage>("messages", []),
};

export const newsletterRepo = {
  all: () => list<NewsletterSubscriber>("newsletter", []),
};

export const mediaRepo = {
  all: () => list<MediaAsset>("media", []),
};

// ---------- Config ----------
export const themeRepo = {
  get: async (): Promise<ThemeConfig> => {
    await ensureSeeded();
    return readJson<ThemeConfig>("theme", defaultTheme());
  },
};

export const settingsRepo = {
  get: async (): Promise<Settings> => {
    await ensureSeeded();
    return readJson<Settings>("settings", defaultSettings());
  },
};

export const navigationRepo = {
  items: async (): Promise<NavigationItem[]> => {
    await ensureSeeded();
    const data = await readJson<{ items: NavigationItem[] }>("navigation", { items: [] });
    return data.items.sort((a, b) => a.order - b.order);
  },
};

export const footerRepo = {
  get: async (): Promise<FooterConfig> => {
    await ensureSeeded();
    return readJson<FooterConfig>("footer", { columns: [] });
  },
};

// ---------- Mutations (admin) ----------

export async function createItem<T extends { id?: ID }>(key: Parameters<typeof mutateJson>[0], fallback: unknown[], item: Omit<T, "id"> & { id?: ID }): Promise<T> {
  await ensureSeeded();
  const withId = { ...item, id: item.id ?? uid(), createdAt: now(), updatedAt: now() } as unknown as T;
  await mutateJson(key, fallback as never[], (cur) => [...(cur as unknown[]), withId] as never);
  return withId;
}

export async function updateItem<T extends { id: ID }>(key: Parameters<typeof mutateJson>[0], fallback: unknown[], id: ID, patch: Partial<T>): Promise<T | null> {
  await ensureSeeded();
  let result: T | null = null;
  await mutateJson(key, fallback as never[], (cur) => {
    const arr = cur as unknown as T[];
    const idx = arr.findIndex((i) => i.id === id);
    if (idx === -1) return;
    arr[idx] = { ...arr[idx], ...patch, updatedAt: now() };
    result = arr[idx];
    return arr as never;
  });
  return result;
}

export async function deleteItem(key: Parameters<typeof mutateJson>[0], fallback: unknown[], id: ID): Promise<boolean> {
  await ensureSeeded();
  let deleted = false;
  await mutateJson(key, fallback as never[], (cur) => {
    const arr = cur as unknown as { id: ID }[];
    const next = arr.filter((i) => i.id !== id);
    deleted = next.length !== arr.length;
    return next as never;
  });
  return deleted;
}

// ---------- Defaults ----------
export function defaultTheme(): ThemeConfig {
  return {
    siteName: "Aurelia Walls",
    colors: {
      primary: "#B79A61", secondary: "#555E47", accent: "#DDD0BE",
      background: "#F8F5EE", surface: "#FFFFFF", text: "#30251F",
      headerBg: "#F8F5EE", footerBg: "#30251F", muted: "#8A7B6B",
    },
    fonts: { heading: "Playfair Display", body: "Inter" },
    radius: "sm", buttonStyle: "solid", animationLevel: "full",
  };
}

export function defaultSettings(): Settings {
  return {
    business: { name: "", email: "", phone: "", whatsapp: "", address: "", city: "", state: "", pincode: "", country: "India" },
    currency: { code: "INR", symbol: "₹", position: "before" },
    shipping: { enabled: true, flatCharge: 499, freeAbove: 25000, estimatedDays: "5–9 business days" },
    tax: { enabled: true, percent: 18, label: "GST" },
    payments: { cod: { enabled: true }, online: { enabled: false }, whatsapp: { enabled: true } },
    calculator: { defaultWastagePercent: 10, defaultInstallationPerSqft: 15, rollWidthFt: 2.05, taxesEnabled: true },
    seo: { defaultTitle: "", defaultDescription: "" },
    demoMode: true,
  };
}

export { isSeeded };
