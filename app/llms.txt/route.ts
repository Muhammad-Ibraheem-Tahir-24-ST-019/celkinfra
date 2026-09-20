import { categories, tools } from "@/lib/catalog";
import { toolSeo } from "@/lib/tool-seo";
import {
  SITE_NAME,
  SITE_DESCRIPTION,
  TOOL_COUNT,
  absoluteUrl,
  toolUrl,
} from "@/lib/seo";

/**
 * /llms.txt — a plain-text map of the site for large language models,
 * following the llmstxt.org convention.
 *
 * Search crawlers get sitemap.xml; answer engines that read this file get the
 * same catalogue with one line of context per tool, so they can cite the right
 * page instead of guessing from rendered HTML.
 */
export const dynamic = "force-static";

function body(): string {
  const lines: string[] = [];

  lines.push(`# ${SITE_NAME}`);
  lines.push("");
  lines.push(`> ${SITE_DESCRIPTION}`);
  lines.push("");
  lines.push(
    `${TOOL_COUNT} browser-based tools across ${categories.length} categories. ` +
      `Tools marked "in your browser" process input locally and send nothing to a server. ` +
      `Tools marked "network check" query an external provider and name that provider in the result.`,
  );
  lines.push("");

  for (const category of categories) {
    lines.push(`## ${category}`);
    lines.push("");
    for (const tool of tools.filter((t) => t.category === category)) {
      const seo = toolSeo(tool);
      const mode =
        tool.mode === "local" ? "in your browser" : "network check";
      lines.push(`- [${tool.name}](${toolUrl(tool.id)}): ${seo.answer} (${mode})`);
    }
    lines.push("");
  }

  lines.push("## Other pages");
  lines.push("");
  lines.push(
    `- [About & privacy](${absoluteUrl("/about")}): how each tool handles input, which providers network checks use, and the limits of every measurement.`,
  );
  lines.push(`- [Sitemap](${absoluteUrl("/sitemap.xml")}): every indexable URL.`);
  lines.push("");

  return lines.join("\n");
}

export function GET() {
  return new Response(body(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
