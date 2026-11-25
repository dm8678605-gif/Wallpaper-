import { DocEditor } from "@/components/admin/DocEditor";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <DocEditor resource="settings" title="Wallpaper Pricing" description="Calculator defaults — per-product pricing is edited in the product editor."
      sections={[
        { title: "Calculator Defaults", fields: [
          { path: "calculator.defaultWastagePercent", label: "Default Wastage %", type: "number" },
          { path: "calculator.defaultInstallationPerSqft", label: "Default Installation / sq ft", type: "number", step: "any" },
          { path: "calculator.rollWidthFt", label: "Roll Width (ft)", type: "number", step: "any" },
          { path: "calculator.rollLengthFt", label: "Roll Length (ft)", type: "number", step: "any" },
        ]},
        { title: "Tax", fields: [
          { path: "tax.enabled", label: "Tax Enabled", type: "boolean" },
          { path: "tax.percent", label: "Tax %", type: "number", step: "any" },
          { path: "tax.label", label: "Tax Label" },
        ]},
        { title: "Currency", fields: [
          { path: "currency.code", label: "Currency Code" },
          { path: "currency.symbol", label: "Symbol" },
          { path: "currency.position", label: "Position", type: "select", options: [
            { value: "before", label: "Before amount" }, { value: "after", label: "After amount" }] },
        ]},
      ]}
    />
  );
}
