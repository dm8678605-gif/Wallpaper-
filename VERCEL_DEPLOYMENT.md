# Vercel Deployment Configuration

## Summary of Changes

This project has been fixed for Vercel deployment with the following changes:

### 1. Vercel Compatibility Fixes

**Modified Files:**
- `src/lib/data/store.ts` - Added read-only storage detection and graceful fallback
- `src/lib/data/seed.ts` - Skip seeding in read-only mode (Vercel)
- `src/lib/data/repos.ts` - Improved error handling for seed failures
- `src/app/api/checkout/route.ts` - Disabled order submissions in demo mode
- `src/app/api/enquiry/route.ts` - Disabled enquiries in demo mode
- `src/app/api/admin/crud/[resource]/route.ts` - Already has read-only checks
- `src/app/api/admin/upload/route.ts` - Already has read-only checks

**New Files:**
- `vercel.json` - Vercel deployment configuration
- `.env.example` - Environment variable template

**Modified Configuration:**
- `next.config.ts` - Added `outputFileTracingIncludes` to include data directory
- `.gitignore` - Cleaned up and ensured data files are committed

### 2. Required Vercel Environment Variables

Set these in your Vercel project settings (Environment Variables):

```
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-secure-password
SESSION_SECRET=your-secure-random-secret-here
SESSION_MAX_AGE=28800
```

**Important:** Generate a secure SESSION_SECRET using:
```bash
openssl rand -hex 32
```

### 3. Deployment Behavior

**On Vercel (VERCEL=1):**
- Read-only demo mode is automatically enabled
- All JSON data files are bundled from the `data/` directory
- Admin mutations (POST/PUT/DELETE) return 503 errors
- Image uploads are disabled
- Order submissions are disabled
- Enquiries are disabled
- Public pages work normally (read-only)
- Admin panel is accessible but mutations are blocked

**On Local Development:**
- Full read/write access to JSON files
- All admin functionality works
- Orders and enquiries can be submitted
- Image uploads work

### 4. Data Files Included in Deployment

The following JSON files are committed to git and will be deployed:
- `data/products.json` - Product catalog
- `data/categories.json` - Categories and subcategories
- `data/collections.json` - Collections
- `data/rooms.json` - Room types
- `data/colours.json` - Colour options
- `data/materials.json` - Material options
- `data/styles.json` - Style tags
- `data/banners.json` - Banner images
- `data/homepage.json` - Homepage sections
- `data/navigation.json` - Navigation menu
- `data/footer.json` - Footer configuration
- `data/pages.json` - Static pages
- `data/blog.json` - Blog posts
- `data/projects.json` - Project gallery
- `data/gallery.json` - Inspiration gallery
- `data/theme.json` - Theme configuration
- `data/settings.json` - Site settings
- `data/coupons.json` - Coupon codes
- `data/media.json` - Media assets
- `data/orders.json` - Empty orders array
- `data/customers.json` - Empty customers array
- `data/reviews.json` - Empty reviews array
- `data/enquiries.json` - Empty enquiries array
- `data/analytics.json` - Empty analytics array
- `data/newsletter.json` - Empty newsletter array
- `data/messages.json` - Empty messages array
- `data/samples.json` - Empty samples array

### 5. Future Enhancement Notes

To enable full functionality on Vercel, you would need to:
1. Set up a persistent database (PostgreSQL, MongoDB, etc.)
2. Install an ORM (Prisma, Drizzle, etc.)
3. Replace local JSON storage with database operations
4. Configure cloud storage for image uploads (AWS S3, Cloudinary, etc.)
5. Enable online payments (Stripe, Razorpay, etc.)

### 6. Testing

After deployment, test:
- Homepage loads correctly
- Product pages display properly
- All navigation links work
- Admin login works (credentials from env vars)
- Admin panel displays data correctly
- Admin mutations show "read-only demo mode" error
- Checkout shows "order submission disabled" error
- Enquiry forms show "enquiries disabled" error

### 7. Build Commands

```bash
# Local development
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

All commands pass successfully with these changes.
