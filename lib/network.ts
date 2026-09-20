import { parseHTML } from "linkedom";
import { toASCII } from "punycode/";
import { parseIP, publicIP, reverseName } from "./ip";
import { runtime } from "./server";
import { Result, Values } from "./types";
type Any = Record<string, any>;
export function domain(s: string) {
  let x = s.trim();
  if (x.includes("://")) x = new URL(x).hostname;
  x = toASCII(x.replace(/\.$/, "").toLowerCase());
  if (
    x.length > 253 ||
    x.split(".").length < 2 ||
    x
      .split(".")
      .some(
        (l) =>
          !l ||
          l.length > 63 ||
          !/^[a-z0-9_-]+$/i.test(l) ||
          l.startsWith("-") ||
          l.endsWith("-"),
      )
  )
    throw Error("Enter a valid domain or hostname, such as example.com.");
  return x;
}
async function json(url: string, options: RequestInit = {}) {
  const r = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(12000),
  });
  if (!r.ok)
    throw Error(
      r.status === 429
        ? "The data provider is rate-limiting requests. Please try again later."
        : `The data provider returned HTTP ${r.status}.`,
    );
  return (await r.json()) as Any;
}
const recordNames: Record<number, string> = {
  1: "A",
  2: "NS",
  5: "CNAME",
  6: "SOA",
  12: "PTR",
  15: "MX",
  16: "TXT",
  28: "AAAA",
  33: "SRV",
  43: "DS",
  48: "DNSKEY",
  257: "CAA",
};
export async function dns(name: string, type: string): Promise<Any> {
  const start = Date.now();
  const data = await json(
    "https://dns.google/resolve?name=" +
      encodeURIComponent(name) +
      "&type=" +
      encodeURIComponent(type),
  );
  return { ...data, ms: Date.now() - start };
}
function dnsRows(q: Any) {
  return (q.Answer || []).map((a: Any) => ({
    Name: a.name,
    Type: recordNames[a.type] || String(a.type),
    Value: a.data,
    "TTL (s)": a.TTL,
  }));
}
const txt = (d: Any): string[] =>
  (d.Answer || [])
    .filter((a: Any) => a.type === 16)
    .map((a: Any) =>
      String(a.data).replace(/^"|"$/g, "").replace(/"\s*"/g, ""),
    );
