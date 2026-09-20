/**
 * Central SEO / AEO configuration and structured-data builders.
 *
 * The canonical origin comes from NEXT_PUBLIC_SITE_URL at build time.
 * Set it in your deployment environment (Cloudflare Pages/Workers env var,
 * or a local .env file) before running `npm run build`, otherwise canonical
 * tags, the sitemap and all JSON-LD `@id` values fall back to SITE_URL_FALLBACK.
 */

import { tools, categories, type Category, type Tool } from "./catalog";

/** Used only when NEXT_PUBLIC_SITE_URL is not set. Change this or set the env var. */
const SITE_URL_FALLBACK = "https://cekinfra.com";

function readSiteUrlFromEnv(): string | undefined {
  // Written as a plain member expression so the bundler's `define` can
  // statically replace it; the try/catch covers runtimes without `process`.
  try {
    return process.env.NEXT_PUBLIC_SITE_URL;
  } catch {
    return undefined;
  }
}

/** Canonical origin, always without a trailing slash. */
export const SITE_URL = (readSiteUrlFromEnv()?.trim() || SITE_URL_FALLBACK)
  .trim()
  .replace(/\/+$/, "");

export const SITE_NAME = "Bmaikr Tools";
export const SITE_TAGLINE = "DNS, IP, Developer & Network Tools";
export const SITE_LOCALE = "en_US";
export const SITE_LANG = "en";
export const TOOL_COUNT = tools.length;

// Kept under ~160 characters so it is not truncated in search results.
export const SITE_DESCRIPTION =
  `${TOOL_COUNT} free DNS, IP, developer and network tools. Check DNS propagation, ` +
  `look up an IP, inspect HTTP headers or test a port — each result shows its source.`;

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function toolPath(id: string): string {
  return `/tools/${id}`;
}

export function toolUrl(id: string): string {
  return absoluteUrl(toolPath(id));
}

export function categoryPath(category: Category): string {
  return `/?category=${encodeURIComponent(category)}`;
}

/* ------------------------------------------------------------------ *
 * JSON-LD builders
 *
 * Each builder returns a plain object. Render it with <JsonLd> (below)
 * or inline via a <script type="application/ld+json"> tag.
 * ------------------------------------------------------------------ */

type Json = Record<string, unknown>;

/** Stable @id values so the graph nodes can reference each other. */
export const IDS = {
  website: `${SITE_URL}/#website`,
  organization: `${SITE_URL}/#organization`,
} as const;

export function organizationJsonLd(): Json {
  return {
    "@type": "Organization",
    "@id": IDS.organization,
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/favicon.svg"),
    },
  };
}

export function websiteJsonLd(): Json {
  return {
    "@type": "WebSite",
    "@id": IDS.website,
    name: SITE_NAME,
    alternateName: `${SITE_NAME} — ${SITE_TAGLINE}`,
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
    inLanguage: SITE_LANG,
    publisher: { "@id": IDS.organization },
  };
}

export type Crumb = { name: string; url: string };

export function breadcrumbJsonLd(crumbs: Crumb[]): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.url),
    })),
  };
}

/**
 * A tool page is a real piece of software you can operate in the browser,
 * so WebApplication (a SoftwareApplication subtype) is the honest type here.
 */
export function toolApplicationJsonLd(tool: Tool, description: string): Json {
  return {
    "@type": "WebApplication",
    "@id": `${toolUrl(tool.id)}#app`,
    name: tool.name,
    url: toolUrl(tool.id),
    description,
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: tool.category,
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires JavaScript.",
    inLanguage: SITE_LANG,
    isAccessibleForFree: true,
    // Free to use, no purchase — expressed the way Google expects.
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: { "@id": IDS.organization },
    isPartOf: { "@id": IDS.website },
  };
}

export type Faq = { q: string; a: string };

export function faqJsonLd(faqs: Faq[]): Json {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

/**
 * The homepage lists every tool; ItemList lets search engines and answer
 * engines read the catalogue without executing the client-side filter UI.
 */
export function toolListJsonLd(): Json {
  return {
    "@type": "ItemList",
    name: `${SITE_NAME} — all ${TOOL_COUNT} tools`,
    numberOfItems: TOOL_COUNT,
    itemListElement: tools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.name,
      description: tool.description,
      url: toolUrl(tool.id),
    })),
  };
}

export function collectionPageJsonLd(): Json {
  return {
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/#webpage`,
    url: absoluteUrl("/"),
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    inLanguage: SITE_LANG,
    isPartOf: { "@id": IDS.website },
    about: categories.map((category) => ({ "@type": "Thing", name: category })),
  };
}

/** Wrap nodes in a single @graph so one script tag carries the whole page. */
export function graph(nodes: Json[]): Json {
  return { "@context": "https://schema.org", "@graph": nodes };
}
