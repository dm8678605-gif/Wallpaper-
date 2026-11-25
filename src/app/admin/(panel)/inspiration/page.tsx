"use client";
import { AdminCrud } from "@/components/admin/AdminCrud";
export const dynamic = "force-dynamic";
export default function Page() {
  return <AdminCrud resource="gallery" title="Inspiration Gallery" description="Gallery images shown on the Inspiration page." fields={[
 {key:"title",label:"Title",required:true},{key:"image",label:"Image",type:"image",required:true},
 {key:"category",label:"Category label"},{key:"roomId",label:"Room",type:"select",optionsResource:"rooms",optionsLabelKey:"name",optionsValueKey:"id"},
 {key:"published",label:"Published",type:"boolean"}
]} columns={[{key:"title",label:"Title"},{key:"category",label:"Category"},{key:"published",label:"Status",render:(r: Record<string, unknown>)=>r.published?"Published":"Draft"}]}  />;
}
