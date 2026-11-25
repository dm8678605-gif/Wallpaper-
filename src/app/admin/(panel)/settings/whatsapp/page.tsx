import { DocEditor } from "@/components/admin/DocEditor";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <DocEditor resource="settings" title="WhatsApp Settings" description="WhatsApp number used for order sharing and enquiries (international format, digits only with country code)."
      sections={[
        { title: "WhatsApp", fields: [
          { path: "business.whatsapp", label: "WhatsApp Number (e.g. 919876543210)" },
          { path: "payments.whatsapp.enabled", label: "WhatsApp Ordering Enabled", type: "boolean" },
        ]},
      ]}
    />
  );
}
