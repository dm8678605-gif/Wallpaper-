"use client";
import { AdminCrud } from "@/components/admin/AdminCrud";
export const dynamic = "force-dynamic";
export default function Page() {
  return <AdminCrud resource="pages" title="Dynamic Page Builder" description="Editable content pages (About, legal, FAQs…)." fields={[
 {key:"title",label:"Title",required:true},{key:"slug",label:"Slug",required:true},
 {key:"content",label:"Content (markdown-lite)",type:"textarea",required:true,placeholder:"## Heading\n\nParagraph text…"},
 {key:"published",label:"Published",type:"boolean"},{key:"showInNav",label:"Show in Nav",type:"boolean"},{key:"showInFooter",label:"Show in Footer",type:"boolean"},
 {key:"seo",label:"SEO (JSON)",type:"json"}
]} columns={[{key:"title",label:"Title"},{key:"slug",label:"Slug"},{key:"published",label:"Status",render:(r: Record<string, unknown>)=>r.published?"Published":"Draft"},{key:"showInNav",label:"Nav",render:(r: Record<string, unknown>)=>r.showInNav?"Yes":"—"}]}  />;
}
