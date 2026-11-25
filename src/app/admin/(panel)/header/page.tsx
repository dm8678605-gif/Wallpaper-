import { DocEditor } from "@/components/admin/DocEditor";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <DocEditor resource="settings" title="Header Manager" description="Announcement bar and storefront header settings."
      sections={[
        { title: "Announcement Bar", fields: [
          { path: "announcement", label: "Announcement Text", type: "textarea", },
        ]},
        { title: "Header Assets", fields: [
          { path: "business.name", label: "Business Name (footer/contact)" },
          { path: "business.phone", label: "Phone" }, { path: "business.email", label: "Email" },
        ]},
      ]}
    />
  );
}
