"use client";
import { AdminCrud } from "@/components/admin/AdminCrud";
export const dynamic = "force-dynamic";
export default function Page() {
  return <AdminCrud resource="materials" title="Material Manager" description="Wallpaper materials and base pricing." fields={[
 {key:"name",label:"Name",required:true},{key:"slug",label:"Slug",required:true},
 {key:"description",label:"Description",type:"textarea"},{key:"pricePerSqft",label:"Base Price / sq ft",type:"number",required:true},
 {key:"image",label:"Image",type:"image"},{key:"order",label:"Order",type:"number"},{key:"published",label:"Published",type:"boolean"}
]} columns={[{key:"name",label:"Name"},{key:"pricePerSqft",label:"Price/sqft"},{key:"published",label:"Status",render:(r: Record<string, unknown>)=>r.published?"Published":"Draft"}]}  />;
}
