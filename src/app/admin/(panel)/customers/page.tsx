"use client";
import { AdminCrud } from "@/components/admin/AdminCrud";
export const dynamic = "force-dynamic";
export default function Page() {
  return <AdminCrud resource="customers" title="Customer Manager" description="Customer records created from orders." fields={[
 {key:"name",label:"Name",required:true},{key:"email",label:"Email",required:true},
 {key:"phone",label:"Phone"},{key:"notes",label:"Notes",type:"textarea"}
]} columns={[{key:"name",label:"Name"},{key:"email",label:"Email"},{key:"phone",label:"Phone"},{key:"orderCount",label:"Orders"},{key:"totalSpent",label:"Total Spent"}]} hideAdd searchableKeys={["name","email"]} />;
}
