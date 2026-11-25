import { uid, now, isSeeded, writeJson, ensureDataDir, isReadOnlyStorage } from "./store";
import type {
  Banner,
  BlogPost,
  Category,
  Collection,
  Colour,
  Coupon,
  FooterConfig,
  GalleryItem,
  HomepageSection,
  Material,
  NavigationItem,
  Page,
  Product,
  Project,
  Room,
  Settings,
  StyleTag,
  ThemeConfig,
} from "./types";

/**
 * Seed generator. Creates the full demo catalogue on first run.
 * All prices/content are SAMPLE data for demonstration only.
 * Images use https://picsum.photos (licensed placeholder photography).
 */

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const img = (seed: string, w = 900, h = 1200) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;
const wide = (seed: string, w = 1600, h = 900) => img(seed, w, h);

const NOW = now();
const ts = () => ({ createdAt: NOW, updatedAt: NOW });

// ---------------- Styles (35+) ----------------
const STYLE_NAMES = [
  "Floral", "Botanical", "Geometric", "Abstract", "Art Deco", "Damask",
  "Vintage", "Retro", "Mid-Century", "Scandinavian", "Minimalist", "Maximalist",
  "Tropical", "Safari", "Coastal", "Nautical", "Rustic", "Farmhouse",
  "Industrial", "Urban", "Contemporary", "Traditional", "Classic", "Baroque",
  "Japanese", "Chinese", "Moroccan", "Bohemian", "Wabi-Sabi", "Glamorous",
  "Luxury", "Ceramic", "Textile", "Mural", "Kids & Playful", "Religious & Spiritual",
];

// ---------------- Categories (parents) ----------------
const CATEGORY_DEFS: { name: string; desc: string; subs: string[] }[] = [
  { name: "Floral Wallpapers", desc: "Lush blooms, hand-painted florals and botanical prints.", subs: ["Hand-Painted Florals", "Botanical Prints", "Watercolour Florals", "Dark Florals"] },
  { name: "Geometric Wallpapers", desc: "Precision patterns — grids, tessellations and lines.", subs: ["Grid Patterns", "Tessellations", "Linear Geometrics", "3D Geometrics"] },
  { name: "Textured Wallpapers", desc: "Grasscloth, silk, linen and tactile finishes.", subs: ["Grasscloth", "Silk & Satin", "Linen & Fabric", "Venetian Plaster"] },
  { name: "Abstract Wallpapers", desc: "Modern art-inspired colour fields and shapes.", subs: ["Colour Fields", "Expressionist", "Minimalist Art", "Mixed Media"] },
  { name: "Damask & Classic", desc: "Timeless damasks, toiles and heritage patterns.", subs: ["Damask", "Toile de Jouy", "Heritage Florals", "Medallion"] },
  { name: "Children's Wallpapers", desc: "Playful, safe and delightful designs for young rooms.", subs: ["Animals", "Space & Planets", "Jungle & Forest", "Fairy Tales"] },
  { name: "Nature Wallpapers", desc: "Landscapes, forests, skies and organic textures.", subs: ["Landscapes", "Forest & Jungle", "Sky & Clouds", "Stone & Marble"] },
  { name: "Metallic & Luxe", desc: "Gold, silver and pearlescent luxury finishes.", subs: ["Gold Foil", "Silver & Platinum", "Pearlescent", "Copper & Bronze"] },
  { name: "Murals & Wall Art", desc: "Large-scale murals and photographic wall art.", subs: ["Panoramic Murals", "Illustrated Murals", "Photographic Murals", "Map Murals"] },
  { name: "Striped & Linear", desc: "Stripes, pinstripes and rhythmic linear patterns.", subs: ["Pinstripes", "Bold Stripes", "Diagonal Lines", "Chevron"] },
  { name: "Art Deco & Vintage", desc: "Gatsby-era glamour and nostalgic charm.", subs: ["Art Deco", "Mid-Century", "Victorian", "Retro 70s"] },
  { name: "Religious & Spiritual", desc: "Sacred motifs, mandalas and devotional designs.", subs: ["Mandala", "Sacred Geometry", "Devotional", "Spiritual Quotes"] },
];

