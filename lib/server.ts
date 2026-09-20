import { env } from "cloudflare:workers";
export const runtime = () =>
  env as unknown as {
    DB?: D1Database;
    ADMIN_EMAILS?: string;
    GLOBALPING_TOKEN?: string;
    PROBE_SERVICE_URL?: string;
    PROBE_SERVICE_TOKEN?: string;
    IPINFO_TOKEN?: string;
  };
export function db() {
  const d = runtime().DB;
  if (!d) throw Error("Storage is unavailable. Please try again shortly.");
  return d;
}
export async function rateLimit(request: Request, poll = false) {
  const d = db(),
    now = Date.now(),
    window = Math.floor(now / 60000);
  const key =
    (request.headers.get("oai-authenticated-user-id") ||
      request.headers.get("cf-connecting-ip") ||
      "local") +
    ":" +
    window;
  const row = await d
    .prepare(
      "INSERT INTO rate_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count",
    )
    .bind(key, now + 120000)
    .first<{ count: number }>();
  if ((row?.count ?? 999) > (poll ? 120 : 40))
    throw Error("Too many requests. Please wait a minute before trying again.");
  if (Math.random() < 0.02)
    await d
      .prepare("DELETE FROM rate_limits WHERE expires < ?")
      .bind(now)
      .run();
}
export function isAdmin(request: Request) {
  const email = request.headers
    .get("oai-authenticated-user-email")
    ?.toLowerCase();
  return (
    !!request.headers.get("oai-authenticated-user-id") &&
    !!email &&
    (runtime().ADMIN_EMAILS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .includes(email)
  );
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin)
    throw Error("This action must be submitted from this website.");
}
