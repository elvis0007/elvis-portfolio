import type { Metadata, Viewport } from "next";
import "@fontsource/exo-2/500.css";
import "@fontsource/exo-2/600.css";
import "@fontsource/exo-2/700.css";
import "@fontsource/commissioner/400.css";
import "@fontsource/commissioner/500.css";
import "@fontsource/commissioner/600.css";
import "@fontsource/reddit-mono/400.css";
import "@fontsource/reddit-mono/500.css";
import "@/styles/globals.css";
import { SITE_URL } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Elvis Flores — Software Engineer",
    template: "%s · Elvis Flores",
  },
  description:
    "Portfolio of Elvis Flores, a software engineer crafting digital experiences, technology solutions and modern applications. Available in English and Spanish.",
  applicationName: "Elvis Flores Portfolio",
  authors: [{ name: "Elvis Flores", url: SITE_URL }],
  creator: "Elvis Flores",
  keywords: ["Elvis Flores", "Software Developer", "Frontend Developer", "React", "Next.js", "Three.js", "Portfolio", "Ecuador"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["es_EC"],
    url: SITE_URL,
    siteName: "Elvis Flores",
    title: "Elvis Flores — Software Engineer",
    description: "Building digital experiences. Projects, tech stack, certifications and contact.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elvis Flores — Software Engineer",
    description: "Building digital experiences.",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