// ---------------- Rooms (15+) ----------------
const ROOM_NAMES = [
  "Living Room", "Bedroom", "Master Bedroom", "Kids Room", "Nursery", "Dining Room",
  "Kitchen", "Bathroom", "Home Office", "Study Room", "Corridor & Hallway",
  "Balcony & Terrace", "Puja Room", "Hotel Lobby", "Restaurant & Café",
  "Boutique & Retail", "Clinic & Spa", "Cinema Room",
];

// ---------------- Colours (15+) ----------------
const COLOUR_DEFS: { name: string; hex: string }[] = [
  { name: "Ivory & Cream", hex: "#F8F5EE" },
  { name: "Champagne Beige", hex: "#DDD0BE" },
  { name: "Luxury Gold", hex: "#B79A61" },
  { name: "Olive Green", hex: "#555E47" },
  { name: "Espresso Brown", hex: "#30251F" },
  { name: "Blush Pink", hex: "#E8C4C4" },
  { name: "Sage Green", hex: "#9CAF88" },
  { name: "Navy Blue", hex: "#1F2A44" },
  { name: "Teal & Turquoise", hex: "#2E6E6A" },
  { name: "Terracotta", hex: "#C06B4A" },
  { name: "Charcoal Grey", hex: "#3A3A3A" },
  { name: "Burgundy & Maroon", hex: "#6B1F2A" },
  { name: "Mustard Yellow", hex: "#D9A441" },
  { name: "Lavender", hex: "#B8A9C9" },
  { name: "White & Off-White", hex: "#FFFFFF" },
  { name: "Emerald Green", hex: "#1E5B45" },
  { name: "Copper & Rose Gold", hex: "#B87333" },
];

// ---------------- Materials (10+) ----------------
const MATERIAL_DEFS: { name: string; desc: string; price: number }[] = [
  { name: "Non-Woven Cellulose", desc: "Breathable, eco-friendly and easy to install.", price: 55 },
  { name: "Vinyl (PVC)", desc: "Water-resistant, wipe-clean and durable.", price: 75 },
  { name: "Grasscloth", desc: "Natural fibres with rich organic texture.", price: 140 },
  { name: "Silk Effect", desc: "Lustrous sheen resembling real silk.", price: 120 },
  { name: "Linen & Fabric", desc: "Soft textile look with a matte finish.", price: 110 },
  { name: "Foil Metallic", desc: "Metallic accents and reflective surfaces.", price: 165 },
  { name: "Mica & Mineral", desc: "Natural stone-effect with subtle shimmer.", price: 150 },
  { name: "Acoustic Felt", desc: "Sound-absorbing panels for quiet luxury.", price: 185 },
  { name: "Bamboo & Jute", desc: "Sustainable natural textures.", price: 95 },
  { name: "3D Sculpted", desc: "Dimensional raised patterns.", price: 175 },
];

// ---------------- Collections (14) ----------------
const COLLECTION_DEFS = [
  "Regal Heritage", "Modern Abode", "Botanical Bliss", "Art Deco Dreams",
  "Coastal Serenity", "Jungle Safari", "Royal Damask", "Minimal Muse",
  "Kids Wonder", "Sacred Spaces", "Metallic Luxe", "Vintage Charm",
  "Nordic Calm", "Grand Hotels",
];

