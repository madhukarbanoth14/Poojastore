import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Noto_Sans_Telugu } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { AppShell } from "@/components/app-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/copy";
import { getActiveFestivalCampaign } from "@/lib/festival-campaign";
import { festivalThemeActive } from "@/lib/festivals";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const telugu = Noto_Sans_Telugu({
  variable: "--font-telugu",
  subsets: ["telugu"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"),
  title: {
    default: "Pavitra Seva",
    template: "%s · Pavitra Seva",
  },
  description:
    "Pavitra Seva — Your Divine Companion. Daily panchangam, rasi guidance, Pooja kits, poojari bookings, and festivals for families in India, USA, and Canada.",
  icons: {
    icon: "/images/brand/pavitra_seva_icon.jpeg",
    apple: "/images/brand/pavitra_seva_icon.jpeg",
  },
  openGraph: {
    title: "Pavitra Seva · Your Divine Companion",
    description:
      "Daily panchangam, spiritual guidance, Pooja kits, and poojari bookings for India, USA, and Canada.",
    images: ["/images/brand/pavitra_seva_logo.jpeg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#8F1724",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const festive = festivalThemeActive() || Boolean(getActiveFestivalCampaign());
  return (
    <html
      lang={locale}
      data-theme={festive ? "festival" : undefined}
      className={`${inter.variable} ${cormorant.variable} ${telugu.variable}`}
    >
      <body className="min-h-screen bg-bg antialiased">
        <div className="paper-grain" aria-hidden />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <AuthProvider>
          <AppShell
            header={<SiteHeader locale={locale} brand={t(locale, "brand")} />}
            footer={<SiteFooter locale={locale} />}
          >
            {children}
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
