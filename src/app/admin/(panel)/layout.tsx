import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { settingsRepo, themeRepo } from "@/lib/data/repos";
import { isReadOnlyStorage } from "@/lib/data/store";
import { AdminNav } from "@/components/admin/AdminNav";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

const NAV = [
  { section: "Overview", links: [
    { href: "/admin", label: "Dashboard" },
  ]},
  { section: "Catalogue", links: [
    { href: "/admin/products", label: "Wallpaper Products" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/subcategories", label: "Subcategories" },
    { href: "/admin/collections", label: "Collections" },
    { href: "/admin/rooms", label: "Room Manager" },
    { href: "/admin/colours", label: "Colour Manager" },
    { href: "/admin/materials", label: "Material Manager" },
    { href: "/admin/styles", label: "Style Tags" },
    { href: "/admin/pricing", label: "Wallpaper Pricing" },
    { href: "/admin/images", label: "Product Image Manager" },
    { href: "/admin/media", label: "Media Library" },
  ]},
  { section: "Website", links: [
    { href: "/admin/homepage", label: "Homepage Manager" },
    { href: "/admin/banners", label: "Banner Manager" },
    { href: "/admin/pages", label: "Dynamic Page Builder" },
    { href: "/admin/theme", label: "Theme Manager" },
    { href: "/admin/header", label: "Header Manager" },
    { href: "/admin/navigation", label: "Navigation Manager" },
    { href: "/admin/footer", label: "Footer Manager" },
  ]},
  { section: "Commerce", links: [
    { href: "/admin/orders", label: "Order Manager" },
    { href: "/admin/customers", label: "Customer Manager" },
    { href: "/admin/samples", label: "Sample Orders" },
    { href: "/admin/enquiries/custom-design", label: "Custom Wallpaper Requests" },
    { href: "/admin/enquiries/consultation", label: "Consultation Requests" },
    { href: "/admin/enquiries/installation", label: "Installation Requests" },
    { href: "/admin/coupons", label: "Coupons & Discounts" },
    { href: "/admin/reviews", label: "Reviews" },
  ]},
  { section: "Content", links: [
    { href: "/admin/projects", label: "Client Projects" },
    { href: "/admin/before-after", label: "Before & After Gallery" },
    { href: "/admin/inspiration", label: "Inspiration Gallery" },
    { href: "/admin/blog", label: "Blog Manager" },
    { href: "/admin/messages", label: "Contact Messages" },
    { href: "/admin/newsletter", label: "Newsletter Manager" },
  ]},
  { section: "Settings", links: [
    { href: "/admin/seo", label: "SEO Manager" },
    { href: "/admin/settings/payments", label: "Payment Settings" },
    { href: "/admin/settings/shipping", label: "Shipping Settings" },
    { href: "/admin/settings/whatsapp", label: "WhatsApp Settings" },
    { href: "/admin/settings/business", label: "Business Settings" },
    { href: "/admin/settings/website", label: "Website Settings" },
    { href: "/admin/settings/admin", label: "Admin Settings" },
  ]},
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await getAdminSession();
  if (!authed) redirect("/admin/login");
  const [settings, theme] = await Promise.all([settingsRepo.get(), themeRepo.get()]);
  const readOnly = isReadOnlyStorage() || settings.demoMode;

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#30251F]">
      {readOnly && (
        <div className="bg-amber-100 border-b border-amber-300 text-amber-900 text-center text-xs py-2 px-4">
          Demo / read-only mode — changes are stored locally and may not persist on serverless deployments.
        </div>
      )}
      <div className="flex">
        <aside className="w-60 shrink-0 hidden lg:block border-r border-black/10 bg-white min-h-[calc(100vh-0px)] sticky top-0 h-screen overflow-y-auto">
          <div className="p-5 border-b border-black/10">
            <Link href="/admin" className="font-display text-lg">{theme.siteName}</Link>
            <p className="text-[0.6rem] tracking-[0.3em] uppercase text-[#8A7B6B] mt-1">Admin Panel</p>
          </div>
          <AdminNav sections={NAV} />
          <div className="p-4 border-t border-black/10">
            <LogoutButton />
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          {/* Mobile top bar */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-black/10 bg-white sticky top-0 z-40">
            <Link href="/admin" className="font-display">{theme.siteName} Admin</Link>
            <LogoutButton compact />
          </div>
          <div className="p-4 sm:p-8 max-w-6xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