// ---------------- Pages ----------------
const PAGE_DEFS: { title: string; slug: string; content: string }[] = [
  { title: "About Us", slug: "about", content: "## Our Story\n\nWelcome to our luxury wallpaper house. We curate wallpaper collections that transform interiors into personal statements of style.\n\n### What We Do\n- Premium wallpaper design and supply\n- Bespoke custom murals and designs\n- Professional installation guidance\n- Sample-first service so you choose with confidence\n\n*This is sample content for demonstration.*" },
  { title: "Shipping & Delivery", slug: "shipping", content: "## Shipping Policy\n\nOrders are typically dispatched within 3–5 business days. Delivery estimates are shown at checkout.\n\n### Delivery Charges\n- Free shipping on orders above the configured threshold\n- Flat rate shipping otherwise\n\n*Sample content — replace with your real policy.*" },
  { title: "Returns & Refunds", slug: "returns", content: "## Returns Policy\n\nUnopened rolls can be returned within 7 days of delivery. Custom-cut and made-to-order items are non-returnable.\n\n*Sample content — replace with your real policy.*" },
  { title: "Privacy Policy", slug: "privacy", content: "## Privacy Policy\n\nWe collect only the information needed to process your orders and enquiries. We never sell your data.\n\n*Sample content — replace with your real policy.*" },
  { title: "Terms of Service", slug: "terms", content: "## Terms of Service\n\nBy using this website you agree to our terms of sale, pricing and delivery conditions.\n\n*Sample content — replace with your real terms.*" },
  { title: "FAQs", slug: "faqs", content: "## Frequently Asked Questions\n\n**How do I measure my wall?** Measure width and height in feet; our calculator handles the rest.\n\n**Can I order samples?** Yes — every product offers a sample option.\n\n**Do you install?** We provide installation guidance; certified installers can be arranged on request.\n\n*Sample content.*" },
];

// ---------------- Blog ----------------
const BLOG_DEFS = [
  { title: "How to Choose the Perfect Wallpaper for Your Living Room", excerpt: "A designer's guide to scale, colour and pattern for the heart of your home.", tags: ["Design Tips", "Living Room"] },
  { title: "Wallpaper vs Paint: When to Choose Which", excerpt: "Cost, durability and drama — an honest comparison.", tags: ["Buying Guide"] },
  { title: "The Rise of Textured Wallpapers in Modern Interiors", excerpt: "Grasscloth, linen and plaster finishes are leading the luxury trend.", tags: ["Trends"] },
  { title: "How to Measure Your Walls for Wallpaper", excerpt: "Avoid costly mistakes with our step-by-step measuring guide.", tags: ["How-To"] },
  { title: "Statement Walls: Bold Patterns That Work", excerpt: "From damask to murals — creating focal points that wow.", tags: ["Design Tips"] },
  { title: "Eco-Friendly Wallpaper Options", excerpt: "Sustainable materials without compromising on luxury.", tags: ["Sustainability"] },
];

