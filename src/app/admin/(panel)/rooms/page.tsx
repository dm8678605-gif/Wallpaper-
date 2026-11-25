"use client";
import { AdminCrud } from "@/components/admin/AdminCrud";
export const dynamic = "force-dynamic";
export default function Page() {
  return <AdminCrud resource="rooms" title="Room Manager" description="Rooms used for Shop by Room and product tagging." fields={[
 {key:"name",label:"Name",required:true},{key:"slug",label:"Slug",required:true},
 {key:"description",label:"Description",type:"textarea"},{key:"image",label:"Image",type:"image"},
 {key:"order",label:"Order",type:"number"},{key:"published",label:"Published",type:"boolean"}
]} columns={[{key:"name",label:"Name"},{key:"slug",label:"Slug"},{key:"published",label:"Status",render:(r: Record<string, unknown>)=>r.published?"Published":"Draft"}]}  />;
}
