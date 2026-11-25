"use client";
import { AdminCrud } from "@/components/admin/AdminCrud";
export const dynamic = "force-dynamic";
export default function Page() {
  return <AdminCrud resource="enquiries" title="Consultation Requests" description="Design consultation enquiries." fields={[
 {key:"name",label:"Name"},{key:"email",label:"Email"},{key:"phone",label:"Phone"},
 {key:"message",label:"Message",type:"textarea"},{key:"status",label:"Status",type:"select",options:[{value:"new",label:"New"},{value:"contacted",label:"Contacted"},{value:"closed",label:"Closed"}]}
]} columns={[{key:"name",label:"Name"},{key:"email",label:"Email"},{key:"message",label:"Message",render:(r: Record<string, unknown>)=><span className="line-clamp-2 max-w-xs">{String(r.message??"")}</span>},{key:"status",label:"Status"}]} filterId="consultation" statusField={{key:"status",label:"Status",options:[{value:"new",label:"New"},{value:"contacted",label:"Contacted"},{value:"closed",label:"Closed"}]}} hideAdd />;
}
