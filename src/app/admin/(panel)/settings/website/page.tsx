import { DocEditor } from "@/components/admin/DocEditor";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <DocEditor resource="settings" title="Website Settings" description="General storefront configuration."
      sections={[{ title: "General", fields: [
        { path: "announcement", label: "Announcement Bar Text", type: "textarea" },
        { path: "demoMode", label: "Demo Mode (read-only notice)", type: "boolean" },
      ]}]}
    />
  );
}
