import { db, isAdmin, sameOrigin } from "@/lib/server";
import { defaultAds, adSchema } from "@/lib/ads-config";
export async function GET(req: Request) {
  try {
    const r = await db()
      .prepare("SELECT value FROM settings WHERE key=?")
      .bind("ads")
      .first<{ value: string }>();
    return Response.json(
      {
        config: r ? adSchema.parse(JSON.parse(r.value)) : defaultAds,
        admin: isAdmin(req),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { config: defaultAds, admin: false, storageAvailable: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
export async function PUT(req: Request) {
  try {
    sameOrigin(req);
    if (!isAdmin(req))
      return Response.json(
        { error: "Administrator access is required." },
        { status: 403 },
      );
    const text = await req.text();
    if (text.length > 15000)
      return Response.json(
        { error: "Configuration is too large." },
        { status: 413 },
      );
    const config = adSchema.parse(JSON.parse(text));
    const actor = req.headers.get("oai-authenticated-user-id")!;
    await db().batch([
      db()
        .prepare(
          "INSERT INTO settings(key,value,updated_at,updated_by) VALUES(?,?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at,updated_by=excluded.updated_by",
        )
        .bind("ads", JSON.stringify(config), Date.now(), actor),
      db()
        .prepare(
          "INSERT INTO audit_log(id,actor,action,created_at) VALUES(?,?,?,?)",
        )
        .bind(
          crypto.randomUUID(),
          actor,
          "Updated advertising configuration",
          Date.now(),
        ),
    ]);
    return Response.json({ config });
  } catch (e) {
    return Response.json(
      {
        error: e instanceof Error ? e.message : "Unable to save configuration.",
      },
      { status: 400 },
    );
  }
}
