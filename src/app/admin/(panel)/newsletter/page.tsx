"use client";
import { AdminCrud } from "@/components/admin/AdminCrud";
export const dynamic = "force-dynamic";
export default function Page() {
  return <AdminCrud resource="newsletter" title="Newsletter Manager" description="Email subscribers." fields={[
 {key:"email",label:"Email",required:true},{key:"status",label:"Status",type:"select",options:[{value:"active",label:"Active"},{value:"unsubscribed",label:"Unsubscribed"}]}
]} columns={[{key:"email",label:"Email"},{key:"status",label:"Status"},{key:"createdAt",label:"Subscribed",render:(r: Record<string, unknown>)=>String(r.createdAt??"").slice(0,10)}]} hideAdd />;
}
