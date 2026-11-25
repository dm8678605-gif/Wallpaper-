import { DocEditor } from "@/components/admin/DocEditor";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <DocEditor resource="settings" title="Payment Settings" description="Payment methods. Online payment stays disabled until a real gateway is integrated."
      sections={[{ title: "Methods", fields: [
        { path: "payments.cod.enabled", label: "Cash on Delivery", type: "boolean" },
        { path: "payments.whatsapp.enabled", label: "WhatsApp Ordering", type: "boolean" },
        { path: "payments.online.enabled", label: "Online Payment (requires gateway)", type: "boolean" },
        { path: "payments.online.provider", label: "Provider (future)", type: "text" },
      ]}]}
    />
  );
}
