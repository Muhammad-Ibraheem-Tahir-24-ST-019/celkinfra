import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { tools } from "@/lib/catalog";
import { toolSeo } from "@/lib/tool-seo";
import {
  toolPath,
  categoryPath,
  graph,
  breadcrumbJsonLd,
  toolApplicationJsonLd,
  faqJsonLd,
  SITE_NAME,
  SITE_LOCALE,
} from "@/lib/seo";
import JsonLd from "../../json-ld";
import ToolWorkspace from "../../tool-workspace";

/** Pre-render all 60 tool routes instead of resolving them on demand. */
export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = tools.find((t) => t.id === slug);

  if (!tool) {
    return {
      title: "Tool not found",
      // A 404 must never be indexed, whatever links to it.
      robots: { index: false, follow: true },
    };
  }

  const seo = toolSeo(tool);
  const canonical = toolPath(tool.id);

  return {
    // `absolute` skips the layout's "%s — Bmaikr Tools" template. Google now
    // renders the site name beside the title itself, taken from og:site_name
    // and the WebSite schema (both emitted), so repeating the brand here only
    // spends ~15 characters of a budget that truncates around 60.
    title: { absolute: seo.title },
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical },
    openGraph: {
      // openGraph replaces the layout's object wholesale (metadata is
      // shallow-merged), so siteName and locale are repeated here.
      type: "website",
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      url: canonical,
      title: seo.title,
      description: seo.description,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = tools.find((t) => t.id === slug);
  if (!tool) notFound();

  const seo = toolSeo(tool);

  const nodes = [
    toolApplicationJsonLd(tool, seo.description),
    breadcrumbJsonLd([
      { name: "Tools", url: "/" },
      { name: tool.category, url: categoryPath(tool.category) },
      { name: tool.name, url: toolPath(tool.id) },
    ]),
  ];

  // Only emit FAQPage when there are real questions on the page to back it up.
  if (seo.faqs.length) nodes.push(faqJsonLd(seo.faqs));

  return (
    <>
      <JsonLd data={graph(nodes)} />
      <ToolWorkspace key={tool.id} tool={tool} seo={seo} />
    </>
  );
}
