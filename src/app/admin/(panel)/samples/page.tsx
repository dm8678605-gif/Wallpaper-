"use client";
import { AdminCrud } from "@/components/admin/AdminCrud";
export const dynamic = "force-dynamic";
export default function Page() {
  return <AdminCrud resource="samples" title="Sample Orders" description="Customer sample requests." fields={[
 {key:"name",label:"Name"},{key:"email",label:"Email"},{key:"phone",label:"Phone"},
 {key:"productIds",label:"Product IDs (JSON array)",type:"json"},{key:"address",label:"Address",type:"textarea"},
 {key:"status",label:"Status",type:"select",options:[{value:"pending",label:"Pending"},{value:"shipped",label:"Shipped"},{value:"delivered",label:"Delivered"},{value:"cancelled",label:"Cancelled"}]}
]} columns={[{key:"name",label:"Name"},{key:"email",label:"Email"},{key:"status",label:"Status"}]} statusField={{key:"status",label:"Status",options:[{value:"pending",label:"Pending"},{value:"shipped",label:"Shipped"},{value:"delivered",label:"Delivered"},{value:"cancelled",label:"Cancelled"}]}} hideAdd />;
}
