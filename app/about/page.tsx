import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Globe2,
  Megaphone,
  ScanSearch,
  HeartHandshake,
  Layers3,
  Zap,
  LockKeyhole,
} from "lucide-react";
import { Header, Footer } from "../workspace";
import { AdSlot } from "../ads";
import JsonLd from "../json-ld";
import {
  SITE_NAME,
  SITE_LOCALE,
  TOOL_COUNT,
  graph,
  breadcrumbJsonLd,
} from "@/lib/seo";

const TITLE = "About & Privacy";
const DESCRIPTION =
  `How ${SITE_NAME} handles your input: which of the ${TOOL_COUNT} tools run entirely ` +
  `in your browser, which providers the network checks use, and how to read the results.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "article",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    url: "/about",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function Page() {
  return (
    <div id="top">
      <JsonLd
        data={graph([
          breadcrumbJsonLd([
            { name: "Tools", url: "/" },
            { name: TITLE, url: "/about" },
          ]),
        ])}
      />
      <Header />
      <main className="about-page">
        <AdSlot position="top" />
        <Link href="/" className="backlink">
          Back to tools
        </Link>
        <div className="about-hero">
          <span className="eyebrow">BUILT FOR EVERYDAY PROBLEM SOLVING</span>
          <h1>
            A clearer view of
            <br />
            <span>your connected world.</span>
          </h1>
          <p>
            Meet Bmaikr Tools. One thoughtful workspace for the small checks
            that make a big difference.
          </p>
          <Link href="/" className="primary-button">
            Explore the tools <ArrowRight size={16} />
          </Link>
          <div className="about-stats">
            <div>
              <strong>60</strong>
              <span>Focused utilities</span>
            </div>
            <div>
              <strong>5</strong>
              <span>Tool categories</span>
            </div>
            <div>
              <strong>Light + dark</strong>
              <span>Your preferred workspace</span>
            </div>
          </div>
        </div>
        <div className="about-values">
          <div>
            <Zap />
            <h2>Less friction</h2>
            <p>
              Find a tool, enter your details and get an answer. No account
              needed for public tools.
            </p>
          </div>
          <div>
            <ScanSearch />
            <h2>Understand the result</h2>
            <p>
              Purpose, output and data sources are explained alongside the tool.
            </p>
          </div>
          <div>
            <LockKeyhole />
            <h2>Local when possible</h2>
            <p>
              Calculators, formatters and generators process your input in your
              browser.
            </p>
          </div>
        </div>
        <section className="about-story">
          <span className="eyebrow">THE TOOLKIT</span>
          <h2>Practical tools. Clear answers.</h2>
          <p>
            Bmaikr Tools brings together 60 DNS, IP, developer, webmaster and
            network utilities. Tools explain their source, scope and limitations
            so you can interpret the evidence.
          </p>
        </section>
        <div className="about-detail-grid">
          <section className="about-detail">
            <ShieldCheck />
            <h2>Your input and privacy</h2>
            <p>
              Browser-based calculators, text formatters and generators process
              input locally. Network lookups send the entered target to the
              relevant provider: Google Public DNS, Globalping, RDAP registries,
              ipwho.is, MACVendors, and the listed blocklist providers. These
              services apply their own policies and limits.
            </p>
            <p>
              Globalping measurements are public diagnostics. Do not submit
              confidential hostnames, private URL tokens or other secrets. No
              tool input is intentionally stored in our application database.
              Rate-limit counters use a connection or user identifier and expire
              after a short interval. Hosting providers may maintain operational
              logs.
            </p>
          </section>
          <section className="about-detail">
            <Megaphone />
            <h2>Advertising</h2>
            <p>
              Unused ad placements are hidden and do not contact advertising
              providers. If enabled by the administrator, banner images,
              sponsored links or AdSense placements can appear. AdSense may use
              cookies or similar identifiers according to your consent settings
              and Google’s policies. Sensitive text tools and administration
              pages exclude third-party ad scripts.
            </p>
          </section>
          <section className="about-detail">
            <Globe2 />
            <h2>Interpreting checks</h2>
            <p>
              DNS and connectivity measurements are samples at a particular
              time. IP locations are approximate. Email verification does not
              guarantee mailbox existence or delivery. Server headers do not
              reliably identify an operating system. Google PageRank has no
              verified public data feed here, so we do not fabricate a score.
            </p>
          </section>
          <section className="about-detail">
            <HeartHandshake />
            <h2>Responsible use</h2>
            <p>
              Use network diagnostics for systems you own or are authorized to
              inspect. Requests are bounded and rate-limited. Results may be
              incomplete when a provider is unavailable, a response is
              truncated, or a target blocks diagnostic traffic.
            </p>
          </section>
        </div>
        <div className="about-cta">
          <Layers3 size={28} />
          <div>
            <h2>Your next answer is a tool away.</h2>
            <p>Explore DNS, IP, developer, webmaster and network utilities.</p>
          </div>
          <Link href="/" className="primary-button">
            Find your tool <ArrowRight size={16} />
          </Link>
        </div>
        <AdSlot position="above-footer" />
      </main>
      <Footer />
    </div>
  );
}
