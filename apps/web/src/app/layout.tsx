import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Noto_Sans_Telugu } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/copy";
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
    "Pavitra Seva is a Hindu spiritual marketplace for Pooja kits, samagri, verified priests, panchang, and festival packages across India, USA, and Canada.",
  icons: {
    icon: "/images/brand/pavitra_seva_icon.jpeg",
    apple: "/images/brand/pavitra_seva_icon.jpeg",
  },
  openGraph: {
    title: "Pavitra Seva",
    description:
      "Sacred kits, verified priests, and festival guidance — delivered with devotion.",
    images: ["/images/brand/pavitra_seva_logo.jpeg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#4A0F1D",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${inter.variable} ${cormorant.variable} ${telugu.variable}`}
    >
      <body className="min-h-screen bg-bg antialiased">
        <div className="paper-grain" aria-hidden />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <AuthProvider>
          <SiteHeader locale={locale} brand={t(locale, "brand")} />
          <main id="main">{children}</main>
          <SiteFooter locale={locale} />
        </AuthProvider>
      </body>
    </html>
  );
}
