import type { Metadata } from "next";
import Admin from "../admin-workspace";
export const dynamic = "force-dynamic";

/**
 * Belt and braces: /admin is disallowed in robots.txt and absent from the
 * sitemap, but robots.txt only stops crawling — a URL linked from elsewhere
 * can still be indexed. noindex is what actually keeps it out of results.
 */
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default function Page() {
  return <Admin />;
}
