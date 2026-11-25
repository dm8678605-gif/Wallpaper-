import { DocEditor } from "@/components/admin/DocEditor";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <DocEditor resource="settings" title="SEO Manager" description="Site-wide default SEO metadata. Per-page SEO is editable in Page Builder."
      sections={[
        { title: "Default Metadata", fields: [
          { path: "seo.defaultTitle", label: "Default Title" },
          { path: "seo.defaultDescription", label: "Default Description", type: "textarea" },
          { path: "seo.ogImage", label: "Default OG Image URL" },
        ]},
      ]}
    />
  );
}
