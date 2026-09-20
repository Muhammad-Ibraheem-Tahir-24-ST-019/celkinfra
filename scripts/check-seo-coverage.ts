/**
 * Verifies every catalogue tool has hand-written SEO/AEO content and that
 * the metadata stays within the lengths search engines actually render.
 *
 * Run with: npx tsx scripts/check-seo-coverage.ts
 */
import { tools } from "../lib/catalog";
import { toolSeo, coveredToolIds } from "../lib/tool-seo";
import { SITE_DESCRIPTION } from "../lib/seo";

// Tool pages render their title verbatim (no brand suffix), so this is the
// length Google actually sees. It truncates around 60 characters.
const TITLE_MAX = 60;
const DESC_MIN = 110;
const DESC_MAX = 165;

const problems: string[] = [];

if (SITE_DESCRIPTION.length > DESC_MAX) {
  problems.push(
    `SITE_DESCRIPTION is ${SITE_DESCRIPTION.length} chars (max ${DESC_MAX})`,
  );
}

const ids = new Set(tools.map((t) => t.id));

for (const tool of tools) {
  const seo = toolSeo(tool);
  if (!coveredToolIds.includes(tool.id)) {
    problems.push(`${tool.id}: no hand-written SEO entry (using fallback)`);
    continue;
  }
  if (seo.title.length > TITLE_MAX) {
    problems.push(`${tool.id}: title ${seo.title.length} chars (max ${TITLE_MAX})`);
  }
  if (seo.description.length < DESC_MIN || seo.description.length > DESC_MAX) {
    problems.push(
      `${tool.id}: description ${seo.description.length} chars (want ${DESC_MIN}-${DESC_MAX})`,
    );
  }
  if (seo.keywords.length < 3) {
    problems.push(`${tool.id}: only ${seo.keywords.length} keywords`);
  }
  if (seo.faqs.length < 3) {
    problems.push(`${tool.id}: only ${seo.faqs.length} FAQs`);
  }
  if (seo.answer.length < 120) {
    problems.push(`${tool.id}: answer too short (${seo.answer.length} chars)`);
  }
  for (const faq of seo.faqs) {
    if (!faq.q.trim().endsWith("?")) {
      problems.push(`${tool.id}: FAQ question is not a question: "${faq.q}"`);
    }
    if (faq.a.length < 60) {
      problems.push(`${tool.id}: FAQ answer too short: "${faq.q}"`);
    }
  }
}

for (const id of coveredToolIds) {
  if (!ids.has(id)) {
    problems.push(`${id}: SEO entry exists for a tool not in the catalogue`);
  }
}

// Duplicate titles or descriptions across pages are a real ranking problem.
const seenTitle = new Map<string, string>();
const seenDesc = new Map<string, string>();
for (const tool of tools) {
  const seo = toolSeo(tool);
  const t = seenTitle.get(seo.title);
  if (t) problems.push(`duplicate title shared by ${t} and ${tool.id}`);
  else seenTitle.set(seo.title, tool.id);
  const d = seenDesc.get(seo.description);
  if (d) problems.push(`duplicate description shared by ${d} and ${tool.id}`);
  else seenDesc.set(seo.description, tool.id);
}

console.log(`Catalogue tools: ${tools.length}`);
console.log(`SEO entries:     ${coveredToolIds.length}`);

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log("\nAll tools have complete, unique SEO/AEO content.");
