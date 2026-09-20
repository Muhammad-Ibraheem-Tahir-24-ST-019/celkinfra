<div align="center">

# Bmaikr Tools

**60 free DNS, IP, developer and network tools — in one fast, source-attributed web app.**

Check DNS propagation across the globe, look up an IP, inspect HTTP headers, test a port,
validate SPF/DKIM/DMARC, or crunch IPv6 subnets. Every result shows **where the data came from**
and **when it was measured**.

[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## Table of contents

- [Why this exists](#why-this-exists)
- [Highlights](#highlights)
- [The 60 tools](#the-60-tools)
- [Architecture](#architecture)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [SEO and AEO](#seo-and-aeo)
- [Admin panel](#admin-panel)
- [Security model](#security-model)
- [Project structure](#project-structure)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

---

## Why this exists

Most "free network tools" sites are a maze of interstitials, stale data and results you cannot
trace back to anything. This one is built on three rules:

1. **Say where the answer came from.** Every result carries a `source` and a `checkedAt`
   timestamp — Google Public DNS, Globalping probes, RDAP registries, and so on.
2. **Don't send data to a server that doesn't need it.** 24 of the 60 tools run entirely in the
   browser. Your JSON, email headers and subnet maths never leave your machine.
3. **Be fast everywhere.** The whole app runs at the edge on Cloudflare Workers, with the tool
   catalogue statically generated so every tool page is a cache hit.

## Highlights

| | |
|---|---|
| **60 tools, 5 categories** | DNS, IP, Dev, Webmasters and Network tooling under one consistent UI |
| **24 browser-only tools** | Subnet maths, JSON, Base64/MD5, IPv6 conversion, generators — zero network round-trip |
| **Global probe network** | Ping, traceroute, port and SMTP checks run from real probes via [Globalping](https://globalping.io) |
| **Source-attributed results** | Every answer records its provider and measurement time |
| **Answer-first pages** | Each tool page opens with a direct answer, then FAQs — built for humans *and* answer engines |
| **Hand-written SEO for all 60** | Unique title, description, keywords, answer and FAQs per tool, length-validated in CI |
| **Structured data throughout** | `WebSite`, `Organization`, `CollectionPage`, `ItemList`, `WebApplication`, `BreadcrumbList`, `FAQPage` |
| **Built-in ad management** | Five placements, AdSense or house sponsors, per-category and per-path targeting, editable from `/admin` |
| **Edge-native** | Next.js 16 on Cloudflare Workers via vinext, with D1 for settings and rate limiting |
| **Dark mode, keyboard-first** | `next-themes`, command palette, fully responsive shadcn/Radix UI |

## The 60 tools

Modes: **`local`** = runs entirely in your browser · **`probe`** = measured from a real global
probe · **server** = server-side lookup against a named data provider.

<details open>
<summary><strong>DNS Tools (14)</strong></summary>

| Tool | What it does | Mode |
|---|---|---|
| DNS Propagation | Compare DNS answers across public resolvers | server |
| DNS Validation | Find configuration issues in your DNS records | server |
| DNS Lookup | Inspect the DNS records behind a domain | server |
| Reverse IP Lookup | Find the hostname associated with an IP | server |
| CNAME Lookup | Follow a domain's canonical name records | server |
| NS Lookup | Find the nameservers responsible for a domain | server |
| MX Lookup | Find mail servers and delivery priorities | server |
| SPF Record Checker | Inspect sender policies and lookup limits | server |
| DKIM Checker | Look up a domain's email signing key | server |
| DMARC Checker | Check email policy, alignment and reporting | server |
| DMARC Generator | Create a DMARC record with guided settings | `local` |
| Domain Health | Review DNS and email configuration together | server |
| DNSKEY Lookup | Inspect the public keys used by DNSSEC | server |
| DS Lookup | Look up delegation signer records | server |

</details>

<details>
<summary><strong>IP Tools (22)</strong></summary>

| Tool | What it does | Mode |
|---|---|---|
| Ping IPv4 | Measure reachability and latency over IPv4 | `probe` |
| Ping IPv6 | Measure reachability and latency over IPv6 | `probe` |
| Traceroute | Inspect network hops to an IP or domain | `probe` |
| What Is My IP? | See your connection's public IP address | auto |
| What Is My ISP? | Identify the network behind your connection | auto |
| IP Location | Look up the approximate location of an IP | server |
| IP WHOIS Lookup | Find allocation and registration information | server |
| IPv6 WHOIS Lookup | Inspect registration details for IPv6 | server |
| IP to Hostname | Resolve reverse DNS for an IP address | server |
| Domain to IP | Resolve a domain's IPv4 and IPv6 addresses | server |
| Blacklist Check | Check an address against DNS blocklists | server |
| IPv6 Compatibility | Check IPv6 DNS and connectivity signals | server |
| Email Header Analyzer | Inspect mail routing and authentication | `local` |
| IP Subnet Calculator | Calculate network ranges and host capacity | `local` |
| IP to Decimal | Convert an IP address to an integer | `local` |
| IPv4 to IPv6 | Create an IPv4-mapped IPv6 representation | `local` |
| IPv6 to IPv4 | Extract IPv4 from a mapped IPv6 address | `local` |
| IPv6 Compression | Shorten IPv6 addresses into canonical notation | `local` |
| IPv6 Expand | Expand all eight groups of an IPv6 address | `local` |
| IPv6 CIDR to Range | Calculate an IPv6 network's boundaries | `local` |
| IPv6 Range to CIDR | Represent an IPv6 range as CIDR blocks | `local` |
| Local IPv6 Generator | Generate a random unique local IPv6 prefix | `local` |

</details>

<details>
<summary><strong>Dev Tools (14)</strong></summary>

| Tool | What it does | Mode |
|---|---|---|
| HTTP Headers | Inspect response headers and redirects | server |
| Website Server Software | Inspect the server signals a website exposes | server |
| Broken Link Checker | Find unreachable links on a web page | server |
| Open Graph Checker | Inspect social metadata and generate tags | server |
| SMTP Test | Inspect mail server connectivity and capabilities | `probe` |
| Email Verifier | Check syntax and domain delivery signals | server |
| JSON Formatter | Validate, beautify and minify JSON | `local` |
| MD5 and Base64 | Hash or encode text in your browser | `local` |
| Binary to Text | Decode binary bytes into UTF-8 text | `local` |
| Text to Binary | Encode UTF-8 text as binary bytes | `local` |
| HTACCESS Redirect Generator | Generate Apache redirect rules | `local` |
| URL Rewrite Generator | Create rules for clean URL patterns | `local` |
| Multi URL Opener | Prepare and open a list of website URLs | `local` |
| RAID Calculator | Estimate usable storage and fault tolerance | `local` |

</details>

<details>
<summary><strong>Webmasters Tools (6)</strong></summary>

| Tool | What it does | Mode |
|---|---|---|
| Website Link Analyzer | Inspect internal links, external links and anchors | server |
| PageRank Checker | Check authoritative rank availability | server |
| Google SERP Simulator | Preview a page title and search description | `local` |
| Robots.txt Generator | Generate crawler and sitemap directives | `local` |
| Punycode Converter | Convert international domain names to ASCII | `local` |
| User Agent | Inspect browser and display information | `local` |

</details>

<details>
<summary><strong>Network Tools (4)</strong></summary>

| Tool | What it does | Mode |
|---|---|---|
| Port Checker | Check whether a public TCP port accepts connections | `probe` |
| ASN WHOIS Lookup | Find autonomous system registration information | server |
| MAC Address Lookup | Find the registered vendor for a MAC prefix | server |
| MAC Address Generator | Generate locally administered unicast addresses | `local` |

</details>

Every tool lives at `/tools/<id>`, and the ids are the single source of truth in
[`lib/catalog.ts`](lib/catalog.ts).

## Architecture

```
                         +------------------------------+
  Browser                |  Cloudflare Worker (edge)    |
  +--------------+       |                              |
  | 24 local     |       |  Next.js 16 via vinext       |
  | tools run    |       |  |- / and /tools/[slug]      |  statically generated
  | here, no     |------>|  |- POST /api/tools          |  run a network check
  | request sent |       |  |- GET  /api/tools?id=...   |  poll a probe measurement
  +--------------+       |  +- /api/ads                 |  ad + sponsor config
                         |                              |
                         |  D1 (Drizzle)                |
                         |  |- settings                 |
                         |  |- rate_limits              |
                         |  +- audit_log                |
                         +---------------+--------------+
                                         |
          +-------------------+----------+--------+------------------+
          v                   v                   v                  v
   dns.google (DoH)    api.globalping.io     rdap.org          ipwho.is /
   DNS record data     probe measurements    registry data     api.macvendors.com
```

**Request path for a network tool**

1. The client POSTs `{ tool, values }` to `/api/tools`.
2. The route enforces same-origin, a 250 KB body cap, Zod validation and a per-minute rate limit.
3. `lib/network.ts` dispatches to the tool's handler, which calls the relevant provider.
4. Probe-based tools return a `measurementId`; the client polls `GET /api/tools?id=...` until the
   measurement completes.
5. The response is a typed `Result` — summary, rows, metrics, notes, code, source, `checkedAt`.

**Key modules**

| File | Responsibility |
|---|---|
| `lib/catalog.ts` | The 60-tool catalogue — single source of truth for routes, nav, sitemap and JSON-LD |
| `lib/fields.ts` | Per-tool input field definitions |
| `lib/network.ts` | Server-side tool implementations and provider calls |
| `lib/local.ts` | Browser-side tool implementations |
| `lib/server.ts` | Worker env access, D1 handle, rate limiting, admin check, same-origin guard |
| `lib/seo.ts` | Canonical URLs, site metadata and JSON-LD builders |
| `lib/tool-seo.ts` | Hand-written title / description / answer / FAQs for each of the 60 tools |
| `lib/ads-config.ts` | Zod-validated ad placement schema |
| `db/schema.ts` | Drizzle schema for `settings`, `rate_limits`, `audit_log` |

## Quick start

**Prerequisites:** Node.js `>= 22.13.0`. Works on Windows, macOS and Linux — no Bash required.

```bash
npm ci
npm run dev
```

The dev server starts on **http://localhost:5173** with HMR.

To run the real Worker build locally through Wrangler:

```bash
npm run build
npm start
```

`npm start` serves the built Worker on `127.0.0.1`, sharing `.wrangler/state` with the dev server
and local D1 migrations. Use the URL the server prints.

## Configuration

### Build-time

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | **Yes, before going live** | Canonical origin for `<link rel="canonical">`, `sitemap.xml`, `robots.txt`, Open Graph URLs and every JSON-LD `@id`. Read at **build** time — changing it requires a rebuild. |

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com npm run build
```

If unset, the build falls back to `SITE_URL_FALLBACK` in [`lib/seo.ts`](lib/seo.ts).
**Shipping the wrong value publishes wrong canonical tags, which is worse than publishing none** —
set the variable or edit the fallback.

### Runtime (Worker bindings and secrets)

| Variable | Required | Purpose |
|---|---|---|
| `DB` | Yes | D1 binding for settings, rate limits and the audit log |
| `ADMIN_EMAILS` | For `/admin` | Comma-separated allowlist of admin email addresses |
| `GLOBALPING_TOKEN` | Optional | Raises Globalping quotas for ping, traceroute, port and SMTP checks |
| `IPINFO_TOKEN` | Optional | Higher-accuracy IP geolocation |
| `PROBE_SERVICE_URL` | Optional | Point probe-based tools at your own probe service |
| `PROBE_SERVICE_TOKEN` | Optional | Auth token for the above |

Copy [`.env.example`](.env.example) to `.env` for local development, and set production values as
Worker secrets (`wrangler secret put ...`) or in the Cloudflare dashboard. `.env*` is gitignored.

### Branding

Site name, tagline, locale and description live in [`lib/seo.ts`](lib/seo.ts):

```ts
export const SITE_NAME = "Bmaikr Tools";
export const SITE_TAGLINE = "DNS, IP, Developer & Network Tools";
```

## Deployment

Built for **Cloudflare Workers**:

```bash
npm run build
npm run deploy
```

Before the first deploy:

1. Create a D1 database and bind it as `DB`.
2. Apply the migration in [`drizzle/`](drizzle/) (regenerate with `npm run db:generate`).
3. Set `NEXT_PUBLIC_SITE_URL` as a build-time variable, plus the runtime secrets above.

## SEO and AEO

This is not an afterthought — see [`SEO.md`](SEO.md) for the full write-up. In place:

- `sitemap.xml` with 62 URLs (admin and API excluded), `robots.txt` that allows AI crawlers and
  blocks `/admin` and `/api/`, an `llms.txt` catalogue for answer engines, and a web manifest.
- Hand-written, unique, length-checked title / description / keywords / answer / FAQs for all 60
  tools, with an answer-first block and a visible breadcrumb on every tool page.
- Structured data: `WebSite` + `Organization` site-wide, `CollectionPage` + `ItemList` on the
  homepage, `WebApplication` + `BreadcrumbList` + `FAQPage` on tool pages.

Verify before every release:

```bash
npm run seo:check
```

It fails if any tool is missing hand-written content, if a title or description falls outside the
length Google renders, or if two pages share a title or description.

## Admin panel

`/admin` manages ad placements and site settings, stored in D1 and recorded in `audit_log`.

Access requires **both** an authenticated session and an email present in `ADMIN_EMAILS`. The route
is `noindex, nofollow, nocache` *and* disallowed in `robots.txt` — `robots.txt` alone only stops
crawling, not indexing of a URL linked from elsewhere.

Ad placements (`top`, `left`, `right`, `below-tool`, `above-footer`) each support four modes —
`off`, `reserved`, `sponsor` (house creative) and `adsense` — with device targeting, category
targeting and path exclusions, all validated by a Zod schema before being persisted.

## Security model

| Control | Where |
|---|---|
| Same-origin enforcement on mutating API calls | `lib/server.ts` → `sameOrigin()` |
| Rate limiting: 40 requests/min per user or IP (120 for result polling) | `lib/server.ts` → `rateLimit()` |
| 250 KB request body cap, checked on both `content-length` and the raw body | `app/api/tools/route.ts` |
| Zod validation of every request payload and every admin setting | `app/api/*`, `lib/ads-config.ts` |
| Admin gated on authenticated identity **and** an explicit email allowlist | `lib/server.ts` → `isAdmin()` |
| Outbound provider calls capped with a 12s `AbortSignal.timeout` | `lib/network.ts` |
| HTTPS-only URLs enforced for sponsor creatives | `lib/ads-config.ts` |
| Admin actions written to an append-only audit log | `db/schema.ts` → `audit_log` |

## Project structure

```
.
├── app/
│   ├── page.tsx                # Homepage — catalogue grid + CollectionPage JSON-LD
│   ├── layout.tsx              # Title template, OG/Twitter, site-wide JSON-LD
│   ├── tools/[slug]/page.tsx   # Per-tool page: metadata, canonical, static params
│   ├── tool-workspace.tsx      # Tool UI: answer-first block, breadcrumb, results, FAQs
│   ├── admin/                  # Admin panel (noindex)
│   ├── api/tools/route.ts      # Run a check / poll a measurement
│   ├── api/ads/route.ts        # Ad and sponsor configuration
│   ├── sitemap.ts              # 62 URLs
│   ├── robots.ts               # AI crawlers allowed; /admin and /api/ disallowed
│   ├── llms.txt/               # Catalogue for answer engines
│   ├── manifest.ts             # Web app manifest
│   └── json-ld.tsx             # Structured-data renderer
├── components/ui/              # shadcn / Radix component library
├── lib/                        # Catalogue, tool logic, SEO, config (see Architecture)
├── db/                         # Drizzle schema and D1 client
├── drizzle/                    # SQL migrations
├── scripts/check-seo-coverage.ts
├── public/
├── SEO.md                      # SEO/AEO implementation notes
└── vite.config.ts              # vinext + Cloudflare plugin
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with HMR on port 5173 |
| `npm run build` | Production build |
| `npm start` | Serve the built Worker locally through Wrangler |
| `npm run deploy` | Deploy to Cloudflare Workers |
| `npm run lint` | ESLint over the source tree |
| `npm run seo:check` | Assert SEO/AEO coverage and metadata lengths for all 60 tools |
| `npm run db:generate` | Generate a Drizzle migration from `db/schema.ts` |

## Contributing

Adding a tool is four steps:

1. Add the entry to `lib/catalog.ts` — `[id, name, description, mode]` under a category.
2. Define its inputs in `lib/fields.ts`.
3. Implement it in `lib/local.ts` (browser) or `lib/network.ts` (server), returning a `Result`
   with a `source` and `checkedAt`.
4. Write its SEO entry in `lib/tool-seo.ts`, then run `npm run seo:check` — it fails until the
   entry exists and fits the length limits.

The route, navigation, sitemap, `llms.txt` and JSON-LD all derive from the catalogue, so there is
nothing else to register.

Before opening a pull request:

```bash
npm run lint && npm run seo:check && npm run build
```

## Acknowledgements

Measurement and reference data comes from
[Google Public DNS](https://dns.google),
[Globalping](https://globalping.io),
[RDAP](https://rdap.org),
[ipwho.is](https://ipwho.is) and
[macvendors.com](https://macvendors.com).

## License

Released under the [MIT License](LICENSE).
