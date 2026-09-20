import type { MetadataRoute } from "next";
import { tools } from "@/lib/catalog";
import { absoluteUrl, toolUrl } from "@/lib/seo";

/**
 * Every indexable URL on the site.
 *
 * The admin pages and the API are excluded deliberately — they are also
 * disallowed in robots.ts and marked noindex, so they must not appear here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/about"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const toolPages: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: toolUrl(tool.id),
    lastModified,
    changeFrequency: "weekly",
    // Tool pages are the reason the site exists, so they outrank /about,
    // but none of them outranks the homepage.
    priority: 0.8,
  }));

  return [...staticPages, ...toolPages];
}
