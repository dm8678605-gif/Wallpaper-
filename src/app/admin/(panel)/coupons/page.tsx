"use client";
import { AdminCrud } from "@/components/admin/AdminCrud";
export const dynamic = "force-dynamic";
export default function Page() {
  return <AdminCrud resource="coupons" title="Coupons & Discounts" description="Discount codes for checkout." fields={[
 {key:"code",label:"Code",required:true},{key:"type",label:"Type",type:"select",options:[{value:"percent",label:"Percent"},{value:"flat",label:"Flat amount"}],required:true},
 {key:"value",label:"Value",type:"number",required:true},{key:"minOrderValue",label:"Min Order Value",type:"number"},
 {key:"usageLimit",label:"Usage Limit",type:"number"},{key:"expiresAt",label:"Expires At",type:"date"},{key:"active",label:"Active",type:"boolean"}
]} columns={[{key:"code",label:"Code"},{key:"type",label:"Type"},{key:"value",label:"Value"},{key:"active",label:"Active",render:(r: Record<string, unknown>)=>r.active?"Yes":"No"}]}  />;
}
