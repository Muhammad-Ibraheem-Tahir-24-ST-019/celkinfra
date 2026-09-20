# SEO & AEO

What is implemented, and the one thing you must configure before going live.

## Required: set the canonical domain

Everything that needs an absolute URL — canonical tags, `sitemap.xml`, `robots.txt`,
Open Graph URLs and every JSON-LD `@id` — is built from a single value.

Set it before building:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com npm run build
```

On Cloudflare, add `NEXT_PUBLIC_SITE_URL` as a build-time environment variable.

If it is unset, the build falls back to `SITE_URL_FALLBACK` in
[`lib/seo.ts`](lib/seo.ts). **Shipping with the wrong value publishes wrong
canonical tags**, which is worse than publishing none, so set it or edit the
fallback. The value is read at build time, not at runtime — changing it needs a
rebuild.

## What is in place

| Area | Where |
|---|---|
| Site config, absolute URLs, JSON-LD builders | `lib/seo.ts` |
| Per-tool title, description, keywords, answer, FAQs (all 60) | `lib/tool-seo.ts` |
| `sitemap.xml` — 62 URLs, admin and API excluded | `app/sitemap.ts` |
| `robots.txt` — AI crawlers allowed, `/admin` + `/api/` disallowed | `app/robots.ts` |
| `llms.txt` — catalogue for answer engines | `app/llms.txt/route.ts` |
| `manifest.webmanifest` | `app/manifest.ts` |
| Title template, Open Graph, Twitter, robots directives, site JSON-LD | `app/layout.tsx` |
| Per-tool metadata, canonical, static params, page JSON-LD | `app/tools/[slug]/page.tsx` |
| Answer-first block, visible breadcrumb, FAQ section | `app/tool-workspace.tsx` |

### Structured data emitted

- Every page: `WebSite` + `Organization` (from the root layout, referenced by `@id`).
- Homepage: `CollectionPage` + `ItemList` of all 60 tools — the grid is filtered
  client-side, so the catalogue is published as data for crawlers.
- Tool pages: `WebApplication` + `BreadcrumbList` + `FAQPage`.
- `/about`: `BreadcrumbList`.

`FAQPage` is emitted only when the page actually renders those questions. Google
retired FAQ rich results for most sites in 2023, so this is here for answer
engines and for matching visible content — do not expect FAQ snippets in Google.
`HowTo` is deliberately not emitted; Google retired it entirely.

### Notes on specific choices

- **No canonical on the root layout.** Next.js merges metadata *shallowly*, so a
  canonical set there is inherited verbatim by every page that does not override
  it. Each page declares its own.
- **`openGraph` is repeated per page**, including `siteName` and `locale`, for
  the same reason — a child's `openGraph` replaces the parent's, it is not merged.
- **Tool titles use `title: { absolute }`**, skipping the brand suffix. Google
  renders the site name separately from `og:site_name` and the `WebSite` schema,
  so repeating it would spend ~15 characters of a budget that truncates near 60.
- **`/admin` is `noindex`**, not just disallowed. `robots.txt` stops crawling but
  a URL linked from elsewhere can still be indexed; only `noindex` prevents that.
- **`lib/tool-seo.ts` never reaches the browser.** It is imported by server
  components only, and only the current tool's entry is serialised into the page.

## Verifying

```bash
npm run seo:check
```

Asserts all 60 tools have hand-written content, that titles and descriptions are
within length limits, and that no two pages share a title or description.

To audit the running site end to end, build, start it, and check that every URL
in the sitemap returns 200 with a unique self-referencing canonical, one `h1`,
and parseable JSON-LD:

```bash
npm run build && npm start
```

## Not included

The content plan calls for pillar articles cross-linked to each tool. No
`/articles` route exists yet — the tool pages carry the answer-first and FAQ
content, which covers the thin-content risk, but the article layer is still to
be built.
