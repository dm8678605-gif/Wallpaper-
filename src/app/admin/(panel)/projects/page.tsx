"use client";
import { AdminCrud } from "@/components/admin/AdminCrud";
export const dynamic = "force-dynamic";
export default function Page() {
  return <AdminCrud resource="projects" title="Client Projects" description="Portfolio projects with imagery." fields={[
 {key:"title",label:"Title",required:true},{key:"client",label:"Client"},{key:"location",label:"Location"},
 {key:"description",label:"Description",type:"textarea"},{key:"categoryId",label:"Category",type:"select",optionsResource:"categories",optionsLabelKey:"name",optionsValueKey:"id"},
 {key:"images",label:"Images (JSON array of URLs)",type:"json"},
 {key:"beforeImage",label:"Before Image",type:"image"},{key:"afterImage",label:"After Image",type:"image"},
 {key:"featured",label:"Featured",type:"boolean"},{key:"published",label:"Published",type:"boolean"}
]} columns={[{key:"title",label:"Title"},{key:"location",label:"Location"},{key:"featured",label:"Featured",render:(r: Record<string, unknown>)=>r.featured?"Yes":"—"},{key:"published",label:"Status",render:(r: Record<string, unknown>)=>r.published?"Published":"Draft"}]}  />;
}
