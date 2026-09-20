import { Tool } from "./catalog";
import { Field } from "./types";
const f = (
  key: string,
  label: string,
  value = "",
  type?: Field["type"],
  options?: string[],
  help?: string,
): Field => ({ key, label, value, type, options, help });
export function fields(t: Tool): Field[] {
  const input = f(
    "input",
    t.mode === "url"
      ? "Website URL"
      : t.mode === "ip"
        ? "IP address"
        : t.mode === "email"
          ? "Email address"
          : "Domain or hostname",
    "",
  );
  input.placeholder =
    t.mode === "url"
      ? "https://example.com"
      : t.mode === "ip"
        ? "8.8.8.8"
        : t.mode === "email"
          ? "name@example.com"
          : "example.com";
  switch (t.id) {
    case "dns-checker":
      return [
        input,
        f("record", "Record type", "A", "select", [
          "A",
          "AAAA",
          "CNAME",
          "MX",
          "NS",
          "PTR",
          "SRV",
          "SOA",
          "TXT",
          "CAA",
          "DS",
          "DNSKEY",
        ]),
        f("expected", "Expected value (optional)"),
        f("region", "Probe coverage", "World", "select", [
          "World",
          "Europe",
          "Asia",
          "North America",
        ]),
        f("resolver", "Resolver", "Default", "select", [
          "Default",
          "8.8.8.8",
          "1.1.1.1",
          "9.9.9.9",
        ]),
      ];
    case "dns-lookup":
      return [
        input,
        f("record", "Record type", "Common records", "select", [
          "Common records",
          "A",
          "AAAA",
          "CNAME",
          "MX",
          "NS",
          "PTR",
          "SRV",
          "SOA",
          "TXT",
          "CAA",
          "DS",
          "DNSKEY",
        ]),
      ];
    case "dkim":
      return [
        input,
        f(
          "selector",
          "DKIM selector",
          "default",
          undefined,
          undefined,
          "Use the selector from your email provider or a DKIM-Signature header.",
        ),
      ];
    case "dmarc-generator":
      return [
        f("input", "Domain", "example.com"),
        f("policy", "Policy", "none", "select", [
          "none",
          "quarantine",
          "reject",
        ]),
        f("email", "Aggregate report email (optional)"),
        f("percent", "Percentage", "100", "number"),
        f("alignment", "Alignment", "relaxed", "select", ["relaxed", "strict"]),
      ];
    case "ping-ipv4":
    case "ping-ipv6":
    case "traceroute":
      return [
        input,
        f("region", "Probe region", "World", "select", [
          "World",
          "Europe",
          "Asia",
          "North America",
        ]),
      ];
    case "port":
    case "smtp":
      return [
        input,
        f("port", "Port", t.id === "smtp" ? "25" : "443", "number"),
        f("region", "Probe region", "World", "select", [
          "World",
          "Europe",
          "Asia",
          "North America",
        ]),
      ];
    case "my-ip":
    case "my-isp":
    case "user-agent":
      return [];
    case "email-header":
      return [
        f(
          "input",
          "Raw email headers",
          "",
          "textarea",
          undefined,
          "Paste only headers. Message content is not needed; processing stays in this browser.",
        ),
      ];
    case "ip-decimal":
    case "ipv4-ipv6":
      return [f("input", "IPv4 address", "192.168.1.1")];
    case "ipv6-ipv4":
      return [f("input", "IPv4-mapped IPv6 address", "::ffff:192.168.1.1")];
    case "ipv6-compress":
    case "ipv6-expand":
      return [f("input", "IPv6 address", "2001:db8:0:0:0:0:0:1")];
    case "ipv6-generate":
      return [];
    case "cidr-range":
      return [f("input", "IPv6 network / prefix", "2001:db8::/64")];
    case "range-cidr":
      return [
        f("input", "First IPv6 address", "2001:db8::"),
        f("end", "Last IPv6 address", "2001:db8::ffff"),
      ];
    case "subnet":
      return [f("input", "IP address / CIDR prefix", "192.168.1.0/24")];
    case "md5-base64":
      return [
        f("input", "Text", "Hello, world!", "textarea"),
        f("action", "Operation", "Encode", "select", [
          "Encode",
          "Decode Base64",
        ]),
      ];
    case "url-opener":
      return [
        f(
          "input",
          "URLs, one per line",
          "https://example.com\nhttps://example.org",
          "textarea",
        ),
      ];
    case "htaccess":
      return [
        f("input", "Source path", "/old-page"),
        f("destination", "Destination URL", "https://example.com/new-page"),
        f("status", "Redirect status", "301", "select", [
          "301",
          "302",
          "307",
          "308",
        ]),
      ];
    case "rewrite":
      return [
        f("input", "Public path", "/products/item"),
        f("destination", "Internal path", "/product.php?id=item"),
      ];
    case "open-graph":
      return [
        input,
        f("action", "Action", "Inspect website", "select", [
          "Inspect website",
          "Generate tags",
        ]),
        f("title", "Title (for generation)", "My website"),
        f("description", "Description (for generation)", "", "textarea"),
        f("image", "Image URL (optional)"),
      ];
    case "raid":
      return [
        f("drives", "Number of drives", "4", "number"),
        f("capacity", "Capacity per drive (TB)", "2", "number"),
        f("level", "RAID level", "5", "select", ["0", "1", "5", "6", "10"]),
      ];
    case "binary-text":
      return [f("input", "Binary bytes", "01001000 01101001", "textarea")];
    case "text-binary":
      return [f("input", "Text", "Hello, world!", "textarea")];
    case "json":
      return [
        f(
          "input",
          "JSON",
          '{"project":"Bmaikr Tools","tools":60,"ready":true}',
          "textarea",
        ),
        f("action", "Output", "Beautify", "select", ["Beautify", "Minify"]),
      ];
    case "punycode":
      return [
        f("input", "Domain", "münchen.de"),
        f("action", "Direction", "To ASCII", "select", [
          "To ASCII",
          "To Unicode",
        ]),
      ];
    case "serp":
      return [
        f("title", "Page title", "Your page title"),
        f("input", "Page URL", "https://example.com"),
        f(
          "description",
          "Meta description",
          "Write a clear description of what visitors will find on this page.",
          "textarea",
        ),
      ];
    case "robots":
      return [
        f("agent", "User agent", "*"),
        f("disallow", "Disallow paths (one per line)", "/admin/", "textarea"),
        f("allow", "Allow paths (optional)", "", "textarea"),
        f(
          "sitemap",
          "Sitemap URL (optional)",
          "https://example.com/sitemap.xml",
        ),
      ];
    case "mac-generator":
      return [
        f("count", "Number of addresses", "5", "number"),
        f("separator", "Format", "Colon", "select", [
          "Colon",
          "Hyphen",
          "Plain",
        ]),
      ];
    case "mac-lookup":
      return [f("input", "MAC address", "00:1B:44:11:3A:B7")];
    case "asn":
      return [f("input", "Autonomous system number", "AS15169")];
    default:
      return [input];
  }
}
