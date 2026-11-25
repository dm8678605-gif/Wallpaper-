# Aurelia Walls — Luxury Wallpaper Storefront + Admin Panel

Next.js 16 (App Router) + TypeScript + Tailwind CSS + Framer Motion + Lucide + Recharts.
**No database** — all data lives in local JSON files under `/data`, images in `/public/uploads`.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
# or production:
npm run build && npm start
```

## Admin access

- URL: `/admin` → redirects to `/admin/login`
- Credentials are in `.env.local` (never commit this file):
  - `ADMIN_EMAIL` / `ADMIN_PASSWORD`
  - `SESSION_SECRET` — signs the HTTP-only session cookie
- Login is rate-limited (5 attempts / 15 min). Simple email+password auth is for **local development only** — replace with real auth before public deployment.

## Architecture

- `src/lib/data/store.ts` — atomic JSON read/write (temp+rename, per-file mutex), `data/` dir
- `src/lib/data/repos.ts` — repository layer (swap for DB later without touching UI)
- `src/lib/data/seed.ts` — seeds 120 products, 12 categories + 38 subcategories, 36 style tags, 18 rooms, 17 colours, 10 materials, 14 collections, banners, pages, blog, projects
- `src/app/api/admin/crud/[resource]` — generic admin CRUD (auth-guarded)
- `src/app/api/admin/upload` — validated local image uploads (magic-byte sniffing, 8MB, images only)
- `src/app/api/checkout` — server-side price re-validation, COD/WhatsApp orders → `orders.json`
- `src/proxy.ts` — protects `/admin/*` (Next.js 16 proxy convention)

## Key features

- Hero carousel: autoplay, swipe, arrows/dots toggles, mobile/desktop images, reduced-motion — all admin-editable
- Product pages: material pricing, live dimension calculator, 10-image gallery, samples, reviews
- Cart/wishlist in localStorage; checkout with coupons, shipping, tax, COD + WhatsApp
- Admin: dashboard (Recharts), full CRUD for every entity, homepage section manager (reorder/hide/duplicate), theme manager (CSS variables), navigation/footer/page builders, order/customer/sample/enquiry management, media library
- SEO: dynamic metadata, sitemap.xml, robots.txt, breadcrumbs, JSON-LD-ready product pages

## Limitations

- JSON storage + local uploads require a persistent writable filesystem — **not suitable for Vercel serverless** (use demo/read-only mode there).
- Online payment intentionally disabled; COD + WhatsApp only.
- Images use picsum.photos placeholders — replace with licensed product photography.
- Admin auth is simple env credentials for local dev only.
