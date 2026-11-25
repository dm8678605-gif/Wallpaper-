"use client";
import { AdminCrud } from "@/components/admin/AdminCrud";
export const dynamic = "force-dynamic";
export default function Page() {
  return <AdminCrud resource="orders" title="Order Manager" description="All customer orders." fields={[
 {key:"customerName",label:"Customer"},{key:"email",label:"Email"},{key:"phone",label:"Phone"},
 {key:"total",label:"Total",type:"number"},{key:"paymentMethod",label:"Payment",type:"select",options:[{value:"cod",label:"COD"},{value:"online",label:"Online"},{value:"whatsapp",label:"WhatsApp"}]},
 {key:"status",label:"Status",type:"select",options:[{value:"pending",label:"Pending"},{value:"confirmed",label:"Confirmed"},{value:"processing",label:"Processing"},{value:"shipped",label:"Shipped"},{value:"delivered",label:"Delivered"},{value:"cancelled",label:"Cancelled"}]},
 {key:"notes",label:"Notes",type:"textarea"}
]} columns={[{key:"id",label:"Order ID"},{key:"customerName",label:"Customer"},{key:"total",label:"Total"},{key:"paymentMethod",label:"Payment"},{key:"status",label:"Status"},{key:"createdAt",label:"Date",render:(r: Record<string, unknown>)=>String(r.createdAt??"").slice(0,10)}]} statusField={{key:"status",label:"Status",options:[{value:"pending",label:"Pending"},{value:"confirmed",label:"Confirmed"},{value:"processing",label:"Processing"},{value:"shipped",label:"Shipped"},{value:"delivered",label:"Delivered"},{value:"cancelled",label:"Cancelled"}]}} hideAdd searchableKeys={["id","customerName","email"]} />;
}
