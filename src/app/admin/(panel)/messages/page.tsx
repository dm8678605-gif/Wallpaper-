"use client";
import { AdminCrud } from "@/components/admin/AdminCrud";
export const dynamic = "force-dynamic";
export default function Page() {
  return <AdminCrud resource="messages" title="Contact Messages" description="Messages submitted via the contact form." fields={[
 {key:"name",label:"Name"},{key:"email",label:"Email"},{key:"subject",label:"Subject"},
 {key:"message",label:"Message",type:"textarea"},{key:"read",label:"Read",type:"boolean"}
]} columns={[{key:"name",label:"Name"},{key:"email",label:"Email"},{key:"subject",label:"Subject"},{key:"read",label:"Read",render:(r: Record<string, unknown>)=>r.read?"Yes":"No"}]} hideAdd />;
}
