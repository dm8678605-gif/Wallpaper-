"use client";
import { AdminCrud } from "@/components/admin/AdminCrud";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AdminCrud
      resource="categories"
      title="Categories"
      description="Wallpaper style categories. Subcategories are managed under Subcategories."
      fields={[
  {key:"name",label:"Name",required:true},{key:"slug",label:"Slug",required:true,placeholder:"auto from name"},
  {key:"description",label:"Description",type:"textarea"},{key:"image",label:"Image",type:"image"},
  {key:"order",label:"Order",type:"number"},{key:"published",label:"Published",type:"boolean"}
]}
      columns={[
  {key:"name",label:"Name"},{key:"slug",label:"Slug"},{key:"parentId",label:"Parent",render:(r)=>r.parentId?"Sub":"Root"},
  {key:"published",label:"Status",render:(r)=>r.published?"Published":"Draft"}
]}
      
    />
  );
}
