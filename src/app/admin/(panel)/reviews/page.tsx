"use client";
import { AdminCrud } from "@/components/admin/AdminCrud";
export const dynamic = "force-dynamic";
export default function Page() {
  return <AdminCrud resource="reviews" title="Reviews" description="Product reviews — approve or reject." fields={[
 {key:"productId",label:"Product",type:"select",optionsResource:"products",optionsLabelKey:"name",optionsValueKey:"id",required:true},
 {key:"authorName",label:"Author Name",required:true},{key:"authorLocation",label:"Location"},
 {key:"rating",label:"Rating (1-5)",type:"number",required:true},{key:"title",label:"Title"},
 {key:"body",label:"Review",type:"textarea",required:true},{key:"status",label:"Status",type:"select",options:[{value:"pending",label:"Pending"},{value:"approved",label:"Approved"},{value:"rejected",label:"Rejected"}]},
 {key:"verified",label:"Verified",type:"boolean"}
]} columns={[{key:"authorName",label:"Author"},{key:"rating",label:"Rating"},{key:"title",label:"Title"},{key:"status",label:"Status"}]} statusField={{key:"status",label:"Status",options:[{value:"pending",label:"Pending"},{value:"approved",label:"Approved"},{value:"rejected",label:"Rejected"}]}} />;
}
