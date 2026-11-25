import type { Metadata } from "next";
import "./globals.css";
import { themeRepo, settingsRepo, navigationRepo, footerRepo } from "@/lib/data/repos";
import { StoreProvider } from "@/components/store/StoreProvider";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AnalyticsBeacon } from "@/components/AnalyticsBeacon";
import type { ThemeConfig } from "@/lib/data/types";

const FONT_VARS: Record<string, string> = {
  "Playfair Display": "'Playfair Display', Georgia, 'Times New Roman', serif",
  "Cormorant Garamond": "'Cormorant Garamond', Georgia, serif",
  Inter: "Inter, system-ui, -apple-system, sans-serif",
  Jost: "Jost, system-ui, sans-serif",
};

function themeCssVars(theme: ThemeConfig): string {
  const c = theme.colors;
  const heading = FONT_VARS[theme.fonts.heading] ?? FONT_VARS["Playfair Display"];
  const body = FONT_VARS[theme.fonts.body] ?? FONT_VARS["Inter"];
  const radius = { none: "0px", sm: "4px", md: "10px", lg: "20px" }[theme.radius] ?? "4px";
  return `
    :root {
      --color-primary: ${c.primary};
      --color-secondary: ${c.secondary};
      --color-accent: ${c.accent};
      --color-bg: ${c.background};
      --color-surface: ${c.surface};
      --color-ink: ${c.text};
      --color-header: ${c.headerBg};
      --color-footer: ${c.footerBg};
      --color-muted: ${c.muted};
      --font-display: ${heading}, Georgia, serif;
      --font-body: ${body}, system-ui, sans-serif;
      --radius-card: ${radius};
    }`;
}

export async function generateMetadata(): Promise<Metadata> {
  const [settings, theme] = await Promise.all([settingsRepo.get(), themeRepo.get()]);
  return {
    title: { default: settings.seo.defaultTitle || theme.siteName, template: `%s | ${theme.siteName}` },
    description: settings.seo.defaultDescription,
    icons: theme.faviconUrl ? { icon: theme.faviconUrl } : undefined,
  };
}

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [theme, settings, navItems, footer] = await Promise.all([
    themeRepo.get(), settingsRepo.get(), navigationRepo.items(), footerRepo.get(),
  ]);
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400..900&family=Cormorant+Garamond:wght@300..700&family=Inter:wght@100..900&family=Jost:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <style dangerouslySetInnerHTML={{ __html: themeCssVars(theme) }} />
        <StoreProvider currency={settings.currency}>
          <AnalyticsBeacon />
          <SiteHeader
            siteName={theme.siteName}
            tagline={theme.tagline}
            logoUrl={theme.logoUrl}
            items={navItems}
            announcement={settings.announcement}
          />
          <main className="flex-1">{children}</main>
          <SiteFooter config={footer} siteName={theme.siteName} settings={settings} />
        </StoreProvider>
      </body>
    </html>
  );
}
