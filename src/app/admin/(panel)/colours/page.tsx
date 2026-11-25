"use client";
import { AdminCrud } from "@/components/admin/AdminCrud";
export const dynamic = "force-dynamic";
export default function Page() {
  return <AdminCrud resource="colours" title="Colour Manager" description="Colour families for Shop by Colour." fields={[
 {key:"name",label:"Name",required:true},{key:"slug",label:"Slug",required:true},
 {key:"hex",label:"Hex Code",required:true,placeholder:"#B79A61"},{key:"description",label:"Description",type:"textarea"},
 {key:"image",label:"Image",type:"image"},{key:"order",label:"Order",type:"number"},{key:"published",label:"Published",type:"boolean"}
]} columns={[{key:"name",label:"Name"},{key:"hex",label:"Hex",render:(r: Record<string, unknown>)=><span className="inline-flex items-center gap-2"><span className="w-5 h-5 border border-black/15 inline-block" style={{background:String(r.hex)}}/>{String(r.hex)}</span>},{key:"published",label:"Status",render:(r: Record<string, unknown>)=>r.published?"Published":"Draft"}]}  />;
}
