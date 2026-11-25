// Core entity types for the wallpaper platform.
// All data is persisted in local JSON files under /data (see src/lib/data/store.ts).

export type ID = string;

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface Seo {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

// ---------- Catalogue ----------

export interface Category extends Timestamps {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  bannerImage?: string;
  parentId?: ID | null; // subcategory -> category
  order: number;
  published: boolean;
  seo?: Seo;
}

export interface Collection extends Timestamps {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  bannerImage?: string;
  productIds: ID[];
  order: number;
  published: boolean;
  seo?: Seo;
}

export interface Room extends Timestamps {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order: number;
  published: boolean;
}

export interface Colour extends Timestamps {
  id: ID;
  name: string;
  slug: string;
  hex: string;
  description?: string;
  image?: string;
  order: number;
  published: boolean;
}

export interface Material extends Timestamps {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  pricePerSqft: number; // base multiplier / price for this material
  image?: string;
  order: number;
  published: boolean;
}

export interface StyleTag extends Timestamps {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order: number;
  published: boolean;
}

export interface ProductImage {
  id: ID;
  url: string;
  alt?: string;
  primary?: boolean;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product extends Timestamps {
  id: ID;
  name: string;
  slug: string;
  code: string; // e.g. WP-0001
  sku: string;
  description: string;
  shortDescription?: string;
  categoryId: ID;
  subcategoryId?: ID | null;
  collectionIds: ID[];
  roomIds: ID[];
  colourIds: ID[];
  materialIds: ID[];
  styleIds: ID[];
  pricePerSqft: number;
  originalPricePerSqft?: number;
  samplePrice?: number;
  materialPricing: Record<ID, number>; // materialId -> price per sqft override
  minOrderAreaSqft: number;
  wastagePercent: number;
  installationChargePerSqft: number;
  specs: ProductSpec[];
  installationInstructions?: string;
  stockStatus: "in-stock" | "low-stock" | "out-of-stock" | "made-to-order";
  featured: boolean;
  published: boolean;
  sample: boolean; // marks demo/sample product
  images: ProductImage[];
  videoUrl?: string;
  rating?: number;
  reviewCount?: number;
  seo?: Seo;
}

// ---------- Commerce ----------

export interface OrderItem {
  productId: ID;
  name: string;
  slug: string;
  image?: string;
  materialId?: ID;
  materialName?: string;
  widthFt: number;
  heightFt: number;
  walls: number;
  areaSqft: number;
  wastagePercent: number;
  quantity: number; // number of rolls / units
  unitPrice: number; // per sqft incl material
  installationPerSqft: number;
  lineTotal: number;
}

export interface Order extends Timestamps {
  id: ID; // e.g. ORD-2026-000123
  customerId?: ID;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  installationTotal: number;
  shippingCharge: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  paymentMethod: "cod" | "online" | "whatsapp";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  notes?: string;
}

export interface Customer extends Timestamps {
  id: ID;
  name: string;
  email: string;
  phone?: string;
  addresses: { label: string; address: string; city: string; state: string; pincode: string; country: string }[];
  orderCount: number;
  totalSpent: number;
  notes?: string;
}

export interface Review extends Timestamps {
  id: ID;
  productId: ID;
  authorName: string;
  authorLocation?: string;
  rating: number; // 1-5
  title?: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  verified?: boolean;
}

export interface WishlistItem {
  productId: ID;
  addedAt: string;
}

export interface CartItem {
  productId: ID;
  materialId?: ID;
  widthFt: number;
  heightFt: number;
  walls: number;
  quantity: number;
}

export interface Coupon extends Timestamps {
  id: ID;
  code: string;
  type: "percent" | "flat";
  value: number;
  minOrderValue?: number;
  active: boolean;
  expiresAt?: string;
  usageLimit?: number;
  usedCount: number;
}

export interface SampleOrder extends Timestamps {
  id: ID;
  name: string;
  email: string;
  phone: string;
  productIds: ID[];
  address: string;
  status: "pending" | "shipped" | "delivered" | "cancelled";
}

// ---------- Content ----------

export interface Banner extends Timestamps {
  id: ID;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  link?: string;
  linkLabel?: string;
  placement: "hero" | "category" | "collection" | "promo" | "homepage-section";
  order: number;
  published: boolean;
  active: boolean;
  // hero slider controls
  autoplay?: boolean;
  intervalSec?: number;
  transition?: "fade" | "slide";
  showArrows?: boolean;
  showDots?: boolean;
  textPosition?: "left" | "center" | "right";
  overlayOpacity?: number; // 0-100
}

export interface HomepageSection {
  id: ID;
  type:
    | "hero"
    | "featured-products"
    | "categories"
    | "collections"
    | "rooms"
    | "colours"
    | "materials"
    | "styles"
    | "banner"
    | "editorial"
    | "inspiration"
    | "testimonials"
    | "brands"
    | "custom-cta";
  title?: string;
  subtitle?: string;
  content?: string;
  image?: string;
  link?: string;
  linkLabel?: string;
  itemsSource?: string; // e.g. "featured", "category:slug", "collection:slug"
  limit?: number;
  layout?: "grid" | "carousel" | "editorial" | "split";
  background?: string; // css color or "ivory" | "espresso" | "gold" | "olive"
  visible: boolean;
  order: number;
}

export interface Page extends Timestamps {
  id: ID;
  title: string;
  slug: string;
  content: string; // markdown-ish / html-lite
  published: boolean;
  showInNav: boolean;
  showInFooter: boolean;
  seo?: Seo;
}

export interface BlogPost extends Timestamps {
  id: ID;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  author?: string;
  tags: string[];
  published: boolean;
  publishedAt?: string;
  seo?: Seo;
}

export interface Project extends Timestamps {
  id: ID;
  title: string;
  client?: string;
  location?: string;
  description?: string;
  images: string[];
  categoryId?: ID;
  collectionId?: ID;
  roomId?: ID;
  beforeImage?: string;
  afterImage?: string;
  featured: boolean;
  published: boolean;
  sample: boolean; // marks demo project
}

export interface GalleryItem extends Timestamps {
  id: ID;
  title: string;
  image: string;
  category?: string;
  roomId?: ID;
  collectionId?: ID;
  published: boolean;
}

export interface Enquiry extends Timestamps {
  id: ID;
  type: "custom-design" | "consultation" | "installation" | "general" | "sample";
  name: string;
  email: string;
  phone?: string;
  message?: string;
  details?: Record<string, string>;
  status: "new" | "contacted" | "closed";
}

export interface ContactMessage extends Timestamps {
  id: ID;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  read: boolean;
}

export interface NewsletterSubscriber extends Timestamps {
  id: ID;
  email: string;
  status: "active" | "unsubscribed";
}

export interface MediaAsset extends Timestamps {
  id: ID;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  alt?: string;
  folder?: string;
}

// ---------- Configuration ----------

export interface ThemeConfig {
  siteName: string;
  tagline?: string;
  logoUrl?: string;
  faviconUrl?: string;
  colors: {
    primary: string; // Luxury Gold
    secondary: string; // Olive Green
    accent: string;
    background: string; // Royal Ivory
    surface: string;
    text: string; // Espresso Brown
    headerBg: string;
    footerBg: string;
    muted: string;
  };
  fonts: {
    heading: string; // e.g. "Playfair Display"
    body: string; // e.g. "Inter"
  };
  radius: "none" | "sm" | "md" | "lg";
  buttonStyle: "solid" | "outline" | "pill";
  animationLevel: "full" | "reduced" | "none";
}

export interface NavigationItem {
  id: ID;
  label: string;
  href: string;
  children?: NavigationItem[];
  order: number;
  visible: boolean;
}

export interface FooterConfig {
  columns: { title: string; links: { label: string; href: string }[] }[];
  aboutText?: string;
  showNewsletter?: boolean;
  showSocial?: boolean;
}

export interface Settings {
  business: {
    name: string;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    gstin?: string;
    hours?: string;
  };
  currency: { code: string; symbol: string; position: "before" | "after" };
  shipping: {
    enabled: boolean;
    flatCharge: number;
    freeAbove: number;
    estimatedDays: string;
  };
  tax: { enabled: boolean; percent: number; label: string };
  payments: {
    cod: { enabled: boolean };
    online: { enabled: boolean; provider?: string };
    whatsapp: { enabled: boolean };
  };
  calculator: {
    defaultWastagePercent: number;
    defaultInstallationPerSqft: number;
    rollWidthFt: number;
    taxesEnabled: boolean;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    ogImage?: string;
  };
  announcement?: string;
  demoMode: boolean; // true = read-only demo notice on admin
}

// ---------- Analytics ----------

export interface AnalyticsEvent {
  id: ID;
  type: "pageview" | "product-view" | "add-to-cart" | "checkout" | "order" | "enquiry";
  path?: string;
  productId?: ID;
  meta?: Record<string, string>;
  createdAt: string;
}

// ---------- File registry ----------

export const DATA_FILES = {
  products: "products.json",
  categories: "categories.json",
  subcategories: "categories.json", // subcategories are categories with parentId
  collections: "collections.json",
  rooms: "rooms.json",
  colours: "colours.json",
  materials: "materials.json",
  styles: "styles.json",
  banners: "banners.json",
  homepage: "homepage.json",
  pages: "pages.json",
  theme: "theme.json",
  settings: "settings.json",
  navigation: "navigation.json",
  footer: "footer.json",
  orders: "orders.json",
  customers: "customers.json",
  reviews: "reviews.json",
  projects: "projects.json",
  blog: "blog.json",
  enquiries: "enquiries.json",
  consultations: "enquiries.json", // filtered by type
  coupons: "coupons.json",
  media: "media.json",
  analytics: "analytics.json",
  samples: "samples.json",
  gallery: "gallery.json",
  newsletter: "newsletter.json",
  messages: "messages.json",
} as const;

export type DataFileKey = keyof typeof DATA_FILES;
