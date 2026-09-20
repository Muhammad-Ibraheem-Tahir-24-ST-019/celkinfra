import type { Tool } from "./catalog";

const outputs: Record<string, string> = {
  "dns-checker":
    "DNS answers, probe locations, TTL values and expected-value matches.",
  "dns-validation": "Record checks and configuration warnings to investigate.",
  "reverse-ip": "Reverse DNS (PTR) hostnames associated with the address.",
  "dns-lookup":
    "Record types, returned values and their cache lifetimes (TTL).",
  cname: "Canonical hostnames returned by the domain’s CNAME records.",
  ns: "Authoritative nameserver hostnames.",
  mx: "Mail server hostnames and delivery priority numbers.",
  spf: "Sender policy records, syntax checks and DNS lookup warnings.",
  dmarc:
    "The published email policy, alignment settings and reporting addresses.",
  health: "A combined review of common DNS and email records.",
  "dmarc-generator":
    "A TXT record you can review before adding it to your DNS.",
  dnskey: "DNSSEC public key records, flags and algorithm identifiers.",
  ds: "Delegation signer records, key tags and digest values.",
  dkim: "The selector’s public signing key and record checks.",
  "ping-ipv4": "IPv4 response times and packet loss from a remote probe.",
  "ping-ipv6": "IPv6 response times and packet loss from a remote probe.",
  "my-ip": "The public IP address seen by this website.",
  traceroute: "The responding network hops along a remote probe’s route.",
  "ip-location":
    "Approximate geographic and network information, not a street address.",
  "email-header": "Parsed routing hops and published authentication headers.",
  blacklist: "Listing responses from the checked DNS blocklist providers.",
  "ip-decimal": "The address represented as a decimal integer.",
  "ip-hostname": "The address’s reverse DNS hostname, when published.",
  "ip-whois": "Network allocation and registration data from RDAP.",
  "ipv6-whois": "IPv6 allocation and registration data from RDAP.",
  "ipv4-ipv6": "An IPv4-mapped IPv6 address using the ::ffff: prefix.",
  "ipv6-generate": "A random unique local /48 IPv6 prefix.",
  "cidr-range": "The first address, last address and size of the IPv6 block.",
  "range-cidr": "CIDR blocks that cover the supplied IPv6 range.",
  "ipv6-compress": "A shortened, canonical IPv6 address.",
  "ipv6-expand": "All eight IPv6 groups, including leading zeros.",
  subnet: "Network boundaries, address counts and usable host information.",
  "ipv6-ipv4": "The IPv4 address embedded in an IPv4-mapped IPv6 address.",
  "ipv6-check": "Published IPv6 DNS records and connectivity guidance.",
  "my-isp": "Provider and network information associated with your public IP.",
  "domain-ip": "The domain’s published IPv4 and IPv6 addresses.",
  headers: "HTTP status and the headers returned by the website.",
  "server-os":
    "Exposed server headers; hidden operating systems cannot be identified reliably.",
  "md5-base64":
    "An MD5 digest or Base64 encoded/decoded text. MD5 is not secure password hashing.",
  "url-opener":
    "Validated clickable URLs that you can open individually or together.",
  smtp: "Mail port reachability; protocol capabilities require the SMTP probe service.",
  htaccess: "Apache redirect directives ready to review and copy.",
  rewrite: "Apache rewrite rules for the specified path pattern.",
  "broken-links":
    "HTTP check results for a limited sample of links on the page.",
  "open-graph":
    "Published social preview metadata or generated Open Graph tags.",
  raid: "Estimated usable capacity, storage overhead and drive-failure tolerance.",
  "binary-text": "UTF-8 text decoded from binary bytes.",
  "text-binary": "UTF-8 bytes represented as groups of eight binary digits.",
  json: "Formatted or minified JSON, with validation errors for invalid input.",
  "email-verify":
    "Syntax and mail-routing checks; these do not prove a mailbox exists.",
  "link-analyzer": "Internal and external links with their anchor text.",
  "user-agent":
    "The user-agent string and display information your browser provides.",
  pagerank:
    "An explanation of public PageRank availability; Google no longer publishes this score.",
  punycode: "Unicode domain names converted to ASCII, or the reverse.",
  serp: "A visual search snippet preview, not a live Google ranking.",
  robots: "A robots.txt draft with crawler rules and optional sitemap URLs.",
  port: "Whether a remote probe can establish a TCP connection to the port.",
  "mac-lookup": "The registered vendor associated with the address prefix.",
  "mac-generator": "Random locally administered unicast MAC addresses.",
  asn: "Autonomous system registration and allocation details.",
};

export function toolGuide(tool: Tool) {
  return {
    output: outputs[tool.id] || tool.description,
    local: tool.mode === "local",
  };
}
