"use client";
import { AdminCrud } from "@/components/admin/AdminCrud";
export const dynamic = "force-dynamic";
export default function Page() {
  return <AdminCrud resource="blog" title="Blog Manager" description="Journal articles." fields={[
 {key:"title",label:"Title",required:true},{key:"slug",label:"Slug",required:true},
 {key:"excerpt",label:"Excerpt",type:"textarea"},{key:"content",label:"Content",type:"textarea"},
 {key:"image",label:"Image",type:"image"},{key:"author",label:"Author"},
 {key:"tags",label:"Tags (comma separated)",placeholder:"Design Tips, Living Room"},
 {key:"published",label:"Published",type:"boolean"},{key:"publishedAt",label:"Published At",type:"date"}
]} columns={[{key:"title",label:"Title"},{key:"author",label:"Author"},{key:"published",label:"Status",render:(r: Record<string, unknown>)=>r.published?"Published":"Draft"}]}  />;
}
