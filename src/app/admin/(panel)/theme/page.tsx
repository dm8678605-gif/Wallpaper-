import { DocEditor } from "@/components/admin/DocEditor";
export const dynamic = "force-dynamic";
const COLORS = [
  { path: "colors.primary", label: "Primary (Luxury Gold)" },
  { path: "colors.secondary", label: "Secondary (Olive Green)" },
  { path: "colors.accent", label: "Accent (Champagne Beige)" },
  { path: "colors.background", label: "Background (Royal Ivory)" },
  { path: "colors.surface", label: "Surface" },
  { path: "colors.text", label: "Text (Espresso Brown)" },
  { path: "colors.headerBg", label: "Header Background" },
  { path: "colors.footerBg", label: "Footer Background" },
  { path: "colors.muted", label: "Muted Text" },
];
export default function Page() {
  return (
    <DocEditor resource="theme" title="Theme Manager" description="Colours, typography and style — applied site-wide via CSS variables."
      sections={[
        { title: "Identity", fields: [
          { path: "siteName", label: "Website Name" }, { path: "tagline", label: "Tagline" },
          { path: "logoUrl", label: "Logo URL", type: "text" }, { path: "faviconUrl", label: "Favicon URL", type: "text" },
        ]},
        { title: "Colours", fields: COLORS.map((c) => ({ ...c, type: "color" as const })) },
        { title: "Typography & Style", fields: [
          { path: "fonts.heading", label: "Heading Font", type: "select", options: [
            { value: "Playfair Display", label: "Playfair Display (serif)" }, { value: "Cormorant Garamond", label: "Cormorant Garamond" },
            { value: "Inter", label: "Inter" }, { value: "Jost", label: "Jost" }] },
          { path: "fonts.body", label: "Body Font", type: "select", options: [
            { value: "Inter", label: "Inter" }, { value: "Jost", label: "Jost" },
            { value: "Playfair Display", label: "Playfair Display" }, { value: "Cormorant Garamond", label: "Cormorant Garamond" }] },
          { path: "radius", label: "Corner Radius", type: "select", options: [
            { value: "none", label: "None" }, { value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }] },
          { path: "buttonStyle", label: "Button Style", type: "select", options: [
            { value: "solid", label: "Solid" }, { value: "outline", label: "Outline" }, { value: "pill", label: "Pill" }] },
          { path: "animationLevel", label: "Animations", type: "select", options: [
            { value: "full", label: "Full" }, { value: "reduced", label: "Reduced" }, { value: "none", label: "None" }] },
        ]},
      ]}
    />
  );
}