function base(
  summary: string,
  rows: Any[] = [],
  notes: string[] = [],
  status: Result["status"] = "success",
  source = "Google Public DNS",
): Result {
  return {
    summary,
    rows,
    notes,
    status,
    source,
    checkedAt: new Date().toISOString(),
  };
}
async function query(name: string, type: string) {
  const d = await dns(name, type);
  const rows = dnsRows(d);
  return base(
    d.Status === 3
      ? "Domain does not exist"
      : d.Status !== 0
        ? "DNS server returned an error"
        : rows.length
          ? `${rows.length} records returned`
          : `No ${type} records returned`,
    rows,
    [
      `DNS response: ${["NOERROR", "FORMERR", "SERVFAIL", "NXDOMAIN", "NOTIMP", "REFUSED"][d.Status] || d.Status}. Authenticated data flag: ${d.AD ? "set" : "not set"}.`,
      `Query time: ${d.ms} ms. A missing optional record does not necessarily indicate a problem.`,
    ],
    d.Status !== 0 || !rows.length ? "warning" : "success",
  );
}
async function mailRecord(
  id: string,
  name: string,
  v: Values,
): Promise<Result> {
  const queryName =
    id === "dmarc"
      ? "_dmarc." + name
      : id === "dkim"
        ? (v.selector || "default") + "._domainkey." + name
        : name;
  if (id === "dkim" && !/^[\w.-]{1,120}$/.test(v.selector || "default"))
    throw Error("Enter a valid DKIM selector.");
  const d = await dns(queryName, "TXT");
  if (d.Status !== 0)
    return base(
      "DNS lookup did not return a usable response",
      dnsRows(d),
      [`Response code: ${d.Status}`],
      "warning",
    );
  const records = txt(d).filter((s) =>
    id === "spf"
      ? /^v=spf1(?:\s|$)/i.test(s)
      : id === "dmarc"
        ? /^v=DMARC1;/i.test(s)
        : /\bp=/.test(s),
  );
  if (records.length !== 1)
    return base(
      records.length
        ? "Multiple policy records found"
        : "No matching policy record found",
      dnsRows(d),
      ["Check the exact hostname and your provider’s configuration."],
      "warning",
    );
  const record = records[0];
  const tags = Object.fromEntries(
    record
      .split(";")
      .map((s) => s.trim().split(/=(.*)/s).slice(0, 2))
      .filter((a) => a.length === 2),
  );
  const notes: string[] = [];
  let warning = false;
  if (id === "dmarc") {
    if (!["none", "quarantine", "reject"].includes(tags.p)) {
      notes.push("Missing or invalid p policy.");
      warning = true;
    }
    if (tags.p === "none")
      notes.push(
        "Monitoring mode: messages are not rejected by this DMARC policy.",
      );
    if (tags.pct && (!/^\d+$/.test(tags.pct) || Number(tags.pct) > 100)) {
      notes.push("Invalid percentage.");
      warning = true;
    }
    for (const k of ["adkim", "aspf"])
      if (tags[k] && !["r", "s"].includes(tags[k])) {
        notes.push(`Invalid ${k} alignment.`);
        warning = true;
      }
    notes.push(
      "This checks published policy; it does not verify alignment on an actual email.",
    );
    return base(
      warning
        ? "DMARC configuration needs attention"
        : "DMARC record inspected",
      [
        { Name: queryName, Record: record },
        ...Object.entries(tags).map(([Tag, Value]) => ({ Tag, Value })),
      ],
      notes,
      warning ? "warning" : "success",
    );
  }
  if (id === "dkim") {
    if (!tags.p) {
      warning = true;
      notes.push("Empty public key: this selector is revoked or unusable.");
    }
    if (tags.p && !/^[A-Za-z0-9+/=\s]+$/.test(tags.p)) {
      warning = true;
      notes.push("Public key is not valid Base64 text.");
    }
    notes.push(
      "Published-key inspection only. Verifying a message signature requires the original signed message.",
    );
    return base(
      warning ? "DKIM key needs attention" : "DKIM key record found",
      [{ Name: queryName, Record: record }],
      notes,
      warning ? "warning" : "success",
    );
  }
  let lookups = 0,
    visited = 0;
  const paths = new Set<string>();
  const rows: Any[] = [{ Domain: name, Record: record }];
  async function walk(host: string, r: string, depth: number) {
    if (depth > 8 || visited++ > 15) {
      warning = true;
      notes.push("Expansion limit reached; inspection is incomplete.");
      return;
    }
    if (paths.has(host)) {
      warning = true;
      notes.push("SPF include/redirect loop detected at " + host);
      return;
    }
    paths.add(host);
    for (const token of r.split(/\s+/).slice(1)) {
      const normalized = token.replace(/^[+?~-]/, "");
      if (
        /^(include:|a(?::|\/|$)|mx(?::|\/|$)|ptr(?::|$)|exists:|redirect=)/.test(
          normalized,
        )
      )
        lookups++;
      const child = /^(?:include:|redirect=)(.+)$/.exec(normalized);
      if (child) {
        if (lookups > 10) {
          warning = true;
          break;
        }
        if (child[1].includes("%")) {
          notes.push("SPF macros need sender-specific evaluation.");
          warning = true;
          continue;
        }
        try {
          const target = domain(child[1]);
          const d = await dns(target, "TXT");
          const nested = txt(d).filter((s) => /^v=spf1(?:\s|$)/.test(s));
          if (nested.length !== 1) {
            warning = true;
            notes.push("Missing or ambiguous SPF policy at " + target);
          } else {
            rows.push({ Domain: target, Record: nested[0] });
            await walk(target, nested[0], depth + 1);
          }
        } catch {
          warning = true;
          notes.push("Unable to inspect SPF dependency " + child[1]);
        }
      }
    }
    paths.delete(host);
  }
  await walk(name, record, 0);
  notes.push(
    `${lookups} DNS-dependent terms found in expanded policies. This is a static expansion, not a sender-specific SPF verdict.`,
  );
  if (lookups > 10) {
    warning = true;
    notes.push("Expanded policy exceeds 10 DNS-dependent terms.");
  }
  if (
    !/(?:^|\s)[+?~-]?all(?:\s|$)/.test(record) &&
    !record.includes("redirect=")
  ) {
    warning = true;
    notes.push("No all mechanism or redirect modifier found.");
  }
  if (/(?:^|\s)\+?all(?:\s|$)/.test(record)) {
    warning = true;
    notes.push("Policy permits every sender through +all.");
  }
  return base(
    warning ? "SPF policy needs review" : "SPF policy inspected",
    rows,
    notes,
    warning ? "warning" : "success",
  );
}
export async function startMeasurement(id: string, v: Values): Promise<Result> {
  let target = v.input.trim();
  let parsed: ReturnType<typeof parseIP> | undefined;
  try {
    parsed = parseIP(target);
  } catch {}
  if (parsed) {
    if (!publicIP(target))
      throw Error("Only public internet addresses can be measured.");
  } else target = domain(target);
  if (id === "ping-ipv4" && parsed?.bits === 128)
    throw Error("Enter an IPv4 address or hostname.");
  if (id === "ping-ipv6" && parsed?.bits === 32)
    throw Error("Enter an IPv6 address or hostname.");
  const type =
    id === "dns-checker" ? "dns" : id === "traceroute" ? "traceroute" : "ping";
  const options: Any =
    type === "dns"
      ? {
          query: { type: v.record || "A" },
          ...(v.resolver && v.resolver !== "Default"
            ? { resolver: v.resolver }
            : {}),
        }
      : type === "ping"
        ? { packets: 3 }
        : {};
  if (
    type === "dns" &&
    !Object.values(recordNames).includes(options.query.type)
  )
    throw Error("Choose a supported DNS record type.");
  if (
    options.resolver &&
    !["8.8.8.8", "1.1.1.1", "9.9.9.9"].includes(options.resolver)
  )
    throw Error("Choose a supported resolver.");
  if (id === "port" || id === "smtp") {
    const port = Number(v.port);
    if (!Number.isInteger(port) || port < 1 || port > 65535)
      throw Error("Enter a port from 1 to 65535.");
    options.protocol = "TCP";
    options.port = port;
  }
  if (!parsed && (id === "ping-ipv4" || id === "ping-ipv6"))
    options.ipVersion = id === "ping-ipv6" ? 6 : 4;
  const region = ["Europe", "Asia", "North America"].includes(v.region)
    ? v.region
    : "World";
  const locations =
    region === "World"
      ? type === "dns"
        ? [{ continent: "EU" }, { continent: "AS" }, { continent: "NA" }]
        : [{ magic: "world" }]
      : [{ magic: region }];
  const d = await json("https://api.globalping.io/v1/measurements", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(runtime().GLOBALPING_TOKEN
        ? { Authorization: "Bearer " + runtime().GLOBALPING_TOKEN }
        : {}),
    },
    body: JSON.stringify({
      type,
      target,
      limit: type === "dns" ? 3 : 1,
      locations,
      measurementOptions: options,
      inProgressUpdates: true,
    }),
  });
  return {
    ...base(
      "Measurement started",
      [],
      [
        "Results appear as probes respond. Measurements use Globalping’s public infrastructure.",
      ],
      "success",
      "Globalping",
    ),
    measurementId: d.id,
    pending: true,
  };
}
export async function pollMeasurement(
  measurementId: string,
  tool: string,
  expected = "",
): Promise<Result> {
  if (!/^[a-zA-Z0-9_-]{5,100}$/.test(measurementId))
    throw Error("Invalid measurement ID.");
  const d = await json(
    "https://api.globalping.io/v1/measurements/" + measurementId,
  );
  const results = d.results || [];
  const rows = results.map((x: Any) => {
    const r = x.result || {},
      p = x.probe || {};
    const values = (r.answers || []).map((a: Any) => a.value ?? a.data);
    const row: Any = {
      Location: [p.city, p.country].filter(Boolean).join(", "),
      Network: p.network,
      Status: r.status || "Waiting",
    };
    if (tool === "dns-checker") {
      row.Resolver = r.resolver;
      row.Answer = values.join("\n");
      row["TTL (s)"] = (r.answers || []).map((a: Any) => a.ttl).join(", ");
      row.Match = expected
        ? values.some(
            (a: string) =>
              String(a).replace(/\.$/, "").toLowerCase() ===
              expected.replace(/\.$/, "").toLowerCase(),
          )
          ? "Match"
          : "No match"
        : "Not specified";
    } else if (tool === "traceroute") {
      row.Hops = (r.hops || []).length;
      row.Target = r.resolvedAddress || "";
    } else {
      row["Average (ms)"] = r.stats?.avg ?? "—";
      row["Loss (%)"] = r.stats?.loss ?? "—";
      row.Address = r.resolvedAddress || "";
    }
    if (r.error) row.Error = r.error;
    return row;
  });
  const failed = results.some(
    (x: Any) =>
      x.result?.status === "failed" ||
      x.result?.error ||
      x.result?.stats?.loss === 100,
  );
  const notes = [
    "Probe locations are actual measurement locations. These results sample the internet and do not prove worldwide availability.",
  ];
  if (tool === "smtp")
    notes.push(
      "TCP reachability only. To inspect the SMTP greeting and EHLO capabilities, connect the included dedicated probe service.",
    );
  if (tool === "port")
    notes.push(
      "TCP packet response indicates reachability. A firewall can affect results.",
    );
  return {
    ...base(
      d.status === "finished"
        ? "Measurement complete"
        : "Receiving probe results",
      rows,
      notes,
      failed ? "warning" : "success",
      "Globalping",
    ),
    measurementId,
    pending: d.status !== "finished",
    code: results
      .map((x: Any) =>
        [x.probe?.city, x.probe?.country, x.result?.rawOutput]
          .filter(Boolean)
          .join("\n"),
      )
      .join("\n\n"),
  };
}
async function httpDocument(raw: string): Promise<Any> {
  const u = new URL(raw.includes("://") ? raw : "https://" + raw);
  if (
    !["http:", "https:"].includes(u.protocol) ||
    u.username ||
    u.password ||
    (u.port && !["80", "443"].includes(u.port))
  )
    throw Error(
      "Use a public HTTP or HTTPS URL on port 80 or 443 without credentials.",
    );
  const hostname = domain(u.hostname);
  const r = runtime();
  if (r.PROBE_SERVICE_URL && r.PROBE_SERVICE_TOKEN)
    return json(r.PROBE_SERVICE_URL + "/http", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + r.PROBE_SERVICE_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: u.href }),
    });
  const d = await json("https://api.globalping.io/v1/measurements", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(r.GLOBALPING_TOKEN
        ? { Authorization: "Bearer " + r.GLOBALPING_TOKEN }
        : {}),
    },
    body: JSON.stringify({
      type: "http",
      target: hostname,
      limit: 1,
      measurementOptions: {
        request: { method: "GET", path: u.pathname, query: u.search.slice(1) },
        protocol: u.protocol === "https:" ? "HTTPS" : "HTTP",
        port: u.protocol === "https:" ? 443 : 80,
      },
    }),
  });
  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const result = await json(
      "https://api.globalping.io/v1/measurements/" + d.id,
    );
    if (result.status === "finished") {
      const item = result.results?.[0]?.result;
      if (!item || item.status === "failed")
        throw Error(item?.error || "The website could not be reached.");
      return {
        url: u.href,
        status: item.statusCode,
        headers: item.headers,
        body: item.rawBody || "",
        truncated: item.truncated,
        source: "Globalping",
        timings: item.timings,
      };
    }
  }
  throw Error(
    "The website check is taking longer than expected. Please retry.",
  );
}
async function httpTool(id: string, v: Values): Promise<Result> {
  const d = await httpDocument(v.input);
  if (id === "headers" || id === "server-os")
    return base(
      id === "headers" ? `HTTP ${d.status} response` : "Exposed server signals",
      Object.entries(d.headers || {})
        .filter(
          ([k]) => id === "headers" || /server|powered|via|cf-ray/i.test(k),
        )
        .map(([Header, Value]) => ({ Header, Value })),
      [
        id === "server-os"
          ? "Server headers cannot reliably establish the operating system. A proxy can hide the origin."
          : "Response headers are observed from the measuring server.",
        ...(d.truncated ? ["Provider response was truncated."] : []),
      ],
      d.status >= 400 ? "warning" : "success",
      d.source || "Dedicated probe",
    );
  const { document } = parseHTML(d.body);
  if (id === "open-graph") {
    const rows = Array.from(
      document.querySelectorAll(
        'meta[property^="og:"],meta[name^="twitter:"],meta[name="description"]',
      ),
    ).map((e: any) => ({
      Property: e.getAttribute("property") || e.getAttribute("name"),
      Content: e.getAttribute("content"),
    }));
    return base(
      rows.length
        ? "Social metadata inspected"
        : "No social metadata found in the returned HTML",
      rows,
      [
        "Previews can vary by platform.",
        ...(d.truncated
          ? [
              "Only the first 10 KB were available. Additional metadata may be missing.",
            ]
          : []),
      ],
      rows.length ? "success" : "warning",
      d.source,
    );
  }
  const baseURL = new URL(d.url);
  const links = Array.from(document.querySelectorAll("a[href]")).flatMap(
    (a: any) => {
      try {
        const u = new URL(a.getAttribute("href"), baseURL);
        if (!["http:", "https:"].includes(u.protocol)) return [];
        u.hash = "";
        return [
          {
            URL: u.href,
            Text: (a.textContent || "").trim().slice(0, 200),
            Type: u.hostname === baseURL.hostname ? "Internal" : "External",
            Rel: a.getAttribute("rel") || "—",
          },
        ];
      } catch {
        return [];
      }
    },
  );
  const unique = [...new Map(links.map((l) => [l.URL, l])).values()];
  if (id === "link-analyzer")
    return base(
      `${unique.length} links found`,
      unique.slice(0, 200),
      [
        ...(d.truncated
          ? [
              "Only the first 10 KB of HTML were available; the link inventory may be incomplete.",
            ]
          : []),
      ],
      d.truncated ? "warning" : "success",
      d.source,
    );
  const checked: Any[] = [];
  for (let i = 0; i < Math.min(unique.length, 8); i += 2) {
    await Promise.all(
      unique.slice(i, i + 2).map(async (l) => {
        try {
          const r = await httpDocument(l.URL);
          checked.push({
            ...l,
            Status: r.status,
            Result:
              r.status >= 400
                ? "Broken"
                : r.status >= 300
                  ? "Redirect"
                  : "Reachable",
          });
        } catch {
          checked.push({
            ...l,
            Status: "Unknown",
            Result: "Could not complete check",
          });
        }
      }),
    );
  }
  return base(
    `${checked.length} links checked`,
    checked,
    [
      `Checks are limited to eight unique links per run.${unique.length > 8 ? " Additional links were not checked." : ""}`,
      ...(d.truncated ? ["Source HTML was truncated by the provider."] : []),
    ],
    checked.some((r) => r.Status === "Unknown" || r.Status >= 400) ||
      d.truncated
      ? "warning"
      : "success",
    d.source,
  );
}
export async function runNetwork(
  id: string,
  v: Values,
  request: Request,
): Promise<Result> {
  if (id === "pagerank")
    return base(
      "Public Google PageRank is unavailable",
      [],
      [
        "There is no verified public Google PageRank feed configured. Bmaikr Tools does not invent an authority score. Use the link analyzer, search snippet preview and HTTP checks for observable data.",
      ],
      "unavailable",
      "Availability disclosure",
    );
  if (
    id === "smtp" &&
    runtime().PROBE_SERVICE_URL &&
    runtime().PROBE_SERVICE_TOKEN
  ) {
    const r = runtime();
    const p = Number(v.port);
    if (![25, 465, 587, 2525].includes(p))
      throw Error("SMTP checks support ports 25, 465, 587 and 2525.");
    const out = await json(r.PROBE_SERVICE_URL + "/smtp", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + r.PROBE_SERVICE_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ host: domain(v.input), port: p }),
    });
    return base(
      "SMTP handshake completed",
      out.rows,
      out.notes,
      "success",
      "Dedicated probe",
    );
  }
  if (
    [
      "dns-checker",
      "ping-ipv4",
      "ping-ipv6",
      "traceroute",
      "port",
      "smtp",
    ].includes(id)
  )
    return startMeasurement(id, v);
  if (
    [
      "headers",
      "server-os",
      "broken-links",
      "open-graph",
      "link-analyzer",
    ].includes(id)
  )
    return httpTool(id, v);
  if (id === "my-ip" || id === "my-isp") {
    const ip = request.headers.get("cf-connecting-ip");
    if (!ip || !publicIP(ip))
      return base(
        "Public address is not available in local preview",
        [],
        [
          "The hosted site reads your public IP from its trusted edge connection.",
        ],
        "unavailable",
        "Connection",
      );
    if (id === "my-ip")
      return base(
        "Your public IP address",
        [{ Address: ip, Version: ip.includes(":") ? "IPv6" : "IPv4" }],
        [
          "This is the address seen by this website. A VPN or proxy can change it.",
        ],
        "success",
        "Connection",
      );
    v = { ...v, input: ip };
    id = "ip-location";
  }
  if (["reverse-ip", "ip-hostname"].includes(id))
    return query(reverseName(v.input), "PTR");
  if (id === "ip-location") {
    const ip = v.input.trim();
    parseIP(ip);
    if (!publicIP(ip))
      throw Error("Location lookup requires a public IP address.");
    const d = await json("https://ipwho.is/" + encodeURIComponent(ip));
    if (d.success === false)
      throw Error(d.message || "IP information unavailable.");
    return base(
      "Approximate IP location",
      [
        {
          IP: ip,
          Country: d.country,
          Region: d.region,
          City: d.city,
          ISP: d.connection?.isp,
          Organization: d.connection?.org,
          ASN: d.connection?.asn,
          Timezone: d.timezone?.id,
        },
      ],
      [
        "Database estimate, not a precise physical location. VPNs and mobile networks affect accuracy.",
      ],
      "success",
      "ipwho.is",
    );
  }
  if (id === "ip-whois" || id === "ipv6-whois" || id === "asn") {
    let u;
    if (id === "asn") {
      const n = v.input.replace(/^AS/i, "");
      if (!/^\d+$/.test(n) || Number(n) > 4294967295 || Number(n) < 1)
        throw Error("Enter an ASN from 1 to 4294967295.");
      u = "https://rdap.org/autnum/" + n;
    } else {
      const p = parseIP(v.input);
      if (id === "ipv6-whois" && p.bits !== 128)
        throw Error("Enter an IPv6 address.");
      if (!publicIP(v.input)) throw Error("Enter a public IP address.");
      u = "https://rdap.org/ip/" + encodeURIComponent(v.input);
    }
    const d = await json(u);
    return {
      ...base(
        "Registration information retrieved",
        [
          {
            Name: d.name,
            Handle: d.handle,
            Country: d.country || "Not provided",
            Start: d.startAddress ?? d.startAutnum,
            End: d.endAddress ?? d.endAutnum,
            Type: d.type,
          },
        ],
        [
          "Registration addresses describe the registered organization, not the current device location.",
        ],
        "success",
        "RDAP registry",
      ),
      code: JSON.stringify(d, null, 2),
    };
  }
  if (id === "mac-lookup") {
    const mac = v.input.replace(/[:-]/g, "");
    if (!/^[\da-f]{12}$/i.test(mac))
      throw Error("Enter a six-byte MAC address.");
    if ((parseInt(mac.slice(0, 2), 16) & 2) !== 0)
      return base(
        "Locally administered MAC address",
        [{ MAC: v.input }],
        [
          "This address does not have a reliable globally assigned vendor prefix.",
        ],
        "warning",
        "MAC address flags",
      );
    const r = await fetch(
      "https://api.macvendors.com/" + encodeURIComponent(v.input),
      { signal: AbortSignal.timeout(10000) },
    );
    if (r.status === 404)
      return base(
        "No vendor found",
        [{ MAC: v.input }],
        [],
        "warning",
        "MACVendors",
      );
    if (!r.ok) throw Error("Vendor lookup is temporarily unavailable.");
    return base(
      "Registered vendor",
      [{ MAC: v.input, Vendor: await r.text() }],
      ["Vendor allocation does not identify a particular device or owner."],
      "success",
      "MACVendors",
    );
  }
  if (id === "blacklist") {
    const ip = parseIP(v.input);
    if (ip.bits !== 32 || !publicIP(v.input))
      throw Error("This check requires a public IPv4 address.");
    const prefix = v.input.split(".").reverse().join(".");
    const lists = [
      "bl.spamcop.net",
      "b.barracudacentral.org",
      "zen.spamhaus.org",
    ];
    const rows = await Promise.all(
      lists.map(async (list) => {
        try {
          const q = await dns(prefix + "." + list, "A");
          const answers = (q.Answer || [])
            .filter((a: Any) => a.type === 1)
            .map((a: Any) => a.data);
          return {
            Provider: list,
            Result:
              q.Status === 3
                ? "Not listed"
                : q.Status !== 0
                  ? "Unavailable"
                  : answers.some((a: string) => a.startsWith("127.255."))
                    ? "Provider denied public resolver"
                    : answers.some((a: string) => a.startsWith("127.0.0."))
                      ? "Listed"
                      : "Inconclusive",
            Response: answers.join(", ") || String(q.Status),
          };
        } catch {
          return {
            Provider: list,
            Result: "Unavailable",
            Response: "Query failed",
          };
        }
      }),
    );
    return base(
      "Blocklist sample checked",
      rows,
      [
        "Three providers sampled. Some blocklists prohibit public resolvers or require a subscription. Unavailable results do not mean clean.",
      ],
      "warning",
      "DNS blocklist providers",
    );
  }
  if (id === "email-verify") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.input) || v.input.length > 254)
      throw Error("Enter a valid email address.");
    const name = domain(v.input.split("@")[1]);
    const q = await dns(name, "MX");
    const rows = dnsRows(q);
    const nullMX = rows.some(
      (r: Any) => r.Type === "MX" && /^0\s+\.$/.test(r.Value),
    );
    return base(
      nullMX
        ? "Domain explicitly does not accept email"
        : rows.length
          ? "Mail routing records found"
          : "No MX records found",
      rows,
      [
        "Syntax and DNS checks only. Mailbox existence, catch-all behavior and actual delivery are not verified.",
      ],
      "warning",
    );
  }
  const name = domain(v.input);
  if (["spf", "dmarc", "dkim"].includes(id)) return mailRecord(id, name, v);
  if (["health", "dns-validation"].includes(id)) {
    const types = ["A", "AAAA", "NS", "MX", "SOA", "TXT"];
    const rows = await Promise.all(
      types.map(async (type) => {
        try {
          const q = await dns(name, type);
          return {
            Check: type,
            Status:
              q.Status === 0
                ? "Responded"
                : q.Status === 3
                  ? "NXDOMAIN"
                  : "DNS error",
            Records: dnsRows(q).filter((r: Any) => r.Type === type).length,
            Answer: dnsRows(q)
              .map((r: Any) => r.Value)
              .join("\n"),
          };
        } catch {
          return { Check: type, Status: "Unavailable", Records: 0, Answer: "" };
        }
      }),
    );
    if (id === "health") {
      for (const policy of ["spf", "dmarc"]) {
        try {
          const r = await mailRecord(policy, name, v);
          rows.push({
            Check: policy.toUpperCase(),
            Status: r.summary,
            Records: r.rows?.length || 0,
            Answer: (r.notes || []).join(" "),
          });
        } catch {
          rows.push({
            Check: policy.toUpperCase(),
            Status: "Unavailable",
            Records: 0,
            Answer: "",
          });
        }
      }
    }
    return base(
      "Configuration review complete",
      rows,
      [
        "This checks observable records and mail policies. It is not an exhaustive security audit. Optional records depend on the purpose of your domain.",
      ],
      "warning",
    );
  }
  if (id === "dns-lookup" || id === "domain-ip") {
    const types =
      id === "domain-ip"
        ? ["A", "AAAA"]
        : v.record && v.record !== "Common records"
          ? [v.record]
          : ["A", "AAAA", "CNAME", "MX", "NS", "SOA", "TXT", "CAA"];
    if (types.some((t) => !Object.values(recordNames).includes(t)))
      throw Error("Choose a supported record type.");
    const results = await Promise.all(
      types.map(async (type) => {
        try {
          return await query(name, type);
        } catch {
          return base(type + " lookup failed", [], [], "warning");
        }
      }),
    );
    return base(
      "DNS lookup complete",
      results.flatMap((r) => r.rows || []),
      results.map((r, i) => types[i] + ": " + r.summary),
      results.some((r) => r.status === "warning") ? "warning" : "success",
    );
  }
  if (id === "ipv6-check") {
    const q = await query(name, "AAAA");
    return {
      ...q,
      summary: q.rows?.some((r) => r.Type === "AAAA")
        ? "IPv6 DNS records found"
        : "No IPv6 address records found",
      notes: [
        ...(q.notes || []),
        "An AAAA record alone does not prove reachability. Use Ping IPv6 to measure a connection.",
      ],
    };
  }
  const map: Record<string, string> = {
    cname: "CNAME",
    ns: "NS",
    mx: "MX",
    dnskey: "DNSKEY",
    ds: "DS",
  };
  if (map[id]) return query(name, map[id]);
  throw Error("Unknown network tool.");
}
