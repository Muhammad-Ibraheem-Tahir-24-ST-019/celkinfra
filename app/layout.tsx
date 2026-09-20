import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AdProvider } from "./ads";
import NavigationFeedback from "./navigation-feedback";
import JsonLd from "./json-ld";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  graph,
  websiteJsonLd,
  organizationJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  // Lets every other route use relative paths for canonical and OG URLs.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    // Tool pages set only their own name; the site name is appended here.
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // No `alternates` here on purpose: metadata is shallow-merged, so a canonical
  // set on the root layout would be inherited verbatim by every page that does
  // not override it. Each page declares its own canonical instead.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    url: "/",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Let Google use full-length snippets and large previews rather than
      // truncating the answer-first paragraph on the tool pages.
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b111d" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className="dark">
      <body className="antialiased">
        {/* Site-level graph: declared once, referenced by @id on every page. */}
        <JsonLd data={graph([websiteJsonLd(), organizationJsonLd()])} />
        <AdProvider>
          <NavigationFeedback />
          {children}
        </AdProvider>
      </body>
    </html>
  );
}
