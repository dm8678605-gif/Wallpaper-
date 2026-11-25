import { productsRepo, ordersRepo, customersRepo, enquiriesRepo, categoriesRepo, collectionsRepo, reviewsRepo, couponsRepo, settingsRepo } from "@/lib/data/repos";
import { formatMoney, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Package, ShoppingCart, Users, MessageSquare, Image as ImageIcon, Star } from "lucide-react";
import { DashboardCharts } from "@/components/admin/DashboardCharts";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [products, orders, customers, enquiries, categories, collections, reviews, coupons, settings] = await Promise.all([
    productsRepo.all(), ordersRepo.all(), customersRepo.all(), enquiriesRepo.all(),
    categoriesRepo.all(), collectionsRepo.published(), reviewsRepo.all(), couponsRepo.all(), settingsRepo.get(),
  ]);

  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "confirmed").length;
  const newEnquiries = enquiries.filter((e) => e.status === "new").length;

  const stats = [
    { label: "Products", value: products.length, icon: Package, href: "/admin/products" },
    { label: "Orders", value: orders.length, icon: ShoppingCart, href: "/admin/orders", sub: `${pendingOrders} pending` },
    { label: "Revenue", value: formatMoney(revenue, settings), icon: ShoppingCart, href: "/admin/orders" },
    { label: "Customers", value: customers.length, icon: Users, href: "/admin/customers" },
    { label: "Enquiries", value: newEnquiries, icon: MessageSquare, href: "/admin/enquiries/custom-design", sub: "new" },
    { label: "Categories", value: categories.filter((c) => !c.parentId).length, icon: ImageIcon, href: "/admin/categories" },
    { label: "Collections", value: collections.length, icon: ImageIcon, href: "/admin/collections" },
    { label: "Reviews", value: reviews.filter((r) => r.status === "pending").length, icon: Star, href: "/admin/reviews", sub: "pending" },
    { label: "Coupons", value: coupons.filter((c) => c.active).length, icon: Package, href: "/admin/coupons" },
  ];

  const recentOrders = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  const monthly: Record<string, number> = {};
  for (const o of orders) {
    const m = o.createdAt.slice(0, 7);
    monthly[m] = (monthly[m] ?? 0) + o.total;
  }
  const chartData = Object.entries(monthly).sort().map(([m, total]) => ({ month: m, total: Math.round(total) }));

  return (
    <div>
      <h1 className="font-display text-3xl mb-1">Dashboard</h1>
      <p className="text-sm text-[#8A7B6B] mb-8">Store overview · {formatDate(new Date().toISOString())}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, href, sub }) => (
          <Link key={label} href={href} className="bg-white border border-black/10 p-5 hover:border-[#B79A61] transition-colors">
            <Icon size={18} className="text-[#B79A61] mb-3" />
            <p className="font-display text-2xl">{value}</p>
            <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#8A7B6B] mt-1">{label}{sub ? ` · ${sub}` : ""}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white border border-black/10 p-6">
          <h2 className="font-semibold mb-4">Order Revenue</h2>
          <DashboardCharts data={chartData} />
        </div>
        <div className="lg:col-span-2 bg-white border border-black/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-[#8a6d3b] hover:underline">View all</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-[#8A7B6B]">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between text-sm border-b border-black/5 pb-2">
                  <div>
                    <p className="font-medium">{o.id}</p>
                    <p className="text-xs text-[#8A7B6B]">{o.customerName} · {formatDate(o.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatMoney(o.total, settings)}</p>
                    <p className="text-[0.6rem] tracking-widest uppercase text-[#8A7B6B]">{o.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
