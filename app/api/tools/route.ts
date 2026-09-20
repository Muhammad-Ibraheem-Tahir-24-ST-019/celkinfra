import { z } from "zod";
import { tools } from "@/lib/catalog";
import { fields } from "@/lib/fields";
import { rateLimit, sameOrigin } from "@/lib/server";
import { runNetwork, pollMeasurement } from "@/lib/network";
export const dynamic = "force-dynamic";
const schema = z.object({
  tool: z.string().max(50),
  values: z.record(z.string().max(200000)),
});
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    if (Number(req.headers.get("content-length") || 0) > 250000)
      return Response.json({ error: "Input is too large." }, { status: 413 });
    const raw = await req.text();
    if (raw.length > 250000) throw Error("Input is too large.");
    const data = schema.parse(JSON.parse(raw));
    const tool = tools.find((t) => t.id === data.tool);
    if (!tool || tool.mode === "local")
      throw Error("Choose a valid network tool.");
    const config = fields(tool);
    const values = {
      ...Object.fromEntries(
        config.map((field) => [field.key, field.value || ""]),
      ),
      ...data.values,
    };
    if (config.some((field) => field.key === "input") && !values.input?.trim())
      throw Error("Enter a target before running this check.");
    await rateLimit(req);
    const result = await runNetwork(data.tool, values, req);
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "The check could not be completed.";
    return Response.json(
      { error: message },
      {
        status: message.includes("Too many") ? 429 : 400,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
export async function GET(req: Request) {
  try {
    await rateLimit(req, true);
    const p = new URL(req.url).searchParams;
    return Response.json(
      await pollMeasurement(
        p.get("id") || "",
        p.get("tool") || "",
        p.get("expected") || "",
      ),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Unable to retrieve results." },
      { status: 400 },
    );
  }
}
