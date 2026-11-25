import { DocEditor } from "@/components/admin/DocEditor";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <DocEditor resource="settings" title="Business Settings" description="Business identity shown in footer, contact page and invoices."
      sections={[{ title: "Business", fields: [
        { path: "business.name", label: "Business Name" }, { path: "business.email", label: "Email" },
        { path: "business.phone", label: "Phone" }, { path: "business.whatsapp", label: "WhatsApp" },
        { path: "business.address", label: "Address", type: "textarea" },
        { path: "business.city", label: "City" }, { path: "business.state", label: "State" },
        { path: "business.pincode", label: "PIN Code" }, { path: "business.country", label: "Country" },
        { path: "business.gstin", label: "GSTIN" }, { path: "business.hours", label: "Business Hours" },
      ]}]}
    />
  );
}
