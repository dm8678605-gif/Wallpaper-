import { DocEditor } from "@/components/admin/DocEditor";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <DocEditor resource="settings" title="Shipping Settings" description="Shipping charges and delivery estimates used at checkout and in the calculator."
      sections={[{ title: "Shipping", fields: [
        { path: "shipping.enabled", label: "Shipping Enabled", type: "boolean" },
        { path: "shipping.flatCharge", label: "Flat Charge", type: "number", step: "any" },
        { path: "shipping.freeAbove", label: "Free Above Order Value", type: "number", step: "any" },
        { path: "shipping.estimatedDays", label: "Estimated Delivery" },
      ]}]}
    />
  );
}
