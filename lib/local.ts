import md5 from "blueimp-md5";
import { toASCII, toUnicode } from "punycode/";
import { parseIP, formatIP, network } from "./ip";
import { Result, Values } from "./types";
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const int = (s: string, min: number, max: number) => {
  if (!/^\d+$/.test(s)) throw Error("Enter a whole number.");
  const n = Number(s);
  if (n < min || n > max) throw Error(`Enter a number from ${min} to ${max}.`);
  return n;
};
function safeURL(s: string) {
  const u = new URL(s.includes("://") ? s : "https://" + s);
  if (!["https:", "http:"].includes(u.protocol) || u.username || u.password)
    throw Error("Use an HTTP or HTTPS URL without credentials.");
  return u.href;
}
export async function runLocal(id: string, v: Values): Promise<Result> {
  const s = v.input ?? "";
  if (s.length > 200000) throw Error("Limit input to 200,000 characters.");
  const ok = (
    summary: string,
    code?: string,
    rows?: Record<string, unknown>[],
    notes?: string[],
  ): Result => ({
    status: "success",
    summary,
    code,
    rows,
    notes,
    source: "Your browser",
    checkedAt: new Date().toISOString(),
  });
  switch (id) {
    case "ip-decimal": {
      const p = parseIP(s);
      return ok("Address converted", p.n.toString(), [
        {
          Address: formatIP(p.n, p.bits),
          "IP version": p.bits === 32 ? "IPv4" : "IPv6",
          Hex: "0x" + p.n.toString(16),
        },
      ]);
    }
    case "ipv4-ipv6": {
      const p = parseIP(s);
      if (p.bits !== 32) throw Error("Enter an IPv4 address.");
      return ok(
        "IPv4-mapped representation",
        "::ffff:" + formatIP(p.n, 32),
        undefined,
        ["This representation does not provide IPv6 connectivity."],
      );
    }
    case "ipv6-ipv4": {
      const p = parseIP(s);
      if (p.bits !== 128 || p.n >> 32n !== 65535n)
        throw Error(
          "Only IPv4-mapped IPv6 addresses (::ffff:…) have a convertible IPv4 value.",
        );
      return ok("Embedded IPv4 address", formatIP(p.n & 0xffffffffn, 32));
    }
    case "ipv6-compress":
    case "ipv6-expand": {
      const p = parseIP(s);
      if (p.bits !== 128) throw Error("Enter an IPv6 address.");
      return ok(
        "IPv6 address formatted",
        formatIP(p.n, 128, id === "ipv6-expand"),
      );
    }
    case "ipv6-generate": {
      const b = crypto.getRandomValues(new Uint8Array(5));
      const h =
        "fd" + Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
      return ok(
        "Unique local prefix generated",
        h.match(/.{4}/g)!.join(":") + "::/48",
        undefined,
        [
          "Random 40-bit Global ID. Check for conflicts before deploying this prefix to a network.",
        ],
      );
    }
    case "cidr-range":
    case "subnet": {
      const n = network(s);
      if (id === "cidr-range" && n.bits !== 128)
        throw Error("Enter an IPv6 CIDR network.");
      const mask =
        ((1n << BigInt(n.bits)) - 1n) ^
        ((1n << BigInt(n.bits - n.prefix)) - 1n);
      return ok(
        "Network calculated",
        undefined,
        [
          {
            Network: formatIP(n.first, n.bits) + "/" + n.prefix,
            First: formatIP(n.first, n.bits),
            Last: formatIP(n.last, n.bits),
            "Address count": n.size.toString(),
            Mask: formatIP(mask, n.bits),
            "Usable hosts":
              n.bits === 128
                ? n.size.toString()
                : (n.prefix >= 31 ? n.size : n.size - 2n).toString(),
          },
        ],
        n.bits === 128
          ? ["IPv6 has no broadcast address."]
          : [
              "For IPv4 /31 and /32, both point-to-point addresses or the single host are counted.",
            ],
      );
    }
    case "range-cidr": {
      const a = parseIP(s),
        b = parseIP(v.end);
      if (a.bits !== 128 || b.bits !== 128 || a.n > b.n)
        throw Error("Enter an ordered IPv6 start and end address.");
      let x = a.n;
      const rows = [];
      while (x <= b.n) {
        let bits = 0;
        while (
          bits < 128 &&
          x % (1n << BigInt(bits + 1)) === 0n &&
          x + (1n << BigInt(bits + 1)) - 1n <= b.n
        )
          bits++;
        rows.push({
          CIDR: formatIP(x) + "/" + (128 - bits),
          Addresses: (1n << BigInt(bits)).toString(),
        });
        x += 1n << BigInt(bits);
      }
      return ok(
        `${rows.length} CIDR blocks`,
        rows.map((r) => r.CIDR).join("\n"),
        rows,
      );
    }
    case "mac-generator": {
      const count = int(v.count, 1, 100),
        sep =
          v.separator === "Plain" ? "" : v.separator === "Hyphen" ? "-" : ":";
      const a = Array.from({ length: count }, () => {
        const b = crypto.getRandomValues(new Uint8Array(6));
        b[0] = (b[0] | 2) & 254;
        return Array.from(b, (x) =>
          x.toString(16).padStart(2, "0").toUpperCase(),
        ).join(sep);
      });
      return ok(`${count} MAC addresses generated`, a.join("\n"), undefined, [
        "Locally administered unicast addresses. No global uniqueness guarantee.",
      ]);
    }
    case "md5-base64": {
      if (v.action === "Decode Base64") {
        try {
          const bytes = Uint8Array.from(atob(s.replace(/\s/g, "")), (c) =>
            c.charCodeAt(0),
          );
          return ok(
            "Base64 decoded",
            new TextDecoder("utf-8", { fatal: true }).decode(bytes),
          );
        } catch {
          throw Error("Enter valid Base64 containing UTF-8 text.");
        }
      }
      const bytes = new TextEncoder().encode(s);
      let bin = "";
      for (const b of bytes) bin += String.fromCharCode(b);
      return ok(
        "Hash and encoding generated",
        undefined,
        [
          { Format: "MD5", Value: md5(s) },
          { Format: "Base64", Value: btoa(bin) },
        ],
        [
          "Base64 is reversible encoding. MD5 is a legacy checksum and must not be used for password storage.",
        ],
      );
    }
    case "binary-text": {
      const bits = s.replace(/\s/g, "");
      if (!bits || !/^[01]+$/.test(bits) || bits.length % 8)
        throw Error("Enter binary in complete eight-bit bytes.");
      try {
        return ok(
          "Binary decoded",
          new TextDecoder("utf-8", { fatal: true }).decode(
            Uint8Array.from(bits.match(/.{8}/g)!, (x) => parseInt(x, 2)),
          ),
        );
      } catch {
        throw Error("These bytes are not valid UTF-8 text.");
      }
    }
    case "text-binary":
      return ok(
        "Text encoded as UTF-8 bytes",
        Array.from(new TextEncoder().encode(s), (x) =>
          x.toString(2).padStart(8, "0"),
        ).join(" "),
      );
    case "json": {
      let obj;
      try {
        obj = JSON.parse(s, (_, x) => {
          if (
            typeof x === "number" &&
            (!Number.isFinite(x) ||
              (Number.isInteger(x) && !Number.isSafeInteger(x)))
          )
            throw Error(
              "Large numbers must be quoted to avoid precision loss.",
            );
          return x;
        });
      } catch (e) {
        throw Error(e instanceof Error ? e.message : "Invalid JSON.");
      }
      return ok(
        "Valid JSON",
        JSON.stringify(obj, null, v.action === "Minify" ? undefined : 2),
      );
    }
    case "punycode": {
      const input = s.trim().replace(/\.$/, "");
      if (!input || /[\s/@:#]/.test(input))
        throw Error("Enter a domain name without a URL path.");
      const ascii = toASCII(input);
      if (
        ascii.length > 253 ||
        ascii
          .split(".")
          .some(
            (l) =>
              !l ||
              l.length > 63 ||
              !/^[a-z0-9-]+$/i.test(l) ||
              l.startsWith("-") ||
              l.endsWith("-"),
          )
      )
        throw Error("Enter a valid domain name.");
      return ok(
        "Domain converted",
        v.action === "To Unicode" ? toUnicode(ascii) : ascii,
      );
    }
    case "url-opener": {
      const lines = s
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (!lines.length || lines.length > 25)
        throw Error("Enter between 1 and 25 URLs.");
      const links = [...new Set(lines.map(safeURL))];
      return {
        ...ok(`${links.length} links ready`),
        links,
        notes: [
          "Open links individually or use Open all. Your browser may block additional tabs.",
        ],
      };
    }
    case "htaccess": {
      if (!/^\/[^\s]*$/.test(s) || /["\\\r\n]/.test(s))
        throw Error(
          "Enter a source path beginning with / without spaces or quotes.",
        );
      const url = safeURL(v.destination);
      return ok(
        "Redirect rule generated",
        `Redirect ${v.status || "301"} "${s}" "${url}"`,
        undefined,
        [
          "Apache mod_alias prefix matching also affects paths beneath this source. Test in staging before changing your configuration.",
        ],
      );
    }
    case "rewrite": {
      if (!/^\/[\w/.-]+$/.test(s) || !/^\/[\w/?.=&%-]+$/.test(v.destination))
        throw Error(
          "Use simple paths beginning with /; spaces and configuration characters are not allowed.",
        );
      const source = s.slice(1).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return ok(
        "Exact path rewrite generated",
        `RewriteEngine On\nRewriteRule ^${source}$ ${v.destination.slice(1)} [L,QSA]`,
        undefined,
        [
          "Place in the document-root .htaccess. This is an internal rewrite, not an external redirect.",
        ],
      );
    }
    case "robots": {
      if (!/^[\w*.-]+$/.test(v.agent))
        throw Error("Use a valid user agent token.");
      const lines = (v.disallow + "\n" + v.allow).split("\n").filter(Boolean);
      if (lines.some((x) => !x.startsWith("/") || /[\r#]/.test(x)))
        throw Error("Each crawler path must start with /.");
      return ok(
        "Robots.txt generated",
        `User-agent: ${v.agent}\n` +
          v.disallow
            .split("\n")
            .filter(Boolean)
            .map((x) => "Disallow: " + x)
            .join("\n") +
          "\n" +
          v.allow
            .split("\n")
            .filter(Boolean)
            .map((x) => "Allow: " + x)
            .join("\n") +
          (v.sitemap ? "\nSitemap: " + safeURL(v.sitemap) : ""),
        undefined,
        [
          "Publish at /robots.txt. Crawler directives are not access controls and do not guarantee removal from search results.",
        ],
      );
    }
    case "raid": {
      const n = int(v.drives, 1, 1000),
        size = Number(v.capacity);
      if (!Number.isFinite(size) || size <= 0 || size > 10000)
        throw Error("Enter a positive capacity up to 10,000 TB.");
      const level = v.level;
      const min =
        level === "5"
          ? 3
          : level === "6" || level === "10"
            ? 4
            : level === "1"
              ? 2
              : 1;
      if (n < min || (level === "10" && n % 2))
        throw Error(
          `RAID ${level} needs at least ${min} drives${level === "10" ? " and an even drive count" : ""}.`,
        );
      const usable =
        level === "0"
          ? n * size
          : level === "1"
            ? size
            : level === "5"
              ? (n - 1) * size
              : level === "6"
                ? (n - 2) * size
                : (n * size) / 2;
      return ok(
        "Storage capacity estimated",
        undefined,
        [
          {
            Level: "RAID " + level,
            "Raw capacity": n * size + " TB",
            "Usable capacity": usable + " TB",
            Efficiency: ((usable / (n * size)) * 100).toFixed(1) + "%",
            "Fault tolerance":
              level === "0"
                ? "None"
                : level === "1"
                  ? `${n - 1} drives`
                  : level === "6"
                    ? "2 drives"
                    : level === "10"
                      ? "1 per mirror pair"
                      : "1 drive",
          },
        ],
        [
          "Assumes equal-size drives; filesystem and controller overhead are excluded. RAID is not a backup.",
        ],
      );
    }
    case "dmarc-generator": {
      const d = toASCII(s.trim());
      if (!/^[\w.-]+\.[a-z]{2,}$/i.test(d))
        throw Error("Enter a valid domain.");
      const pct = int(v.percent, 0, 100);
      if (v.email && !/^[^\s@;]+@[^\s@;]+\.[^\s@;]+$/.test(v.email))
        throw Error("Enter a valid report email.");
      if (!["none", "quarantine", "reject"].includes(v.policy))
        throw Error("Choose a supported policy.");
      const r =
        `v=DMARC1; p=${v.policy}; pct=${pct}; adkim=${v.alignment === "strict" ? "s" : "r"}; aspf=${v.alignment === "strict" ? "s" : "r"}` +
        (v.email ? `; rua=mailto:${v.email}` : "");
      return ok(
        "DMARC record generated",
        r,
        [{ Type: "TXT", Name: "_dmarc." + d, Value: r }],
        [
          "Start with monitoring and review legitimate senders before enforcing quarantine or rejection.",
        ],
      );
    }
    case "email-header": {
      if (!s.trim()) throw Error("Paste email headers.");
      const text = s.split(/\r?\n\r?\n/)[0].replace(/\r?\n[ \t]+/g, " ");
      const rows = text.split(/\r?\n/).flatMap((line) => {
        const i = line.indexOf(":");
        return i > 0
          ? [{ Header: line.slice(0, i), Value: line.slice(i + 1).trim() }]
          : [];
      });
      if (!rows.length) throw Error("No valid header fields were found.");
      return ok(
        `${rows.filter((r) => r.Header.toLowerCase() === "received").length} routing hops found`,
        undefined,
        rows,
        [
          "Headers can be forged. Authentication-Results should be trusted only when inserted by your own receiving service. A sender’s physical location cannot be established from these headers.",
        ],
      );
    }
    case "user-agent":
      return ok(
        "Browser information",
        undefined,
        [
          { Property: "User agent", Value: navigator.userAgent },
          { Property: "Languages", Value: navigator.languages.join(", ") },
          { Property: "Screen", Value: `${screen.width} × ${screen.height}` },
          { Property: "Viewport", Value: `${innerWidth} × ${innerHeight}` },
          {
            Property: "Timezone",
            Value: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        ],
        ["Browser-provided information can be reduced or spoofed."],
      );
    case "serp": {
      const url = safeURL(s);
      return {
        ...ok("Search snippet preview", undefined, undefined, [
          "This is an approximate preview. Google can rewrite titles and descriptions.",
        ]),
        preview: { title: v.title, url, description: v.description },
        metrics: [
          { label: "Title characters", value: String(v.title.length) },
          {
            label: "Description characters",
            value: String(v.description.length),
          },
        ],
      };
    }
    case "open-graph": {
      const url = safeURL(s);
      return ok(
        "Open Graph tags generated",
        `<meta property="og:type" content="website">\n<meta property="og:title" content="${escape(v.title)}">\n<meta property="og:description" content="${escape(v.description)}">\n<meta property="og:url" content="${escape(url)}">` +
          (v.image
            ? `\n<meta property="og:image" content="${escape(safeURL(v.image))}">`
            : ""),
      );
    }
    default:
      throw Error("This tool requires a network lookup.");
  }
}
