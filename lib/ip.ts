export function parseIP(raw: string) {
  const s = raw.trim();
  if (!s.includes(":")) {
    if (!/^(0|[1-9]\d{0,2})(\.(0|[1-9]\d{0,2})){3}$/.test(s))
      throw Error("Enter a valid IPv4 or IPv6 address.");
    const a = s.split(".").map(Number);
    if (a.some((n) => n > 255))
      throw Error("IPv4 octets must be between 0 and 255.");
    return { bits: 32, n: a.reduce((n, v) => (n << 8n) + BigInt(v), 0n) };
  }
  if (!/^[\da-f:.]+$/i.test(s) || s.includes(":::") || s.split("::").length > 2)
    throw Error("Enter a valid IPv6 address.");
  let x = s;
  if (x.includes(".")) {
    const p = x.lastIndexOf(":");
    const v = parseIP(x.slice(p + 1));
    x =
      x.slice(0, p + 1) +
      (v.n >> 16n).toString(16) +
      ":" +
      (v.n & 65535n).toString(16);
  }
  const halves = x.split("::");
  const l = halves[0] ? halves[0].split(":") : [];
  const r = halves.length > 1 && halves[1] ? halves[1].split(":") : [];
  if (
    [...l, ...r].some((v) => !/^[\da-f]{1,4}$/i.test(v)) ||
    (halves.length === 1 ? l.length !== 8 : l.length + r.length >= 8)
  )
    throw Error("Enter a valid IPv6 address.");
  const all =
    halves.length === 1
      ? l
      : [...l, ...Array(8 - l.length - r.length).fill("0"), ...r];
  return {
    bits: 128,
    n: all.reduce((n, v) => (n << 16n) + BigInt("0x" + v), 0n),
  };
}
export function formatIP(n: bigint, bits = 128, expand = false) {
  if (bits === 32)
    return [24, 16, 8, 0].map((k) => Number((n >> BigInt(k)) & 255n)).join(".");
  const a = Array.from({ length: 8 }, (_, i) =>
    ((n >> BigInt((7 - i) * 16)) & 65535n).toString(16),
  );
  if (expand) return a.map((s) => s.padStart(4, "0")).join(":");
  let start = -1,
    len = 0;
  for (let i = 0; i < 8; i++) {
    if (a[i] !== "0") continue;
    let j = i;
    while (j < 8 && a[j] === "0") j++;
    if (j - i > len) {
      start = i;
      len = j - i;
    }
    i = j - 1;
  }
  if (len < 2) return a.join(":");
  return a.slice(0, start).join(":") + "::" + a.slice(start + len).join(":");
}
export function network(raw: string) {
  const [s, p, ...extra] = raw.trim().split("/");
  const ip = parseIP(s);
  if (
    extra.length ||
    p === undefined ||
    !/^\d+$/.test(p) ||
    Number(p) > ip.bits
  )
    throw Error(
      "Enter an address with a valid CIDR prefix, such as 192.168.1.0/24.",
    );
  const prefix = Number(p),
    host = BigInt(ip.bits - prefix),
    size = 1n << host,
    first = (ip.n >> host) << host;
  return { ...ip, prefix, size, first, last: first + size - 1n };
}
export function publicIP(s: string) {
  try {
    const { n, bits } = parseIP(s);
    if (bits === 32) {
      const a = Number(n >> 24n),
        b = Number((n >> 16n) & 255n);
      return !(
        a === 0 ||
        a === 10 ||
        a === 127 ||
        a >= 224 ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        (a === 100 && b >= 64 && b <= 127) ||
        (a === 198 && (b === 18 || b === 19)) ||
        (a === 192 && b === 0) ||
        (a === 198 && b === 51) ||
        (a === 203 && b === 0)
      );
    }
    return (
      n >> 125n === 1n &&
      !(n >> 96n === 0x20010db8n) &&
      !(n >> 112n === 0x2002n)
    );
  } catch {
    return false;
  }
}
export function reverseName(raw: string) {
  const p = parseIP(raw);
  return p.bits === 32
    ? formatIP(p.n, 32).split(".").reverse().join(".") + ".in-addr.arpa"
    : p.n.toString(16).padStart(32, "0").split("").reverse().join(".") +
        ".ip6.arpa";
}
