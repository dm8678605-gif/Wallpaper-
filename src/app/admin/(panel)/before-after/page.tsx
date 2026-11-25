"use client";
import { AdminCrud } from "@/components/admin/AdminCrud";
export const dynamic = "force-dynamic";
export default function Page() {
  return <AdminCrud resource="projects" title="Before & After Gallery" description="Projects that have before/after imagery." fields={[
 {key:"title",label:"Title",required:true},{key:"location",label:"Location"},{key:"description",label:"Description",type:"textarea"},
 {key:"beforeImage",label:"Before Image",type:"image",required:true},{key:"afterImage",label:"After Image",type:"image",required:true},
 {key:"published",label:"Published",type:"boolean"}
]} columns={[{key:"title",label:"Title"},{key:"location",label:"Location"},{key:"published",label:"Status",render:(r: Record<string, unknown>)=>r.published?"Published":"Draft"}]} filterId="!" filterKey="beforeImage" />;
}