// ---------------- Helper ----------------
function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function seedIfNeeded(): Promise<void> {
  // On Vercel/demo mode, skip seeding entirely — rely on bundled JSON files
  if (isReadOnlyStorage()) {
    console.log("Demo mode: skipping data seeding (expecting bundled JSON files)");
    return;
  }
  await ensureDataDir();
  if (await isSeeded()) return;

  // ---- Taxonomy ----
  const styles: StyleTag[] = STYLE_NAMES.map((name, i) => ({
    id: `sty_${i + 1}`, name, slug: slugify(name), description: `${name} style wallpapers.`,
    image: img(`style-${i}`), order: i, published: true, ...ts(),
  }));

  const categories: Category[] = [];
  const subcategories: Category[] = [];
  CATEGORY_DEFS.forEach((c, i) => {
    const cat: Category = {
      id: `cat_${i + 1}`, name: c.name, slug: slugify(c.name), description: c.desc,
      image: img(`cat-${i}`), bannerImage: wide(`catb-${i}`), parentId: null,
      order: i, published: true, seo: { title: `${c.name} | Luxury Wallpaper` }, ...ts(),
    };
    categories.push(cat);
    c.subs.forEach((s, j) => {
      subcategories.push({
        id: `cat_${i + 1}_${j + 1}`, name: s, slug: `${slugify(c.name)}-${slugify(s)}`,
        description: `${s} within ${c.name}.`, image: img(`sub-${i}-${j}`),
        bannerImage: wide(`subb-${i}-${j}`), parentId: cat.id, order: j,
        published: true, seo: { title: `${s} | ${c.name}` }, ...ts(),
      });
    });
  });
  const allCategories = [...categories, ...subcategories];

  const rooms: Room[] = ROOM_NAMES.map((name, i) => ({
    id: `room_${i + 1}`, name, slug: slugify(name), description: `Wallpaper ideas for the ${name.toLowerCase()}.`,
    image: img(`room-${i}`), order: i, published: true, ...ts(),
  }));

  const colours: Colour[] = COLOUR_DEFS.map((c, i) => ({
    id: `col_${i + 1}`, name: c.name, slug: slugify(c.name), hex: c.hex,
    image: img(`col-${i}`), order: i, published: true, ...ts(),
  }));

  const materials: Material[] = MATERIAL_DEFS.map((m, i) => ({
    id: `mat_${i + 1}`, name: m.name, slug: slugify(m.name), description: m.desc,
    pricePerSqft: m.price, image: img(`mat-${i}`), order: i, published: true, ...ts(),
  }));

  // ---- Collections ----
  const collections: Collection[] = COLLECTION_DEFS.map((name, i) => ({
    id: `col_${i + 1}`, name, slug: slugify(name), description: `${name} — a curated edit of luxury wallpaper designs.`,
    image: img(`collection-${i}`), bannerImage: wide(`colb-${i}`), productIds: [],
    order: i, published: true, seo: { title: `${name} Collection` }, ...ts(),
  }));

  // ---- Products (120) ----
  const products: Product[] = [];
  const rand = mulberry32(42);
  const PRODUCT_NAMES = [
    "Majestic Bloom", "Golden Hour", "Botanical Study", "Artisan Weave", "Regal Damask",
    "Nordic Line", "Safari Sunset", "Velvet Petal", "Monochrome Muse", "Terra Cotta",
    "Imperial Scroll", "Sage Whisper", "Crown motif", "Marble Vein", "Sunrise Stripe",
    "Jungle Fern", "Pearl Essence", "Desert Dune", "Royal Crest", "Ocean Drift",
    "Lavender Field", "Copper Glow", "Forest Path", "Ivory Lattice", "Onyx Pattern",
    "Blush Garden", "Midnight Geo", "Golden Vine", "Stone Symphony", "Aria Floral",
  ];
  const TOTAL = 120;
  for (let i = 0; i < TOTAL; i++) {
    const cat = categories[Math.floor(rand() * categories.length)];
    const subs = subcategories.filter((s) => s.parentId === cat.id);
    const sub = subs.length ? subs[Math.floor(rand() * subs.length)] : null;
    const matCount = 1 + Math.floor(rand() * 3);
    const matIds = [...materials].sort(() => rand() - 0.5).slice(0, matCount).map((m) => m.id);
    const basePrice = 45 + Math.floor(rand() * 140);
    const materialPricing: Record<string, number> = {};
    materials.forEach((m) => {
      materialPricing[m.id] = Math.round(basePrice * (0.7 + rand() * 0.9));
    });
    const colCount = 1 + Math.floor(rand() * 3);
    const colourIds = [...colours].sort(() => rand() - 0.5).slice(0, colCount).map((c) => c.id);
    const roomCount = 1 + Math.floor(rand() * 4);
    const roomIds = [...rooms].sort(() => rand() - 0.5).slice(0, roomCount).map((r) => r.id);
    const styleIds = [...styles].sort(() => rand() - 0.5).slice(0, 2).map((s) => s.id);
    const collectionIds = collections
      .filter((_, ci) => (i + ci) % 7 === 0 || rand() < 0.12)
      .slice(0, 2)
      .map((c) => c.id);
    const name = `${PRODUCT_NAMES[i % PRODUCT_NAMES.length]} ${String.fromCharCode(65 + (i % 26))}${i > 25 ? Math.floor(i / 26) : ""}`;
    const original = basePrice * (1.15 + rand() * 0.4);
    const images = [0, 1, 2, 3].map((n) => ({
      id: uid("img"), url: img(`prod-${i}-${n}`, 900, 1200), alt: `${name} view ${n + 1}`, primary: n === 0,
    }));
    products.push({
      id: `prod_${String(i + 1).padStart(4, "0")}`,
      name, slug: slugify(name), code: `WP-${String(i + 1).padStart(4, "0")}`,
      sku: `SKU-${1000 + i}`, description: `${name} is a ${cat.name.toLowerCase().replace(/s$/, "")} design from our luxury collection. Crafted finish, premium print quality and a palette curated for elegant interiors.`,
      shortDescription: `Elegant ${cat.name.toLowerCase()} wallpaper.`,
      categoryId: cat.id, subcategoryId: sub?.id ?? null, collectionIds, roomIds, colourIds,
      materialIds: matIds, styleIds, pricePerSqft: basePrice,
      originalPricePerSqft: Math.round(original), samplePrice: 199 + Math.floor(rand() * 300),
      materialPricing, minOrderAreaSqft: 30 + Math.floor(rand() * 60),
      wastagePercent: 8 + Math.floor(rand() * 10),
      installationChargePerSqft: 12 + Math.floor(rand() * 20),
      specs: [
        { label: "Material", value: materials.find((m) => m.id === matIds[0])?.name ?? "Non-Woven" },
        { label: "Roll Size", value: "2.05 ft × 33 ft" },
        { label: "Finish", value: "Matte / Texture" },
        { label: "Care", value: "Wipe clean with damp cloth" },
      ],
      installationInstructions: "Clean the wall, apply wallpaper adhesive, align the first drop and smooth with a brush. Butt-join subsequent drops.",
      stockStatus: rand() < 0.8 ? "in-stock" : "made-to-order",
      featured: i < 12 || rand() < 0.08, published: true, sample: true,
      images, rating: Math.round((3.8 + rand() * 1.2) * 10) / 10,
      reviewCount: Math.floor(rand() * 40),
      seo: { title: `${name} Wallpaper | Buy Online`, description: `${name} luxury wallpaper.` },
      ...ts(),
    });
  }

  // attach products to collections
  collections.forEach((c, ci) => {
    c.productIds = products.filter((p) => p.collectionIds.includes(c.id)).map((p) => p.id);
    if (!c.productIds.length) c.productIds = products.slice(ci * 8, ci * 8 + 8).map((p) => p.id);
  });

  // ---- Banners ----
  const banners: Banner[] = [
    { id: "ban_1", title: "Walls That Tell Your Story", subtitle: "Luxury wallpaper collections curated for the extraordinary home.", image: wide("hero-1"), link: "/collections", linkLabel: "Explore Collections", placement: "hero", order: 0, published: true, active: true, ...ts() },
    { id: "ban_2", title: "Hand-Finished Florals", subtitle: "Botanical artistry for living spaces.", image: wide("hero-2"), link: "/category/floral-wallpapers", linkLabel: "Shop Florals", placement: "hero", order: 1, published: true, active: true, ...ts() },
    { id: "ban_3", title: "Textured Elegance", subtitle: "Grasscloth, silk and linen finishes.", image: wide("hero-3"), link: "/category/textured-wallpapers", linkLabel: "Shop Textures", placement: "hero", order: 2, published: true, active: true, ...ts() },
    { id: "ban_4", title: "Design Your Own", subtitle: "Bespoke murals crafted to your vision.", image: wide("hero-4"), link: "/custom-design", linkLabel: "Start a Project", placement: "hero", order: 3, published: true, active: true, ...ts() },
    { id: "ban_5", title: "New Season: Metallic Luxe", subtitle: "Gold, pearl and shimmer.", image: wide("hero-5"), link: "/collection/metallic-luxe", linkLabel: "Discover", placement: "hero", order: 4, published: true, active: true, ...ts() },
    { id: "ban_6", title: "Spring Edit", subtitle: "Fresh florals and pastels.", image: wide("promo-1"), placement: "promo", order: 0, published: true, active: true, ...ts() },
  ];

  // ---- Homepage sections ----
  const homepage: { sections: HomepageSection[] } = {
    sections: [
      { id: "hs_1", type: "hero", title: "Walls That Tell Your Story", subtitle: "Luxury wallpaper collections curated for the extraordinary home.", layout: "carousel", visible: true, order: 0 },
      { id: "hs_2", type: "categories", title: "Shop by Style", subtitle: "Browse our most-loved wallpaper styles", itemsSource: "categories", limit: 8, layout: "grid", visible: true, order: 1 },
      { id: "hs_3", type: "featured-products", title: "Featured Wallpapers", subtitle: "Handpicked designs our clients adore", itemsSource: "featured", limit: 8, layout: "carousel", visible: true, order: 2 },
      { id: "hs_4", type: "collections", title: "Curated Collections", subtitle: "Complete looks for every mood", itemsSource: "collections", limit: 6, layout: "grid", visible: true, order: 3 },
      { id: "hs_5", type: "editorial", title: "The Art of the Wall", content: "Wallpaper is the largest canvas in your home. Our designers believe every wall deserves intention — texture, colour and pattern woven into the story of your space.", image: wide("editorial-1"), link: "/about", linkLabel: "Our Story", layout: "split", background: "ivory", visible: true, order: 4 },
      { id: "hs_6", type: "rooms", title: "Shop by Room", itemsSource: "rooms", limit: 8, layout: "grid", visible: true, order: 5 },
      { id: "hs_7", type: "colours", title: "Shop by Colour", itemsSource: "colours", limit: 10, layout: "grid", visible: true, order: 6 },
      { id: "hs_8", type: "banner", title: "Need a Custom Design?", content: "Our studio creates bespoke murals and custom wallpaper designs tailored to your space.", link: "/custom-design", linkLabel: "Enquire Now", image: wide("cta-1"), layout: "editorial", background: "espresso", visible: true, order: 7 },
      { id: "hs_9", type: "inspiration", title: "Inspiration Gallery", itemsSource: "gallery", limit: 6, layout: "grid", visible: true, order: 8 },
    ],
  };

  // ---- Navigation & Footer ----
  const navigation: { items: NavigationItem[] } = {
    items: [
      { id: "nav_1", label: "Home", href: "/", order: 0, visible: true },
      { id: "nav_2", label: "Shop", href: "/shop", order: 1, visible: true, children: [
        { id: "nav_2a", label: "All Wallpapers", href: "/shop", order: 0, visible: true },
        { id: "nav_2b", label: "Collections", href: "/collections", order: 1, visible: true },
        { id: "nav_2c", label: "Shop by Style", href: "/styles", order: 2, visible: true },
        { id: "nav_2d", label: "Shop by Room", href: "/rooms", order: 3, visible: true },
        { id: "nav_2e", label: "Shop by Colour", href: "/colours", order: 4, visible: true },
        { id: "nav_2f", label: "Shop by Material", href: "/materials", order: 5, visible: true },
      ]},
      { id: "nav_3", label: "Calculator", href: "/calculator", order: 2, visible: true },
      { id: "nav_4", label: "Samples", href: "/samples", order: 3, visible: true },
      { id: "nav_5", label: "Custom Design", href: "/custom-design", order: 4, visible: true },
      { id: "nav_6", label: "Inspiration", href: "/inspiration", order: 5, visible: true },
      { id: "nav_7", label: "Journal", href: "/blog", order: 6, visible: true },
      { id: "nav_8", label: "About", href: "/about", order: 7, visible: true },
      { id: "nav_9", label: "Contact", href: "/contact", order: 8, visible: true },
    ],
  };

  const footer: FooterConfig = {
    columns: [
      { title: "Shop", links: [
        { label: "All Wallpapers", href: "/shop" }, { label: "Collections", href: "/collections" },
        { label: "Shop by Room", href: "/rooms" }, { label: "Shop by Colour", href: "/colours" },
      ]},
      { title: "Services", links: [
        { label: "Wallpaper Calculator", href: "/calculator" }, { label: "Samples", href: "/samples" },
        { label: "Custom Design", href: "/custom-design" }, { label: "Installation", href: "/installation" },
      ]},
      { title: "Company", links: [
        { label: "About Us", href: "/about" }, { label: "Our Projects", href: "/projects" },
        { label: "Before & After", href: "/before-after" }, { label: "Journal", href: "/blog" },
        { label: "Contact", href: "/contact" },
      ]},
      { title: "Legal", links: [
        { label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Service", href: "/terms" },
        { label: "Shipping", href: "/shipping" }, { label: "Returns", href: "/returns" },
      ]},
    ],
    aboutText: "Curated luxury wallpaper collections for the extraordinary home.",
    showNewsletter: true,
    showSocial: true,
  };

  // ---- Pages ----
  const pages: Page[] = PAGE_DEFS.map((p, i) => ({
    id: `page_${i + 1}`, title: p.title, slug: p.slug, content: p.content,
    published: true, showInNav: i === 0, showInFooter: true,
    seo: { title: `${p.title} | Wallpaper House` }, ...ts(),
  }));

  // ---- Blog ----
  const blog: BlogPost[] = BLOG_DEFS.map((b, i) => ({
    id: `blog_${i + 1}`, title: b.title, slug: slugify(b.title), excerpt: b.excerpt,
    content: `## ${b.title}\n\n${b.excerpt}\n\nWallpaper transforms a room the way the right jewellery transforms an outfit. In this journal entry we explore what makes ${b.tags[0]?.toLowerCase() ?? "great"} wallpaper work in real interiors.\n\n### Key Takeaways\n- Choose scale according to room size\n- Let texture do the talking in neutral schemes\n- Always order samples before committing\n\n*Sample blog content for demonstration.*`,
    image: img(`blog-${i}`), author: "Design Team", tags: b.tags,
    published: true, publishedAt: new Date(Date.now() - i * 86400000 * 9).toISOString(),
    seo: { title: b.title }, ...ts(),
  }));

  // ---- Projects / Gallery / Before-After ----
  const projects: Project[] = Array.from({ length: 12 }, (_, i) => ({
    id: `proj_${i + 1}`, title: `Residence ${i + 1} — ${CATEGORY_DEFS[i % CATEGORY_DEFS.length].name}`,
    client: `Client ${String.fromCharCode(65 + (i % 26))}`, location: ["Mumbai", "Delhi", "Bengaluru", "Goa", "Pune", "Jaipur"][i % 6],
    description: `A luxury residential project featuring ${CATEGORY_DEFS[i % CATEGORY_DEFS.length].name.toLowerCase()} throughout the principal rooms.`,
    images: [img(`proj-${i}-0`, 1200, 800), img(`proj-${i}-1`, 1200, 800)],
    categoryId: categories[i % categories.length].id, featured: i < 4, published: true, sample: true, ...ts(),
  }));
  const beforeAfter = projects.slice(0, 8).map((p, i) => ({
    ...p, id: `ba_${i + 1}`, beforeImage: wide(`before-${i}`), afterImage: wide(`after-${i}`),
  }));

  const gallery: GalleryItem[] = Array.from({ length: 18 }, (_, i) => ({
    id: `gal_${i + 1}`, title: `Inspiration ${i + 1}`,
    image: img(`gal-${i}`, 800, 1000), category: CATEGORY_DEFS[i % CATEGORY_DEFS.length].name,
    roomId: rooms[i % rooms.length].id, published: true, ...ts(),
  }));

  // ---- Commerce ----
  const coupons: Coupon[] = [
    { id: "cpn_1", code: "WELCOME10", type: "percent", value: 10, minOrderValue: 5000, active: true, usedCount: 0, ...ts() },
    { id: "cpn_2", code: "LUXE15", type: "percent", value: 15, minOrderValue: 15000, active: true, usedCount: 0, ...ts() },
    { id: "cpn_3", code: "FLAT500", type: "flat", value: 500, minOrderValue: 20000, active: true, usedCount: 0, ...ts() },
  ];

  // ---- Config ----
  const theme: ThemeConfig = {
    siteName: "Aurelia Walls",
    tagline: "Luxury Wallpaper House",
    colors: {
      primary: "#B79A61", secondary: "#555E47", accent: "#DDD0BE",
      background: "#F8F5EE", surface: "#FFFFFF", text: "#30251F",
      headerBg: "#F8F5EE", footerBg: "#30251F", muted: "#8A7B6B",
    },
    fonts: { heading: "Playfair Display", body: "Inter" },
    radius: "sm", buttonStyle: "solid", animationLevel: "full",
  };

  const settings: Settings = {
    business: {
      name: "Aurelia Walls (Demo)", email: "hello@example.com", phone: "+91 00000 00000",
      whatsapp: "919000000000", address: "Sample Address, Demo City",
      city: "Mumbai", state: "Maharashtra", pincode: "400001", country: "India",
      gstin: "00AAAAA0000A1Z5", hours: "Mon–Sat, 10am–7pm",
    },
    currency: { code: "INR", symbol: "₹", position: "before" },
    shipping: { enabled: true, flatCharge: 499, freeAbove: 25000, estimatedDays: "5–9 business days" },
    tax: { enabled: true, percent: 18, label: "GST" },
    payments: { cod: { enabled: true }, online: { enabled: false }, whatsapp: { enabled: true } },
    calculator: { defaultWastagePercent: 10, defaultInstallationPerSqft: 15, rollWidthFt: 2.05, taxesEnabled: true },
    seo: { defaultTitle: "Aurelia Walls — Luxury Wallpaper", defaultDescription: "Curated luxury wallpaper collections for the extraordinary home." },
    announcement: "Complimentary shipping on orders above ₹25,000",
    demoMode: true,
  };

  const media = [
    { id: "med_1", filename: "hero-1.jpg", url: wide("hero-1"), mimeType: "image/jpeg", size: 0, folder: "banners", ...ts() },
  ];

  // ---- Persist everything ----
  const writes: Promise<unknown>[] = [];
  if (!isReadOnlyStorage()) {
    writes.push(
      writeJson("styles", styles),
      writeJson("categories", allCategories),
      writeJson("rooms", rooms),
      writeJson("colours", colours),
      writeJson("materials", materials),
      writeJson("collections", collections),
      writeJson("products", products),
      writeJson("banners", banners),
      writeJson("homepage", homepage),
      writeJson("navigation", navigation),
      writeJson("footer", footer),
      writeJson("pages", pages),
      writeJson("blog", blog),
      writeJson("projects", [...projects, ...beforeAfter]),
      writeJson("gallery", gallery),
      writeJson("coupons", coupons),
      writeJson("theme", theme),
      writeJson("settings", settings),
      writeJson("media", media),
      writeJson("orders", []), writeJson("customers", []), writeJson("reviews", []),
      writeJson("enquiries", []), writeJson("analytics", []),
      writeJson("newsletter", []), writeJson("messages", []), writeJson("samples", []),
    );
  }
  await Promise.all(writes);
}
