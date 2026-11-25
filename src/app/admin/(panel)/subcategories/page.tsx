"use client";
import { AdminCrud } from "@/components/admin/AdminCrud";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AdminCrud
      resource="categories"
      title="Subcategories"
      description="Subcategory pages are generated automatically under their parent category."
      fields={[
  {key:"name",label:"Name",required:true},{key:"slug",label:"Slug",required:true},
  {key:"parentId",label:"Parent Category",type:"select",optionsResource:"categories",optionsLabelKey:"name",optionsValueKey:"id",required:true},
  {key:"description",label:"Description",type:"textarea"},{key:"image",label:"Image",type:"image"},
  {key:"order",label:"Order",type:"number"},{key:"published",label:"Published",type:"boolean"}
]}
      columns={[
  {key:"name",label:"Name"},{key:"slug",label:"Slug"},{key:"parentId",label:"Parent",render:(r: Record<string, unknown>)=>String(r.parentId??"—")},
  {key:"published",label:"Status",render:(r: Record<string, unknown>)=>r.published?"Published":"Draft"}
]}
      filterId="!"
    />
  );
}
