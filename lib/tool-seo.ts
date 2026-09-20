/**
 * Per-tool SEO and AEO content.
 *
 * `title` / `description` / `keywords` drive the <head> metadata.
 * `answer` is the answer-first paragraph rendered at the top of the tool page —
 *   it exists so a reader (or an answer engine) gets the definition immediately
 *   instead of having to operate the widget to learn what the page is about.
 * `faqs` are rendered on the page and emitted as FAQPage structured data.
 *
 * Every entry is written for its specific tool. Nothing here is templated,
 * because near-duplicate explainer text across 60 pages is exactly the
 * thin-content pattern that search engines and ad reviewers penalise.
 */

import type { Tool } from "./catalog";

export type ToolSeo = {
  title: string;
  description: string;
  keywords: string[];
  answer: string;
  faqs: { q: string; a: string }[];
};

const entries: Record<string, ToolSeo> = {
  /* ---------------------------- DNS Tools ---------------------------- */

  "dns-checker": {
    title: "DNS Propagation Checker — Compare Global Resolvers",
    description:
      "Check DNS propagation worldwide. Compare the records returned by public resolvers in different locations to see whether your DNS change has rolled out yet.",
    keywords: [
      "dns propagation checker",
      "check dns propagation",
      "global dns checker",
      "dns checker",
      "dns propagation test",
    ],
    answer:
      "A DNS propagation checker queries public resolvers in several locations at once and shows the answer each one returns. When every resolver returns your new record the change has propagated; while some still return the old value, their cached copy simply has not expired yet.",
    faqs: [
      {
        q: "How long does DNS propagation take?",
        a: "Up to the TTL set on the record, and commonly 24–48 hours for nameserver changes because some ISP resolvers ignore short TTLs. A record with a 300-second TTL usually updates within minutes.",
      },
      {
        q: "Why do some locations still show the old IP address?",
        a: "Those resolvers are serving a cached answer that has not reached its TTL yet. Nothing is wrong — they refresh on their own. Clearing your own device's cache has no effect on them.",
      },
      {
        q: "Can I force DNS to propagate faster?",
        a: "No. You can only lower the TTL before making a change so caches expire sooner afterwards. Once an answer is cached, its TTL has to run out.",
      },
    ],
  },

  "dns-validation": {
    title: "DNS Validation — Find DNS Configuration Problems",
    description:
      "Check a domain's DNS setup for configuration problems: missing records, nameserver mismatches, unreachable mail hosts and other issues worth investigating.",
    keywords: [
      "dns validation",
      "dns configuration check",
      "dns health check",
      "check dns records",
      "dns error checker",
    ],
    answer:
      "DNS validation checks a domain's published records against common configuration rules and reports what looks wrong — nameservers that disagree, a missing address record, or mail records pointing nowhere. It reports symptoms to investigate rather than a guaranteed diagnosis.",
    faqs: [
      {
        q: "Does a warning mean my site is down?",
        a: "No. A warning flags a configuration pattern that often causes problems. Your site may still resolve normally. Check the specific record named in the warning before changing anything.",
      },
      {
        q: "Which records does it check?",
        a: "The common delegation and mail records — nameservers, address records, and the mail-related records — together, because a real problem is usually a disagreement between them rather than one bad record.",
      },
      {
        q: "It reports no issues but my domain still fails. Why?",
        a: "DNS validation only sees published DNS. Hosting, TLS certificates, firewalls and application errors all sit outside DNS and need separate checks.",
      },
    ],
  },

  "reverse-ip": {
    title: "Reverse IP Lookup — Find the Hostname for an IP",
    description:
      "Look up the PTR record for an IPv4 or IPv6 address to find the hostname its owner has published. Useful for verifying mail servers and reading server logs.",
    keywords: [
      "reverse ip lookup",
      "ptr record lookup",
      "reverse dns lookup",
      "ip to hostname",
      "find hostname from ip",
    ],
    answer:
      "A reverse IP lookup reads the PTR record that an address's owner publishes, returning the hostname assigned to that IP. Many addresses have no PTR record at all, which is normal and not an error.",
    faqs: [
      {
        q: "What is the difference between reverse IP and reverse DNS?",
        a: "They are the same lookup. Both query the PTR record in the in-addr.arpa zone for IPv4 or ip6.arpa for IPv6.",
      },
      {
        q: "Why does my IP address return no hostname?",
        a: "Only the network operator holding the address block can publish a PTR record. Home connections and most cloud addresses have none by default; your hosting provider can add one.",
      },
      {
        q: "Does reverse IP show every website on a server?",
        a: "No. A PTR record returns one hostname for the address. Finding all the sites sharing an IP is a different technique and this tool does not do it.",
      },
    ],
  },

  "dns-lookup": {
    title: "DNS Lookup — Check A, AAAA, MX, TXT and CNAME Records",
    description:
      "Look up the DNS records behind any domain. See A, AAAA, MX, TXT, NS and CNAME values together with their TTLs, straight from a public resolver.",
    keywords: [
      "dns lookup",
      "dns record lookup",
      "check dns records",
      "a record lookup",
      "txt record lookup",
      "nslookup online",
    ],
    answer:
      "A DNS lookup asks a resolver which records a domain publishes and returns their values and TTLs. The A record holds the IPv4 address, AAAA the IPv6 address, MX the mail servers, and TXT the verification and policy strings.",
    faqs: [
      {
        q: "What is a TTL?",
        a: "Time to live, in seconds — how long a resolver may cache the record before asking again. A TTL of 3600 means caches can hold the answer for an hour.",
      },
      {
        q: "Why does this show a different IP than ping does?",
        a: "Your computer may be using a cached answer or a different resolver. This lookup queries a public resolver directly, so it can see a newer value than your device has.",
      },
      {
        q: "What does an empty result mean?",
        a: "The domain publishes no record of that type. That is normal — most domains have no SRV or CAA record, for example.",
      },
    ],
  },

  cname: {
    title: "CNAME Lookup — Follow a Domain's Canonical Name",
    description:
      "Look up a domain's CNAME record and see which hostname it points to. Check that aliases for a CDN, app platform or subdomain resolve to the right target.",
    keywords: [
      "cname lookup",
      "cname record check",
      "check cname",
      "canonical name record",
      "cname checker",
    ],
    answer:
      "A CNAME record makes one hostname an alias for another: look up the alias and DNS hands back the target's records instead. A CNAME lookup shows which target a hostname currently points to.",
    faqs: [
      {
        q: "Can I put a CNAME on my root domain?",
        a: "Not in standard DNS — the root must hold SOA and NS records, which a CNAME cannot coexist with. Many providers offer ALIAS, ANAME or CNAME flattening as a workaround.",
      },
      {
        q: "Why does my CNAME return an IP address instead of a hostname?",
        a: "The resolver followed the chain for you and returned the target's address record. The CNAME is still there; the lookup simply resolved through to the end.",
      },
      {
        q: "Can a CNAME point at another CNAME?",
        a: "Yes, and it works, but every extra hop adds a lookup. Long chains slow resolution and some providers reject them outright.",
      },
    ],
  },

  ns: {
    title: "NS Lookup — Find a Domain's Nameservers",
    description:
      "Find which nameservers are authoritative for a domain. Compare the delegated nameservers against what you expect after moving DNS or changing host.",
    keywords: [
      "ns lookup",
      "nameserver lookup",
      "find nameservers",
      "check nameservers",
      "dns nameserver check",
    ],
    answer:
      "An NS lookup returns the nameservers that are authoritative for a domain — the servers holding its real DNS records. After changing DNS provider these are the values that must update before anything else takes effect.",
    faqs: [
      {
        q: "I changed nameservers but the old ones still show. Why?",
        a: "Nameserver changes go through the domain registry and are cached by resolvers, often for 24–48 hours. Until that clears, some resolvers keep using the old set.",
      },
      {
        q: "How many nameservers should a domain have?",
        a: "At least two, on separate networks, so the domain still resolves if one fails. Most providers give you between two and four.",
      },
      {
        q: "Do the nameservers have to match the ones at my registrar?",
        a: "Yes. The registrar's delegation is what the rest of the internet follows. Records added at a provider you have not delegated to are never consulted.",
      },
    ],
  },

  mx: {
    title: "MX Lookup — Find a Domain's Mail Servers",
    description:
      "Look up a domain's MX records to see which servers accept its email and in what priority order. A first step when mail is not being delivered.",
    keywords: [
      "mx lookup",
      "mx record check",
      "mail server lookup",
      "check mx records",
      "email dns lookup",
    ],
    answer:
      "MX records tell other mail servers where to deliver a domain's email. An MX lookup returns each mail host and its priority number — lower numbers are tried first, and equal numbers share the load.",
    faqs: [
      {
        q: "What does the priority number mean?",
        a: "It is preference order, not quality. A sender tries the lowest number first and falls back to higher ones if it cannot connect. Equal values are used round-robin.",
      },
      {
        q: "My domain has no MX record. Can it still receive mail?",
        a: "Senders fall back to the address record in that case, but many will not. If you want mail, publish an MX record explicitly.",
      },
      {
        q: "Should an MX record point to an IP address?",
        a: "No. An MX must name a hostname that has its own A or AAAA record. Pointing it straight at an IP is invalid and some senders reject it.",
      },
    ],
  },

  spf: {
    title: "SPF Record Checker — Validate Your SPF and Lookup Limit",
    description:
      "Check a domain's SPF record, its syntax and how many DNS lookups it uses. Catch the ten-lookup limit and the all qualifier before mail starts failing.",
    keywords: [
      "spf checker",
      "spf record check",
      "spf validator",
      "check spf record",
      "spf lookup limit",
    ],
    answer:
      "SPF is a TXT record listing which servers may send mail for your domain. An SPF check reads that record, validates its syntax and counts the DNS lookups it triggers — more than ten causes a permerror and receivers may then reject your mail.",
    faqs: [
      {
        q: "What is the ten-lookup limit?",
        a: "SPF allows at most ten DNS-querying mechanisms (include, a, mx, ptr, exists, redirect). Past that, evaluation fails with permerror and your SPF effectively stops protecting you.",
      },
      {
        q: "Should my record end with ~all or -all?",
        a: "~all (softfail) marks unlisted senders as suspicious; -all (fail) tells receivers to reject them. Start with ~all, confirm nothing legitimate is missing, then tighten to -all.",
      },
      {
        q: "Can I publish two SPF records?",
        a: "No. A domain must publish exactly one SPF TXT record. Two is a permerror — merge them into a single record with multiple include: terms.",
      },
    ],
  },

  dmarc: {
    title: "DMARC Checker — Check Your Policy, Alignment and Reports",
    description:
      "Look up a domain's DMARC record and read its policy, alignment mode and reporting addresses. See whether unauthenticated mail is monitored, quarantined or rejected.",
    keywords: [
      "dmarc checker",
      "dmarc record check",
      "check dmarc",
      "dmarc lookup",
      "dmarc policy checker",
    ],
    answer:
      "DMARC is a TXT record at _dmarc.yourdomain telling receivers what to do when a message fails SPF and DKIM. A DMARC check reads that record and shows the policy — none, quarantine or reject — the alignment mode, and where reports are sent.",
    faqs: [
      {
        q: "What does p=none actually do?",
        a: "Nothing to the mail itself — it only requests reports. It is the right starting point for gathering data, but it gives no protection until you move to quarantine or reject.",
      },
      {
        q: "What is DMARC alignment?",
        a: "DMARC requires the domain a human sees in the From header to match the domain that passed SPF or DKIM. Relaxed alignment allows subdomains; strict requires an exact match.",
      },
      {
        q: "Where do DMARC reports go?",
        a: "To the addresses in the rua (aggregate) and ruf (forensic) tags. Aggregate reports arrive daily as XML — use a report parser, they are not meant to be read by hand.",
      },
    ],
  },

  health: {
    title: "Domain Health Check — DNS and Email Configuration Review",
    description:
      "Review a domain's DNS and email configuration together: nameservers, address records, mail servers and the SPF, DKIM and DMARC records that go with them.",
    keywords: [
      "domain health check",
      "dns health check",
      "email configuration check",
      "domain checkup",
      "check domain setup",
    ],
    answer:
      "A domain health check pulls the delegation, addressing and mail records for one domain and presents them side by side, so you can see whether DNS and email agree with each other instead of checking each record in isolation.",
    faqs: [
      {
        q: "Which records are included?",
        a: "Nameservers and address records for reachability, plus MX and the SPF, DKIM and DMARC records that govern mail. They are shown together because a mail problem is usually a disagreement between them.",
      },
      {
        q: "Is a clean report a guarantee?",
        a: "No. It means the published records look consistent. Deliverability also depends on sending reputation, content filtering and the receiving provider's own rules.",
      },
      {
        q: "How often should I run this?",
        a: "After any DNS, host or mail provider change, and periodically if you send mail — records drift when a provider is added and the old include: is left behind.",
      },
    ],
  },

  "dmarc-generator": {
    title: "DMARC Record Generator — Build a DMARC TXT Record",
    description:
      "Generate a valid DMARC TXT record with guided settings. Choose your policy, alignment and report addresses, then review the record before adding it to DNS.",
    keywords: [
      "dmarc generator",
      "dmarc record generator",
      "create dmarc record",
      "dmarc txt generator",
      "build dmarc record",
    ],
    answer:
      "A DMARC generator builds the TXT record you publish at _dmarc.yourdomain from the choices you make — policy, percentage, alignment and report addresses — so the syntax is right first time. The record is assembled in your browser.",
    faqs: [
      {
        q: "Which policy should I start with?",
        a: "p=none. It changes nothing about delivery but starts the aggregate reports flowing, which is the data you need before enforcing anything.",
      },
      {
        q: "Where do I put the generated record?",
        a: "As a TXT record on the hostname _dmarc.yourdomain.com — not on the root domain. The value is the whole generated string.",
      },
      {
        q: "Do I need SPF and DKIM first?",
        a: "In practice yes. DMARC only checks whether SPF or DKIM passed and aligned, so publishing DMARC with neither in place means everything fails it.",
      },
    ],
  },

  dnskey: {
    title: "DNSKEY Lookup — Inspect a Domain's DNSSEC Public Keys",
    description:
      "Look up a domain's DNSKEY records to see the public keys used for DNSSEC, their flags and signing algorithms. Confirm whether a zone is actually signed.",
    keywords: [
      "dnskey lookup",
      "dnssec key lookup",
      "check dnskey",
      "dnssec public key",
      "dnskey record",
    ],
    answer:
      "DNSKEY records hold the public keys a signed zone uses for DNSSEC. A DNSKEY lookup returns those keys with their flags — 257 marks a key-signing key, 256 a zone-signing key — and the algorithm each one uses.",
    faqs: [
      {
        q: "What is the difference between flag 256 and 257?",
        a: "257 is the key-signing key (KSK), which the parent zone's DS record points at. 256 is the zone-signing key (ZSK), which signs the actual records. The KSK signs the ZSK.",
      },
      {
        q: "No DNSKEY records came back. Is that a problem?",
        a: "Only if you expected DNSSEC. An unsigned zone has no DNSKEY records, and most domains are unsigned. It is not an error.",
      },
      {
        q: "Does having DNSKEY records mean DNSSEC works?",
        a: "Not on its own. The parent zone also needs a matching DS record. Keys without a DS are published but never validated — check the DS lookup too.",
      },
    ],
  },

  ds: {
    title: "DS Record Lookup — Check the DNSSEC Chain of Trust",
    description:
      "Look up a domain's DS records at the parent zone. The DS record links your signed zone to the DNSSEC chain of trust — without it, signing has no effect.",
    keywords: [
      "ds record lookup",
      "dnssec ds record",
      "check ds record",
      "delegation signer lookup",
      "dnssec chain of trust",
    ],
    answer:
      "A DS (delegation signer) record lives in the parent zone and holds a digest of your key-signing key. It tells validating resolvers that your zone is signed and which key to trust. Without a matching DS, DNSSEC signatures are ignored entirely.",
    faqs: [
      {
        q: "Where does the DS record come from?",
        a: "You generate it from your KSK and give it to your registrar, who publishes it in the parent zone. Most DNS providers can hand the values straight to the registrar for you.",
      },
      {
        q: "What happens if the DS does not match my DNSKEY?",
        a: "Validating resolvers treat the whole zone as bogus and refuse to resolve it — the domain goes dark for a large share of users. Mismatched DS records are the classic DNSSEC outage.",
      },
      {
        q: "How do I turn DNSSEC off safely?",
        a: "Remove the DS record at the registrar first, wait for its TTL to expire everywhere, and only then unsign the zone. Doing it the other way round breaks the domain.",
      },
    ],
  },

  dkim: {
    title: "DKIM Checker — Look Up a Domain's Email Signing Key",
    description:
      "Look up the DKIM public key for a domain and selector. Confirm the record exists, is readable and carries a key before chasing signature failures.",
    keywords: [
      "dkim checker",
      "dkim record lookup",
      "check dkim",
      "dkim selector lookup",
      "dkim public key",
    ],
    answer:
      "DKIM publishes a public key in DNS at selector._domainkey.yourdomain so receivers can verify the signature your mail server adds. A DKIM check fetches that record for a given selector and shows whether a usable key is published.",
    faqs: [
      {
        q: "What is a selector and where do I find mine?",
        a: "A label that lets one domain publish several keys. It appears in the s= tag of the DKIM-Signature header on any message you have sent — read it from a received copy.",
      },
      {
        q: "Why does the lookup find nothing?",
        a: "Usually the wrong selector, or the record was never published. Check the s= value from a real message and confirm the record sits at selector._domainkey, not on the root domain.",
      },
      {
        q: "Does a valid key mean my DKIM passes?",
        a: "No, it means the key is published. A signature can still fail if the message is modified in transit — mailing lists and some forwarders break DKIM routinely.",
      },
    ],
  },

  /* ----------------------------- IP Tools ----------------------------- */

  "ping-ipv4": {
    title: "Ping IPv4 — Test Reachability and Latency Remotely",
    description:
      "Ping an IPv4 address or hostname from a remote probe and see response times and packet loss. Checks reachability from the internet, not from your own network.",
    keywords: [
      "ping ipv4",
      "online ping test",
      "ping tool",
      "check latency",
      "packet loss test",
    ],
    answer:
      "A ping sends ICMP echo requests to a target and measures how long the replies take. Running it from a remote probe shows whether the internet at large can reach the address, which is a different question from whether your own connection can.",
    faqs: [
      {
        q: "What is a normal ping time?",
        a: "Within a country, typically 5–50 ms. Intercontinental links run 100–300 ms. Consistency matters more than the absolute number: fluctuating times point to congestion.",
      },
      {
        q: "The host does not reply. Is it down?",
        a: "Not necessarily. Many servers and firewalls drop ICMP deliberately while serving traffic normally. Use a port check to test the actual service.",
      },
      {
        q: "Why does packet loss matter?",
        a: "Lost packets have to be retransmitted, which stalls TCP and makes calls and streams break up. Any sustained loss above about 1% is worth investigating.",
      },
    ],
  },

  "ping-ipv6": {
    title: "Ping IPv6 — Test IPv6 Reachability and Latency",
    description:
      "Ping an IPv6 address or hostname from a remote probe. Confirm a host answers over IPv6 and see its response times and packet loss.",
    keywords: [
      "ping ipv6",
      "ipv6 ping test",
      "test ipv6 connectivity",
      "ipv6 latency",
      "icmpv6 ping",
    ],
    answer:
      "An IPv6 ping sends ICMPv6 echo requests to an IPv6 address and measures the replies. It answers one specific question: is this host reachable over IPv6? A host can work perfectly over IPv4 and still fail here.",
    faqs: [
      {
        q: "My domain pings over IPv4 but not IPv6. Why?",
        a: "Most likely there is no AAAA record, or the server is not listening on its IPv6 address. Publishing AAAA without configuring the service is a common half-finished migration.",
      },
      {
        q: "Do I actually need IPv6?",
        a: "You can operate without it, but a growing share of mobile networks are IPv6-only and reach you through a translation layer. Native IPv6 removes that extra hop.",
      },
      {
        q: "Why is IPv6 sometimes slower than IPv4?",
        a: "Usually routing, not the protocol. Newer IPv6 paths can be less direct than mature IPv4 ones. A traceroute shows where the extra time is being spent.",
      },
    ],
  },

  "my-ip": {
    title: "What Is My IP Address? — See Your Public IP",
    description:
      "See the public IP address your connection presents to the internet, exactly as this website receives it. Works for both IPv4 and IPv6 connections.",
    keywords: [
      "what is my ip",
      "my ip address",
      "check my ip",
      "find my ip address",
      "public ip",
    ],
    answer:
      "Your public IP address is the address the internet sees when you connect. It is assigned by your provider, shared by everything on your network, and different from the private address (such as 192.168.x.x) your router gives each device.",
    faqs: [
      {
        q: "Why does my IP address change?",
        a: "Most home connections use dynamic addresses that your provider reassigns on reconnection or lease renewal. A static address is usually a paid option.",
      },
      {
        q: "Why is a different IP shown here than in my router?",
        a: "Your router shows the private LAN address. This page shows the public address your provider assigned, which is what remote servers actually see.",
      },
      {
        q: "Does my IP address reveal my home address?",
        a: "No. It maps to your provider and a rough area, often the wrong city. Only your provider can link an address to a subscriber, and that requires legal process.",
      },
    ],
  },

  traceroute: {
    title: "Traceroute — See the Network Path to a Host",
    description:
      "Trace the network hops between a remote probe and a host. See where latency appears along the route and where a path stops responding.",
    keywords: [
      "traceroute",
      "online traceroute",
      "trace network path",
      "network hops",
      "tracert online",
    ],
    answer:
      "A traceroute maps the routers between a probe and your target by sending packets with increasing hop limits, so each router in turn reports back. It shows where along the path delay appears — which is how you tell a slow server from a slow route.",
    faqs: [
      {
        q: "Some hops show asterisks. Is the route broken?",
        a: "No. Many routers are configured not to answer traceroute probes while still forwarding traffic normally. Gaps in the middle are expected; only a trace that stops and never resumes indicates a real break.",
      },
      {
        q: "Why does one hop show high latency but later hops are fast?",
        a: "That router deprioritised your probe, which is cosmetic. Real trouble looks like latency that rises at a hop and stays high for every hop after it.",
      },
      {
        q: "Does the reply take the same path back?",
        a: "Not necessarily. Internet routing is often asymmetric, so the return route can be completely different. Tracing from both ends gives the full picture.",
      },
    ],
  },

  "ip-location": {
    title: "IP Location Lookup — Approximate Location of an IP",
    description:
      "Look up the approximate country, region and network for an IP address. Geolocation is an estimate from registry and routing data, not a street address.",
    keywords: [
      "ip location",
      "ip geolocation",
      "ip address location",
      "find ip location",
      "where is this ip",
    ],
    answer:
      "IP geolocation estimates where an address is used by combining registry records, routing data and commercial databases. Country is usually right, city often is not, and it never yields a street address.",
    faqs: [
      {
        q: "How accurate is IP geolocation?",
        a: "Country level is reliable, around 95–99%. City level is far weaker — frequently the provider's registered office or a regional hub rather than the actual user.",
      },
      {
        q: "Why does it show the wrong city?",
        a: "Providers assign addresses from centrally registered pools. Mobile networks especially route large regions through a few gateways, so everyone appears in one place.",
      },
      {
        q: "Can I find someone's exact address from their IP?",
        a: "No. That link exists only in your provider's subscriber records and is not public. Any service claiming street-level accuracy from an IP alone is overstating what is possible.",
      },
    ],
  },

  "email-header": {
    title: "Email Header Analyzer — Trace a Message's Route",
    description:
      "Paste a raw email header to see the servers a message passed through, how long each hop took, and whether SPF, DKIM and DMARC passed. Runs in your browser.",
    keywords: [
      "email header analyzer",
      "analyze email headers",
      "email header checker",
      "trace email",
      "check email authentication",
    ],
    answer:
      "An email header analyser reads the Received lines and authentication results in a raw message header, reconstructing the route a message took and showing whether it passed SPF, DKIM and DMARC. Your header is parsed in your browser and is not uploaded.",
    faqs: [
      {
        q: "Where do I get the raw header?",
        a: "In Gmail, open the message and choose Show original. In Outlook, use File then Properties. Most clients have a view-source or message-details option.",
      },
      {
        q: "Why are Received lines read from bottom to top?",
        a: "Each server prepends its own line, so the oldest hop — closest to the original sender — sits at the bottom and the most recent is at the top.",
      },
      {
        q: "Can email headers be faked?",
        a: "Everything below the first server you trust can be forged. That is precisely why the SPF, DKIM and DMARC results matter more than the addresses written in the header.",
      },
    ],
  },

  blacklist: {
    title: "Blacklist Check — Test an IP Against DNS Blocklists",
    description:
      "Check whether an IP address is listed on DNS-based blocklists used by mail servers. A listing is a common cause of email being rejected or filed as spam.",
    keywords: [
      "blacklist check",
      "ip blacklist checker",
      "dnsbl lookup",
      "check if ip is blacklisted",
      "email blacklist check",
    ],
    answer:
      "A blacklist check queries DNS-based blocklists (DNSBLs) to see whether they have flagged an IP address. Mail servers consult these lists when deciding whether to accept a connection, so a listing often explains rejected or spam-filed mail.",
    faqs: [
      {
        q: "I am listed. How do I get removed?",
        a: "Go to the listing provider directly — each runs its own delisting page. Fix the cause first (an open relay, a compromised account, a purchased list) or you will simply be relisted.",
      },
      {
        q: "Does a single listing block my mail?",
        a: "It depends who uses that list. A major list affects a great many receivers; an obscure one may affect almost none. Weight a listing by the list's actual reach.",
      },
      {
        q: "Should I check my IP address or my domain?",
        a: "The sending server's IP is what most blocklists evaluate. Domain-based lists exist too, but IP listings are the usual cause of outright connection refusals.",
      },
    ],
  },

  "ip-decimal": {
    title: "IP to Decimal Converter — Convert an IP to an Integer",
    description:
      "Convert an IPv4 address to its decimal integer form and back. Useful for database storage, range comparisons and firewall or ACL configuration.",
    keywords: [
      "ip to decimal",
      "ip to integer",
      "convert ip address",
      "ip decimal converter",
      "ipv4 to number",
    ],
    answer:
      "An IPv4 address is four bytes, so it can be written as a single 32-bit number: 192.168.1.1 becomes 3232235777. Storing addresses as integers turns range comparisons into simple numeric tests. The conversion runs in your browser.",
    faqs: [
      {
        q: "How is the number calculated?",
        a: "Each octet is weighted by position: (a × 16777216) + (b × 65536) + (c × 256) + d. So 192.168.1.1 gives 3232235777.",
      },
      {
        q: "Why store IP addresses as integers?",
        a: "Range queries become plain comparisons — BETWEEN two integers rather than string parsing — which indexes well and is much faster on large tables.",
      },
      {
        q: "Does this work for IPv6?",
        a: "Not as a 32-bit integer. IPv6 is 128 bits and needs a big-integer or binary column. Use the IPv6 tools for those addresses.",
      },
    ],
  },

  "ip-hostname": {
    title: "IP to Hostname — Resolve Reverse DNS for an Address",
    description:
      "Resolve an IP address to the hostname its owner has published via PTR. Turn the raw addresses in your server logs into names you can recognise.",
    keywords: [
      "ip to hostname",
      "resolve ip to hostname",
      "reverse dns lookup",
      "ptr lookup",
      "hostname from ip",
    ],
    answer:
      "Resolving an IP to a hostname reads the PTR record published for that address. It is the reverse of a normal lookup, and it only works when the address's network operator has published a record — many have not.",
    faqs: [
      {
        q: "No hostname was returned. What does that mean?",
        a: "No PTR record is published for the address. This is common and is not a fault; only the operator holding the address block can add one.",
      },
      {
        q: "Is the returned hostname trustworthy?",
        a: "Only after forward confirmation: resolve the hostname back and check it returns the original IP. A PTR alone is set by the address owner and can claim anything.",
      },
      {
        q: "Why do mail servers care about PTR records?",
        a: "Many receivers reject or penalise mail from addresses with no PTR, or whose PTR does not forward-confirm. It is a basic sign of a properly run mail server.",
      },
    ],
  },

  "ip-whois": {
    title: "IP WHOIS Lookup — Find Who Owns an IP Address",
    description:
      "Look up registration and allocation details for an IPv4 address via RDAP: the owning organisation, network range, country and abuse contact.",
    keywords: [
      "ip whois",
      "whois ip lookup",
      "who owns this ip",
      "ip registration lookup",
      "rdap lookup",
    ],
    answer:
      "An IP WHOIS lookup queries the regional internet registry, through RDAP, for the record covering an address. It returns the organisation the block is allocated to, the range it belongs to, and the abuse contact — the operator, not the end user.",
    faqs: [
      {
        q: "Does this tell me who was using the IP address?",
        a: "No. It identifies the organisation the block is allocated to, typically a provider or hosting company. Which customer held it at a given moment is internal to them.",
      },
      {
        q: "What is RDAP and why not classic WHOIS?",
        a: "RDAP is the structured JSON replacement for text WHOIS. It returns consistent, parseable fields and is what the registries now actively maintain.",
      },
      {
        q: "Where do I report abuse coming from an IP?",
        a: "To the abuse contact in this record. Include timestamps with time zones and log excerpts — a report without them is usually not actionable.",
      },
    ],
  },

  "ipv6-whois": {
    title: "IPv6 WHOIS Lookup — IPv6 Allocation and Registration",
    description:
      "Look up registration details for an IPv6 address or prefix via RDAP: the allocated organisation, the prefix size, country and abuse contact.",
    keywords: [
      "ipv6 whois",
      "ipv6 lookup",
      "ipv6 registration",
      "whois ipv6 address",
      "ipv6 rdap",
    ],
    answer:
      "An IPv6 WHOIS lookup queries the regional registry via RDAP for the record covering an IPv6 address, returning the organisation, the allocated prefix and the abuse contact. IPv6 allocations are large, so one record often covers an entire /32.",
    faqs: [
      {
        q: "Why does the record cover such a huge range?",
        a: "IPv6 allocations are deliberately generous: providers commonly receive a /32, which is 2^96 addresses. A single registry record legitimately spans an enormous block.",
      },
      {
        q: "Can I look up a single IPv6 address?",
        a: "Yes. Enter the full address and the registry returns whichever allocation contains it.",
      },
      {
        q: "Is IPv6 WHOIS data different from IPv4?",
        a: "It uses the same registries and the same RDAP protocol. Only the address format and the allocation sizes differ.",
      },
    ],
  },

  "ipv4-ipv6": {
    title: "IPv4 to IPv6 Converter — Create a Mapped Address",
    description:
      "Convert an IPv4 address into its IPv4-mapped IPv6 representation using the ::ffff: prefix. Runs entirely in your browser.",
    keywords: [
      "ipv4 to ipv6",
      "ipv4 mapped ipv6",
      "convert ipv4 to ipv6",
      "ipv6 mapped address",
      "ipv4 in ipv6",
    ],
    answer:
      "An IPv4-mapped IPv6 address embeds a 32-bit IPv4 address inside the IPv6 format using the ::ffff: prefix, so 192.168.1.1 becomes ::ffff:192.168.1.1. It lets IPv6-only software represent IPv4 endpoints; it does not give an IPv4 host IPv6 connectivity.",
    faqs: [
      {
        q: "Does this make my server reachable over IPv6?",
        a: "No. It is a notation for representing an IPv4 address in IPv6 form. Real IPv6 reachability needs an actual IPv6 address and an AAAA record.",
      },
      {
        q: "What does the ::ffff: prefix mean?",
        a: "It is the reserved prefix marking the remaining 32 bits as an IPv4 address, so software can distinguish a mapped address from a native IPv6 one.",
      },
      {
        q: "Where do mapped addresses turn up?",
        a: "In dual-stack sockets. A server listening on IPv6 often records IPv4 clients as ::ffff:203.0.113.5 in its logs.",
      },
    ],
  },

  "ipv6-generate": {
    title: "Local IPv6 Generator — Create a Unique Local Prefix",
    description:
      "Generate a random unique local IPv6 address prefix for private networks. Produces an RFC 4193 compliant /48 block entirely in your browser.",
    keywords: [
      "ipv6 generator",
      "unique local ipv6",
      "fd00 prefix generator",
      "private ipv6 address",
      "rfc 4193 generator",
    ],
    answer:
      "Unique local addresses are IPv6's private range, equivalent in purpose to 10.0.0.0/8 in IPv4. RFC 4193 asks you to pick the 40 bits after fd at random so two networks are unlikely to collide if they are ever joined — this generates such a /48.",
    faqs: [
      {
        q: "Why does the prefix have to be random?",
        a: "So that merging two private networks later does not create overlapping addresses. Everyone defaulting to the same prefix is exactly the collision the randomness avoids.",
      },
      {
        q: "Are these addresses routable on the internet?",
        a: "No, by design. Providers drop fc00::/7 traffic. They are for internal networks, in the same way 192.168.x.x is.",
      },
      {
        q: "How many subnets do I get from a /48?",
        a: "65,536 /64 subnets, which is the standard subnet size in IPv6 — far more than almost any private network needs.",
      },
    ],
  },

  "cidr-range": {
    title: "IPv6 CIDR to Range — Calculate a Prefix's Boundaries",
    description:
      "Convert an IPv6 CIDR prefix into its first and last address and total size. Works out the boundaries of any IPv6 block in your browser.",
    keywords: [
      "ipv6 cidr to range",
      "ipv6 subnet calculator",
      "cidr range calculator",
      "ipv6 prefix range",
      "calculate ipv6 block",
    ],
    answer:
      "An IPv6 CIDR prefix such as 2001:db8::/32 describes a block of addresses. This converts the prefix into its first address, last address and total count — what you need when writing firewall rules or planning allocations.",
    faqs: [
      {
        q: "What does the /32 mean?",
        a: "The number of leading bits fixed by the prefix. A /32 fixes the first 32 bits and leaves 96 free, so the block holds 2^96 addresses.",
      },
      {
        q: "Why are IPv6 blocks so large?",
        a: "The address space is 128 bits, so allocations are sized for easy subnetting rather than scarcity. A /64 per subnet is the norm even for two hosts.",
      },
      {
        q: "Is the first address reserved like IPv4's network address?",
        a: "IPv6 has no broadcast address, but the all-zeros host address is reserved as the subnet-router anycast address. In practice you do not assign it to a host.",
      },
    ],
  },

  "range-cidr": {
    title: "IPv6 Range to CIDR — Convert a Range into CIDR Blocks",
    description:
      "Turn a start and end IPv6 address into the smallest set of CIDR blocks that cover it exactly. Useful for writing precise firewall and routing rules.",
    keywords: [
      "ipv6 range to cidr",
      "range to cidr converter",
      "ipv6 cidr calculator",
      "convert ip range to cidr",
      "cidr block calculator",
    ],
    answer:
      "An arbitrary address range rarely lines up with a single CIDR prefix, so it has to be expressed as several. This finds the smallest set of IPv6 CIDR blocks covering the range exactly — no more and no fewer addresses.",
    faqs: [
      {
        q: "Why does one range produce several blocks?",
        a: "CIDR blocks must start on a power-of-two boundary. A range beginning or ending mid-boundary can only be covered by combining differently sized blocks.",
      },
      {
        q: "Can I just use one bigger block instead?",
        a: "You can, but it would include addresses outside your range. In a firewall rule that means permitting or blocking more than you intended.",
      },
      {
        q: "Does the order of the blocks matter?",
        a: "Not for coverage. Most rule engines evaluate them independently, though some match first-hit — check your platform's semantics.",
      },
    ],
  },

  "ipv6-compress": {
    title: "IPv6 Compression — Shorten an Address to Canonical Form",
    description:
      "Compress a full IPv6 address into its canonical short form: strip leading zeros and collapse the longest run of zero groups with a double colon.",
    keywords: [
      "ipv6 compress",
      "shorten ipv6 address",
      "ipv6 canonical form",
      "compress ipv6",
      "ipv6 shortener",
    ],
    answer:
      "IPv6 addresses can be written compactly by dropping leading zeros in each group and replacing the longest run of all-zero groups with a double colon. RFC 5952 defines one canonical form so the same address is always written the same way.",
    faqs: [
      {
        q: "Can I use the double colon more than once?",
        a: "No. With two, there would be no way to tell how many zero groups each stands for. Exactly one per address.",
      },
      {
        q: "Which run of zeros gets collapsed?",
        a: "The longest one. If two runs are the same length, the leftmost is collapsed — that rule is what makes the canonical form unique.",
      },
      {
        q: "Is the compressed address the same address?",
        a: "Identical. Compression is purely notation; the underlying 128 bits do not change.",
      },
    ],
  },

  "ipv6-expand": {
    title: "IPv6 Expand — Show the Full Uncompressed Address",
    description:
      "Expand a shortened IPv6 address into all eight groups with leading zeros restored, making addresses directly comparable in scripts and logs.",
    keywords: [
      "ipv6 expand",
      "expand ipv6 address",
      "full ipv6 address",
      "uncompress ipv6",
      "ipv6 long form",
    ],
    answer:
      "Expanding an IPv6 address restores every one of the eight 16-bit groups and their leading zeros, turning 2001:db8::1 into 2001:0db8:0000:0000:0000:0000:0000:0001. The fixed-width form is what you want when comparing or sorting addresses as text.",
    faqs: [
      {
        q: "Why expand at all?",
        a: "Because two different-looking strings can be the same address. Expanding both produces a single fixed-width form that plain string comparison handles correctly.",
      },
      {
        q: "Is the expanded form valid to use?",
        a: "Yes, everywhere — it is simply more verbose. RFC 5952 prefers the compressed form for display.",
      },
      {
        q: "How many characters is a full IPv6 address?",
        a: "Thirty-nine: eight groups of four hex digits plus the seven colons between them.",
      },
    ],
  },

  subnet: {
    title: "IP Subnet Calculator — Network Range, Mask and Hosts",
    description:
      "Calculate an IPv4 subnet's network address, broadcast address, usable host range and total capacity from an address and prefix length.",
    keywords: [
      "subnet calculator",
      "ip subnet calculator",
      "cidr calculator",
      "subnet mask calculator",
      "network calculator",
    ],
    answer:
      "A subnet calculator takes an address and a prefix length and works out the network address, the broadcast address, the usable host range and how many hosts fit. A /24 covers 256 addresses, of which 254 are assignable.",
    faqs: [
      {
        q: "Why are two addresses unusable in each subnet?",
        a: "The first is the network identifier and the last is the broadcast address. Neither can be assigned to a host, so a /24 yields 254 usable addresses rather than 256.",
      },
      {
        q: "What is the relationship between /24 and 255.255.255.0?",
        a: "They are the same mask written two ways. /24 means 24 leading one-bits, which written as four octets is 255.255.255.0.",
      },
      {
        q: "How do I choose a prefix length?",
        a: "Count the hosts you need, add headroom, then pick the smallest subnet that fits: /29 gives 6 usable, /28 gives 14, /27 gives 30, /24 gives 254.",
      },
    ],
  },

  "ipv6-ipv4": {
    title: "IPv6 to IPv4 — Extract the Embedded IPv4 Address",
    description:
      "Pull the IPv4 address out of an IPv4-mapped IPv6 address such as ::ffff:192.168.1.1. Runs entirely in your browser.",
    keywords: [
      "ipv6 to ipv4",
      "extract ipv4 from ipv6",
      "ipv4 mapped address",
      "convert ipv6 to ipv4",
      "ipv6 ipv4 converter",
    ],
    answer:
      "An IPv4-mapped IPv6 address carries a real IPv4 address in its last 32 bits behind the ::ffff: prefix. This extracts that address, which is useful when server logs record IPv4 clients in mapped form.",
    faqs: [
      {
        q: "Can any IPv6 address be converted to IPv4?",
        a: "No. Only addresses that embed one — mapped (::ffff:) and some transition formats. A native IPv6 address has no IPv4 equivalent.",
      },
      {
        q: "Why do my logs show ::ffff: addresses?",
        a: "A dual-stack socket listening on IPv6 reports IPv4 clients in mapped form. It is the same client, written the way the IPv6 socket sees it.",
      },
      {
        q: "Should I store the mapped or the extracted form?",
        a: "Store consistently. Normalising mapped addresses to plain IPv4 before writing them avoids the same client appearing as two different values.",
      },
    ],
  },

  "ipv6-check": {
    title: "IPv6 Compatibility Check — Is Your Domain IPv6 Ready?",
    description:
      "Check whether a domain publishes AAAA records and answers over IPv6, so you know whether IPv6-only clients can actually reach your site.",
    keywords: [
      "ipv6 check",
      "ipv6 compatibility test",
      "is my site ipv6 ready",
      "aaaa record check",
      "ipv6 test",
    ],
    answer:
      "An IPv6 compatibility check looks for the AAAA records a domain publishes and whether those addresses respond. Publishing AAAA without a listening service is worse than publishing none, because IPv6 clients will try it and fail.",
    faqs: [
      {
        q: "What is an AAAA record?",
        a: "The IPv6 equivalent of an A record. It maps a hostname to an IPv6 address, and without one IPv6-only clients cannot reach you directly.",
      },
      {
        q: "Do I need IPv6 for SEO?",
        a: "Google does not rank on IPv6 support. The real reason is reachability: mobile networks increasingly run IPv6-only and reach IPv4 through a translator that adds latency and failure modes.",
      },
      {
        q: "I have AAAA records but IPv6 users report errors. Why?",
        a: "Usually the service is not bound to the IPv6 address, or a firewall rule was only written for IPv4. Publishing the record is the last step, not the first.",
      },
    ],
  },

  "my-isp": {
    title: "What Is My ISP? — Identify Your Internet Provider",
    description:
      "See which internet provider and network your connection comes from, based on the public IP this site receives, including the autonomous system behind it.",
    keywords: [
      "what is my isp",
      "who is my internet provider",
      "my isp lookup",
      "check my isp",
      "my network provider",
    ],
    answer:
      "Your ISP is identified from the registry record for your public IP address: the organisation holding the address block and the autonomous system that announces it. This is the network operator's identity, which may be a wholesale carrier rather than the brand you pay.",
    faqs: [
      {
        q: "Why is a company I have never heard of shown?",
        a: "Many retail providers resell capacity from a wholesale network, and mobile operators route through parent companies. The registry shows whoever holds the address block.",
      },
      {
        q: "Does this change when I use a VPN?",
        a: "Yes — that is the point of one. You will see the VPN provider's network instead of your own, because the site only ever sees the exit address.",
      },
      {
        q: "What is an ASN?",
        a: "An autonomous system number identifying a network that announces routes on the internet. It is a more stable identifier for a network than any single IP range.",
      },
    ],
  },

  "domain-ip": {
    title: "Domain to IP — Find a Website's IPv4 and IPv6 Addresses",
    description:
      "Resolve a domain name to the IP addresses it publishes. See both the A (IPv4) and AAAA (IPv6) records currently returned by a public resolver.",
    keywords: [
      "domain to ip",
      "find website ip",
      "resolve domain to ip",
      "get ip from domain",
      "website ip lookup",
    ],
    answer:
      "Resolving a domain to an IP reads its A record for IPv4 and its AAAA record for IPv6. A domain can publish several addresses for load balancing, and a CDN returns different addresses depending on where the query comes from.",
    faqs: [
      {
        q: "Why does the address differ from what I get locally?",
        a: "CDNs answer with the nearest edge server, so the result depends on the resolver's location. Your device may also be holding a cached answer.",
      },
      {
        q: "Several IP addresses came back. Which one is correct?",
        a: "All of them. Publishing multiple A records spreads traffic across servers; clients pick one and retry another if it fails.",
      },
      {
        q: "Can I open a website by its IP address directly?",
        a: "You reach the server, but shared hosting and CDNs route by the Host header, so an IP-only request usually lands on a default page rather than your site.",
      },
    ],
  },

  /* ----------------------------- Dev Tools ---------------------------- */

  headers: {
    title: "HTTP Header Checker — Inspect Responses and Redirects",
    description:
      "Fetch a URL and inspect its HTTP status, response headers and redirect chain. Check caching, security and content-type headers as a browser receives them.",
    keywords: [
      "http header checker",
      "check http headers",
      "response headers",
      "redirect checker",
      "header analyzer",
    ],
    answer:
      "HTTP headers are the metadata a server returns with every response: status code, content type, caching rules, cookies and security policies. This fetches a URL and shows those headers along with each step of any redirect chain.",
    faqs: [
      {
        q: "Why does my redirect chain matter?",
        a: "Every hop adds a round trip before anything renders, and long chains dilute link signals. Redirect to the final URL in one step wherever you can.",
      },
      {
        q: "Which security headers should I have?",
        a: "At minimum Strict-Transport-Security, X-Content-Type-Options: nosniff and a Content-Security-Policy. Referrer-Policy and a frame policy are worth adding too.",
      },
      {
        q: "What is the difference between a 301 and a 302?",
        a: "301 is permanent: clients and search engines update to the new URL and may cache the redirect indefinitely. 302 is temporary and keeps the original URL authoritative.",
      },
    ],
  },

  "server-os": {
    title: "Website Server Software Checker — What Is a Site Running?",
    description:
      "Inspect the server software a website advertises in its response headers. Shows what is disclosed — not a reliable fingerprint of the operating system.",
    keywords: [
      "server software checker",
      "what server is a site running",
      "check web server",
      "server header lookup",
      "detect web server",
    ],
    answer:
      "Websites may advertise their software in the Server and X-Powered-By headers. This shows what a site discloses. Many servers remove or falsify these headers, and none of them reliably reveal the operating system underneath.",
    faqs: [
      {
        q: "Can you detect the operating system?",
        a: "Not reliably, and this tool does not claim to. A Server header names the web server software at most; the OS underneath is not disclosed, and guessing it produces wrong answers.",
      },
      {
        q: "No server header was returned. Why?",
        a: "It was deliberately removed, or a CDN or proxy replaced it. Suppressing it is a common and sensible hardening step.",
      },
      {
        q: "Should I hide my own server header?",
        a: "It is mild obscurity — it will not stop a determined scanner, but it removes a free hint. Keeping software patched matters far more than hiding the version.",
      },
    ],
  },

  "md5-base64": {
    title: "MD5 and Base64 Tool — Hash and Encode in Your Browser",
    description:
      "Generate an MD5 digest or encode and decode Base64 text, entirely in your browser. Nothing you type is uploaded to a server.",
    keywords: [
      "md5 generator",
      "base64 encode",
      "base64 decode",
      "md5 hash online",
      "encode decode text",
    ],
    answer:
      "MD5 produces a fixed 128-bit fingerprint of your input; Base64 re-encodes bytes as text so they survive systems that expect plain text. Both run in your browser. Base64 is encoding, not encryption — anyone can decode it.",
    faqs: [
      {
        q: "Is MD5 safe for storing passwords?",
        a: "No. MD5 is fast and has practical collision attacks, which is the opposite of what password storage needs. Use bcrypt, scrypt or Argon2 with a per-user salt.",
      },
      {
        q: "Is Base64 a form of encryption?",
        a: "No. It is a reversible encoding with no key. Anything Base64-encoded is readable by anyone who decodes it, so never use it to protect secrets.",
      },
      {
        q: "What is MD5 still reasonable for?",
        a: "Non-adversarial checksums: detecting accidental corruption, cache keys, deduplication. Anywhere an attacker might craft the input, use SHA-256 instead.",
      },
    ],
  },

  "url-opener": {
    title: "Multi URL Opener — Open a List of Links at Once",
    description:
      "Paste a list of URLs, validate them, and open them individually or all together. Everything is processed in your browser.",
    keywords: [
      "multi url opener",
      "open multiple urls",
      "bulk url opener",
      "open links at once",
      "url list opener",
    ],
    answer:
      "A multi URL opener takes a pasted list of addresses, checks each one is a valid URL, and gives you a clickable set you can open one at a time or all at once — instead of pasting each into the address bar.",
    faqs: [
      {
        q: "Why did some URLs not open?",
        a: "Browsers block bulk pop-ups by default. Allow pop-ups for this site, or open the list in smaller batches.",
      },
      {
        q: "Are my URLs uploaded anywhere?",
        a: "No. Validation and link building happen in your browser; the list is never sent to a server.",
      },
      {
        q: "Do the URLs need to include https://?",
        a: "Including the scheme is safest. Without it, a bare domain can be read as a relative path rather than an absolute address.",
      },
    ],
  },

  smtp: {
    title: "SMTP Test — Check Mail Server Connectivity",
    description:
      "Test whether a mail server accepts connections on its SMTP port from a remote probe. A first check when outbound or inbound mail is failing.",
    keywords: [
      "smtp test",
      "smtp connection test",
      "test mail server",
      "check smtp port",
      "mail server connectivity",
    ],
    answer:
      "An SMTP test opens a TCP connection to a mail server's port from a remote probe to confirm it is reachable from the internet. It answers reachability; full protocol negotiation and authentication are a separate matter.",
    faqs: [
      {
        q: "Which SMTP port should I test?",
        a: "587 for authenticated submission from clients, 465 for implicit TLS, and 25 for server-to-server delivery. Most consumer networks block outbound port 25.",
      },
      {
        q: "The connection fails but my mail works. How?",
        a: "Your provider may accept connections only from specific networks, or a firewall may allow your server while blocking the probe. Reachability from one place does not generalise.",
      },
      {
        q: "Does this test whether mail will be delivered?",
        a: "No. It tests that the port answers. Delivery also depends on authentication, SPF/DKIM/DMARC alignment, content filtering and sending reputation.",
      },
    ],
  },

  htaccess: {
    title: "HTACCESS Redirect Generator — Build Apache Redirect Rules",
    description:
      "Generate Apache .htaccess redirect directives for single pages, whole domains, HTTPS and www changes. Built in your browser, ready to review and copy.",
    keywords: [
      "htaccess generator",
      "htaccess redirect",
      "apache redirect generator",
      "301 redirect htaccess",
      "create htaccess rules",
    ],
    answer:
      "A .htaccess redirect generator writes the Apache directives that send one URL to another — a page move, forcing HTTPS, or adding and removing www — with the correct syntax and status code. The rules are built in your browser for you to review before use.",
    faqs: [
      {
        q: "Where does the .htaccess file go?",
        a: "In the directory it should apply to, usually the site root. It applies to that directory and everything beneath it.",
      },
      {
        q: "Which status code should a permanent move use?",
        a: "301. It tells browsers and search engines the move is permanent so they update to the new URL. Use 302 only when you genuinely intend to move back.",
      },
      {
        q: "My rules do nothing. Why?",
        a: "Apache must have AllowOverride enabled for the directory and mod_rewrite loaded. On nginx, .htaccess is ignored entirely — it is an Apache-only mechanism.",
      },
    ],
  },

  rewrite: {
    title: "URL Rewrite Generator — Create Clean URL Rules",
    description:
      "Generate Apache mod_rewrite rules that map clean, readable URLs onto query-string paths. Built and previewed in your browser.",
    keywords: [
      "url rewrite generator",
      "mod_rewrite generator",
      "clean url rules",
      "rewrite rule generator",
      "apache rewrite",
    ],
    answer:
      "URL rewriting lets a server accept a readable address such as /products/shoes while internally serving /product.php?cat=shoes. This generates the mod_rewrite rules for that mapping, so the tidy URL is what visitors and search engines see.",
    faqs: [
      {
        q: "Is rewriting the same as redirecting?",
        a: "No. A rewrite is internal and the visitor's address bar does not change. A redirect sends the browser to a different URL and is visible.",
      },
      {
        q: "Do clean URLs help SEO?",
        a: "Mildly and indirectly. Readable URLs earn better click-through and cleaner inbound links; the rewrite itself is not a ranking factor.",
      },
      {
        q: "Will these rules work on nginx?",
        a: "No. These are Apache mod_rewrite directives. nginx uses its own rewrite and try_files syntax inside the server block.",
      },
    ],
  },

  "broken-links": {
    title: "Broken Link Checker — Find Dead Links on a Page",
    description:
      "Scan a web page's links and check which ones fail. Finds 404s and unreachable destinations across a sample of the links on the page.",
    keywords: [
      "broken link checker",
      "find broken links",
      "dead link checker",
      "404 checker",
      "check links on page",
    ],
    answer:
      "A broken link checker collects the links on a page and requests each one, reporting the status it gets back. A 404 means the target is gone; a timeout may only mean the destination is slow or blocking automated requests.",
    faqs: [
      {
        q: "How many links are checked?",
        a: "A bounded sample from the page, so the check finishes quickly and does not hammer the targets. It is a spot check, not a full site crawl.",
      },
      {
        q: "A link works in my browser but is reported broken. Why?",
        a: "Some sites block automated requests, require a session, or rate-limit repeated hits. Always confirm a reported failure by hand before deleting the link.",
      },
      {
        q: "Do broken links hurt SEO?",
        a: "Broken outbound links mainly hurt visitors. Broken internal links matter more: they waste crawl budget and strand pages that would otherwise be reachable.",
      },
    ],
  },

  "open-graph": {
    title: "Open Graph Checker — Preview and Generate Social Tags",
    description:
      "Inspect a page's Open Graph and Twitter Card tags to see how it will appear when shared, or generate the tags you are missing.",
    keywords: [
      "open graph checker",
      "og tag checker",
      "social preview test",
      "twitter card validator",
      "generate og tags",
    ],
    answer:
      "Open Graph tags tell social platforms what title, description and image to show when a link is shared. This reads the tags a page publishes and shows the preview they produce, or generates a correct set when they are missing.",
    faqs: [
      {
        q: "What size should the og:image be?",
        a: "1200×630 pixels, under about 5 MB, served over HTTPS at an absolute URL. Smaller images get cropped or downgraded to a small thumbnail.",
      },
      {
        q: "I updated my tags but the old preview still shows. Why?",
        a: "Platforms cache aggressively. Use the platform's own debugger — Facebook's Sharing Debugger or LinkedIn's Post Inspector — to force a re-scrape.",
      },
      {
        q: "Do I need Twitter Card tags as well as Open Graph?",
        a: "X falls back to Open Graph for most fields, so a complete OG set usually suffices. Add twitter:card only when you want a specific card type.",
      },
    ],
  },

  raid: {
    title: "RAID Calculator — Usable Capacity and Fault Tolerance",
    description:
      "Calculate usable storage, overhead and drive-failure tolerance for RAID 0, 1, 5, 6 and 10 from your drive count and drive size.",
    keywords: [
      "raid calculator",
      "raid capacity calculator",
      "usable storage calculator",
      "raid 5 calculator",
      "raid fault tolerance",
    ],
    answer:
      "A RAID calculator works out how much of your raw drive capacity is actually usable under a given RAID level, and how many drives can fail before data is lost. RAID 5 loses one drive's worth to parity, RAID 6 loses two, and RAID 10 halves capacity.",
    faqs: [
      {
        q: "Which RAID level should I use?",
        a: "RAID 6 or RAID 10 for anything you care about. RAID 5 on large modern drives risks a second failure during the long rebuild, and RAID 0 has no redundancy at all.",
      },
      {
        q: "Is RAID a backup?",
        a: "No, and this is the mistake that loses data. RAID survives drive failure. It does not survive deletion, ransomware, corruption, theft or fire. Keep separate backups.",
      },
      {
        q: "Why is usable capacity less than the drives add up to?",
        a: "Parity and mirroring consume space, and drive vendors count in decimal terabytes while operating systems display binary — roughly 9% smaller on screen.",
      },
    ],
  },

  "binary-text": {
    title: "Binary to Text Converter — Decode Binary to UTF-8",
    description:
      "Convert binary digits into readable UTF-8 text. Paste groups of eight bits and decode them entirely in your browser.",
    keywords: [
      "binary to text",
      "binary decoder",
      "convert binary to text",
      "binary translator",
      "decode binary",
    ],
    answer:
      "Binary-to-text conversion reads groups of eight bits as bytes and decodes those bytes as UTF-8 characters, so 01001000 becomes H. The conversion happens in your browser.",
    faqs: [
      {
        q: "How should the binary be formatted?",
        a: "Groups of eight digits, separated by spaces or run together. Characters other than 0 and 1 are ignored, and a length that is not a multiple of eight cannot decode cleanly.",
      },
      {
        q: "Why did I get strange characters?",
        a: "The bytes are not valid UTF-8 — either a different encoding, or the grouping is off by a bit. Check that every group is exactly eight digits.",
      },
      {
        q: "Is binary the same as Base64?",
        a: "No. Binary here is the literal bit pattern of each byte. Base64 packs three bytes into four printable characters and is far more compact.",
      },
    ],
  },

  "text-binary": {
    title: "Text to Binary Converter — Encode UTF-8 as Binary",
    description:
      "Convert text into its binary representation, showing the UTF-8 bytes as groups of eight bits. Runs entirely in your browser.",
    keywords: [
      "text to binary",
      "binary encoder",
      "convert text to binary",
      "string to binary",
      "text binary converter",
    ],
    answer:
      "Text-to-binary conversion encodes your text as UTF-8 bytes and writes each byte as eight binary digits. ASCII characters use one byte each; accented letters, other scripts and emoji use two to four.",
    faqs: [
      {
        q: "Why do some characters produce more than eight digits?",
        a: "UTF-8 is variable width. A–Z take one byte, most accented, Greek and Cyrillic letters take two, most CJK characters three, and emoji four.",
      },
      {
        q: "Is there a standard way to separate the groups?",
        a: "No formal standard — spaces between bytes are the usual convention for readability. Machines do not need any separator.",
      },
      {
        q: "Can I convert the result back?",
        a: "Yes, with the binary-to-text tool. The round trip is lossless as long as the grouping is preserved.",
      },
    ],
  },

  json: {
    title: "JSON Formatter and Validator — Beautify, Minify, Check",
    description:
      "Validate, beautify and minify JSON in your browser. Get the exact position of a syntax error instead of a vague parse failure.",
    keywords: [
      "json formatter",
      "json validator",
      "json beautifier",
      "format json online",
      "minify json",
    ],
    answer:
      "A JSON formatter parses your input, reports any syntax error with its position, and re-prints the data either indented for reading or minified for transport. Your JSON is processed in your browser and never uploaded.",
    faqs: [
      {
        q: "Why is my JSON invalid when it looks fine?",
        a: "Nearly always a trailing comma, single quotes instead of double, or an unquoted key. JSON is stricter than JavaScript object syntax — all three are legal in JS and illegal in JSON.",
      },
      {
        q: "Does formatting change my data?",
        a: "No. Only whitespace changes. Key order is preserved as written and values are untouched.",
      },
      {
        q: "Is it safe to paste sensitive JSON here?",
        a: "It is parsed in your browser and not transmitted, and ad scripts are excluded from this page. Even so, treat any browser tool with care when handling production secrets.",
      },
    ],
  },

  "email-verify": {
    title: "Email Verifier — Check Address Syntax and Mail Routing",
    description:
      "Check an email address's syntax and whether its domain can receive mail. Confirms the domain is set up for email — it cannot prove a mailbox exists.",
    keywords: [
      "email verifier",
      "verify email address",
      "email validation",
      "check email exists",
      "email checker",
    ],
    answer:
      "Email verification checks that an address is syntactically valid and that its domain publishes working mail records. It cannot confirm a specific mailbox exists — most providers deliberately refuse to answer that, so any tool claiming certainty is guessing.",
    faqs: [
      {
        q: "Can you tell me if this mailbox really exists?",
        a: "No, and be sceptical of tools that claim they can. Most mail servers accept all recipients at connection time and bounce later, specifically to defeat address harvesting.",
      },
      {
        q: "What does a valid result actually mean?",
        a: "The syntax is correct and the domain is configured to receive mail. It is a filter for typos and dead domains, not a delivery guarantee.",
      },
      {
        q: "Will this reduce my bounce rate?",
        a: "It removes malformed addresses and dead domains, which is a real share of bounces. It will not catch a correctly formed address at a live domain that was never a real mailbox.",
      },
    ],
  },

  /* -------------------------- Webmasters Tools ------------------------ */

  "link-analyzer": {
    title: "Website Link Analyzer — Internal, External Links, Anchors",
    description:
      "Analyse the links on a web page: internal versus external, their anchor text and their destinations. See a page's link structure the way a crawler does.",
    keywords: [
      "link analyzer",
      "internal link checker",
      "external link analysis",
      "anchor text checker",
      "website link structure",
    ],
    answer:
      "A link analyser collects every link on a page and sorts them into internal and external, showing each destination and its anchor text. That breakdown is how search engines read a page's relationship to the rest of your site.",
    faqs: [
      {
        q: "Why does anchor text matter?",
        a: "It is one of the strongest signals about what the destination page is about. Generic anchors such as 'click here' waste that signal; descriptive anchors do not.",
      },
      {
        q: "How many links should a page have?",
        a: "There is no hard limit any more. Keep them purposeful — a page of a hundred navigation links spreads its signal thinly and reads poorly.",
      },
      {
        q: "Should external links be nofollow?",
        a: "Only when they are paid, user-generated or untrusted. Ordinary editorial links to good sources should stay followed; that is normal, healthy linking.",
      },
    ],
  },

  "user-agent": {
    title: "User Agent Checker — See Your Browser's User Agent",
    description:
      "See the user-agent string your browser sends, along with the display and platform details it exposes. Read directly from your browser.",
    keywords: [
      "user agent checker",
      "my user agent",
      "what is my user agent",
      "browser user agent",
      "check user agent string",
    ],
    answer:
      "The user-agent string is a line of text your browser sends with every request, describing itself and its platform. This shows yours verbatim, plus the screen and platform values your browser exposes to pages.",
    faqs: [
      {
        q: "Why does my user agent mention browsers I do not use?",
        a: "Historical compatibility. Nearly every user agent still claims Mozilla/5.0 and often Safari and Chrome, because sites once sniffed for them. The strings are largely legacy fiction.",
      },
      {
        q: "Can a user agent be changed?",
        a: "Easily — browsers expose it in developer tools and any HTTP client can set it freely. Never rely on it for a security decision.",
      },
      {
        q: "Is the user agent going away?",
        a: "It is being frozen and reduced to limit fingerprinting. Chromium is moving to Client Hints, where a site must explicitly request the details it needs.",
      },
    ],
  },

  pagerank: {
    title: "PageRank Checker — Why Public PageRank No Longer Exists",
    description:
      "Check the availability of public PageRank data. Google retired the public Toolbar PageRank score in 2016 and publishes no replacement number.",
    keywords: [
      "pagerank checker",
      "google pagerank",
      "check pagerank",
      "page authority",
      "pagerank score",
    ],
    answer:
      "Google shut down public Toolbar PageRank in 2016 and has published no public score since. PageRank still exists internally as one of many ranking signals, but there is no official number to look up — so this page explains the situation rather than inventing a figure.",
    faqs: [
      {
        q: "Why do other sites still show me a PageRank score?",
        a: "They show a proprietary metric of their own, or a fabricated number. No third party has access to Google's internal PageRank.",
      },
      {
        q: "What should I use instead?",
        a: "Search Console for your own impressions, clicks and average position — that is real data about your site. Third-party authority scores are estimates, useful only for rough comparison.",
      },
      {
        q: "Does PageRank still matter?",
        a: "Link-based authority still matters as part of ranking. What is gone is the public, single-number representation of it.",
      },
    ],
  },

  punycode: {
    title: "Punycode Converter — Convert IDN Domains to ASCII",
    description:
      "Convert internationalised domain names to their Punycode (xn--) ASCII form and back. Works in both directions, entirely in your browser.",
    keywords: [
      "punycode converter",
      "idn converter",
      "xn-- converter",
      "punycode decode",
      "international domain name",
    ],
    answer:
      "DNS only carries ASCII, so a domain containing non-ASCII characters is encoded as Punycode, beginning with xn--. This converts between the readable Unicode form and the xn-- form that DNS and registrars actually use.",
    faqs: [
      {
        q: "Why do some domains start with xn--?",
        a: "That prefix marks a Punycode-encoded label. Everything after it encodes the original Unicode characters in ASCII so DNS can transport the name.",
      },
      {
        q: "Are IDN domains a security risk?",
        a: "They can be. Characters from different scripts can look identical to Latin ones, enabling lookalike domains. Browsers show the Punycode form when a name mixes scripts suspiciously.",
      },
      {
        q: "Which form do I register and configure?",
        a: "Register the Unicode name; the registrar converts it. In DNS records, TLS certificates and server configuration, use the xn-- form.",
      },
    ],
  },

  serp: {
    title: "Google SERP Simulator — Preview Your Title and Description",
    description:
      "Preview how a page's title and meta description will look in Google results, and see where they will be truncated. Runs in your browser.",
    keywords: [
      "serp simulator",
      "serp preview",
      "google snippet preview",
      "meta description length",
      "title tag preview",
    ],
    answer:
      "A SERP simulator renders your title and meta description the way a search result displays them, showing where each will be cut off. Google truncates by pixel width rather than character count, so wide characters run out of room sooner.",
    faqs: [
      {
        q: "How long should a title tag be?",
        a: "Roughly 50–60 characters, but the real limit is around 580 pixels on desktop. Front-load the important words so a truncation still reads sensibly.",
      },
      {
        q: "Does the meta description affect rankings?",
        a: "Not directly. It affects click-through, which is worth the effort on its own. Google also rewrites descriptions often when it judges another snippet fits the query better.",
      },
      {
        q: "Why does Google show different text than I wrote?",
        a: "It substitutes on-page text when that better matches the query. A well-written description is used more often, but it is a suggestion rather than a directive.",
      },
    ],
  },

  robots: {
    title: "Robots.txt Generator — Crawler Rules and Sitemap Lines",
    description:
      "Generate a robots.txt file with crawler allow and disallow rules and sitemap references. Built in your browser, ready to review before publishing.",
    keywords: [
      "robots.txt generator",
      "create robots.txt",
      "robots txt file",
      "crawler rules generator",
      "disallow generator",
    ],
    answer:
      "robots.txt sits at your domain root and tells crawlers which paths they may request. This builds one from your allow and disallow rules and sitemap URLs. Note that it controls crawling, not indexing.",
    faqs: [
      {
        q: "Does Disallow keep a page out of Google?",
        a: "No — this is the most common misunderstanding. Disallow stops crawling, but a blocked URL can still be indexed from external links. To keep a page out of the index, allow crawling and use a noindex meta tag.",
      },
      {
        q: "Where must robots.txt be placed?",
        a: "At the domain root, exactly at /robots.txt. A file in a subdirectory is ignored, and every subdomain needs its own.",
      },
      {
        q: "Should I block AI crawlers?",
        a: "Your call. Blocking them removes your content from AI-generated answers, which is increasingly a traffic source. Many sites now allow them deliberately for that visibility.",
      },
    ],
  },

  /* --------------------------- Network Tools -------------------------- */

  port: {
    title: "Port Checker — Test if a TCP Port Is Open",
    description:
      "Check whether a public TCP port accepts connections, tested from a remote probe. Confirms whether a service is reachable from outside your own network.",
    keywords: [
      "port checker",
      "open port check",
      "test port online",
      "check if port is open",
      "tcp port test",
    ],
    answer:
      "A port check attempts a TCP connection to a host and port from a remote probe. If it connects, the port is open and something is listening; if it is refused or times out, either nothing is listening or a firewall is blocking the attempt.",
    faqs: [
      {
        q: "What is the difference between refused and timed out?",
        a: "Refused means the host answered and nothing is listening on that port. Timed out means nothing answered at all — usually a firewall dropping the packet silently.",
      },
      {
        q: "The port is open locally but closed here. Why?",
        a: "Something between the probe and your service blocks it: a router without port forwarding, a cloud security group, a host firewall, or a service bound to 127.0.0.1 rather than all interfaces.",
      },
      {
        q: "Which ports should be open?",
        a: "Only the ones you actively serve — typically 80 and 443 for web. Databases, SSH and admin interfaces should be restricted by source address rather than exposed to the internet.",
      },
    ],
  },

  "mac-lookup": {
    title: "MAC Address Lookup — Find the Vendor for a MAC Prefix",
    description:
      "Look up the manufacturer registered to a MAC address prefix. The first three bytes identify the vendor through the IEEE OUI registry.",
    keywords: [
      "mac address lookup",
      "mac vendor lookup",
      "oui lookup",
      "find mac manufacturer",
      "mac address vendor",
    ],
    answer:
      "The first three bytes of a MAC address form the Organisationally Unique Identifier, assigned by the IEEE to a manufacturer. Looking that prefix up identifies who made the network interface, which helps when recognising unknown devices on a network.",
    faqs: [
      {
        q: "Why does my phone show an unknown vendor?",
        a: "Modern phones randomise their MAC address per network for privacy. A randomised address has the locally-administered bit set and matches no registered vendor.",
      },
      {
        q: "Can a MAC address be changed?",
        a: "Yes, trivially, on most operating systems. Treat it as a hint about a device, never as an authentication factor.",
      },
      {
        q: "Does the vendor tell me the device model?",
        a: "No, only the manufacturer of the network interface — and large vendors hold many prefixes spanning very different products.",
      },
    ],
  },

  "mac-generator": {
    title: "MAC Address Generator — Locally Administered Addresses",
    description:
      "Generate random locally administered unicast MAC addresses for testing, virtual machines and lab networks. Built in your browser.",
    keywords: [
      "mac address generator",
      "random mac address",
      "generate mac address",
      "locally administered mac",
      "virtual mac address",
    ],
    answer:
      "A locally administered MAC address is one you assign yourself rather than one burned in by a manufacturer, marked by a specific bit in the first byte. This generates random unicast addresses in that range, so they cannot collide with any real vendor's allocation.",
    faqs: [
      {
        q: "What makes an address locally administered?",
        a: "The second-least-significant bit of the first byte is set to 1. That marks the address as assigned locally rather than by the IEEE.",
      },
      {
        q: "Why not just make up any MAC address?",
        a: "A random address could duplicate a real vendor's allocation and collide on a network. The locally administered range exists precisely to avoid that.",
      },
      {
        q: "What are these addresses used for?",
        a: "Virtual machine interfaces, container networking, lab setups and testing — anywhere you need a unique address without a physical card.",
      },
    ],
  },

  asn: {
    title: "ASN WHOIS Lookup — Autonomous System Registration",
    description:
      "Look up an autonomous system number to find the network that operates it, its registry record, country and contact details.",
    keywords: [
      "asn lookup",
      "autonomous system lookup",
      "asn whois",
      "as number lookup",
      "bgp asn information",
    ],
    answer:
      "An autonomous system number identifies a network that announces its own routes on the internet — a provider, a hosting company or a large organisation. An ASN lookup returns the registry record for that number: the operator, its country and its contacts.",
    faqs: [
      {
        q: "What is an autonomous system?",
        a: "A set of IP prefixes under one routing policy, announced to the rest of the internet with BGP. Every provider of any size operates at least one.",
      },
      {
        q: "How do I find the ASN for an IP address?",
        a: "Use the IP WHOIS lookup — the registry record for an address block names the autonomous system that announces it.",
      },
      {
        q: "Why would I look up an ASN?",
        a: "To identify who really operates the network behind an address, to investigate abuse across a provider's whole range, or to understand routing and peering relationships.",
      },
    ],
  },
};

/**
 * SEO content for a tool. Falls back to the catalogue's own copy so a newly
 * added tool still renders a complete page before its entry is written.
 */
export function toolSeo(tool: Tool): ToolSeo {
  const entry = entries[tool.id];
  if (entry) return entry;
  return {
    title: tool.name,
    description: tool.description,
    keywords: [tool.name.toLowerCase(), tool.category.toLowerCase()],
    answer: tool.description,
    faqs: [],
  };
}

/** Ids that have hand-written SEO content — used by the coverage test. */
export const coveredToolIds = Object.keys(entries);
