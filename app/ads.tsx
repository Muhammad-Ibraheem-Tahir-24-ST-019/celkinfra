"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { AdConfig, defaultAds } from "@/lib/ads-config";
import { ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";
const AdContext = createContext<AdConfig>(defaultAds);
export function AdProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState(defaultAds);
  useEffect(() => {
    fetch("/api/ads")
      .then((r) => r.json() as Promise<{ config: AdConfig }>)
      .then((r) => {
        if (r.config) setConfig(r.config);
      })
      .catch(() => {});
    const update = (e: Event) => setConfig((e as CustomEvent).detail);
    window.addEventListener("netkit-ads-updated", update);
    return () => window.removeEventListener("netkit-ads-updated", update);
  }, []);
  useEffect(() => {
    if (
      !config.enabled ||
      !config.publisher ||
      (!config.autoAds && !config.placements.some((p) => p.mode === "adsense"))
    )
      return;
    const sensitive = /\/(admin|tools\/(email-header|md5-base64|json))/.test(
      location.pathname,
    );
    if (sensitive) return;
    if (document.querySelector("script[data-netkit-ads]")) return;
    const s = document.createElement("script");
    s.dataset.netkitAds = "1";
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" +
      config.publisher;
    document.head.appendChild(s);
  }, [config]);
  return <AdContext.Provider value={config}>{children}</AdContext.Provider>;
}
export function AdSlot({
  position,
  category = "",
  sensitive = false,
}: {
  position: AdConfig["placements"][number]["id"];
  category?: string;
  sensitive?: boolean;
}) {
  const c = useContext(AdContext);
  const pathname = usePathname();
  const [mobile, setMobile] = useState<boolean | null>(null);
  useEffect(() => {
    const media = matchMedia("(max-width: 760px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const p = c.placements.find((p) => p.id === position);
  const visible =
    !!p &&
    c.enabled &&
    p.mode !== "off" &&
    p.mode !== "reserved" &&
    !pathname.startsWith("/admin") &&
    !(p.excludedPaths || []).includes(pathname) &&
    (!p.categories.length || p.categories.includes(category)) &&
    !(sensitive && p.mode === "adsense") &&
    (p.device === "all" ||
      (mobile !== null && (p.device === "mobile") === mobile));
  useEffect(() => {
    if (!visible || p?.mode !== "adsense") return;
    // Use IntersectionObserver to lazy-push ads only when slot enters viewport
    const el = document.querySelector(`.ad-${position}`);
    if (!el) return;
    // Check if already initialised
    if (el.querySelector(".adsbygoogle[data-adsbygoogle-status]")) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          try {
            const w = window as unknown as { adsbygoogle: unknown[] };
            (w.adsbygoogle = w.adsbygoogle || []).push({});
          } catch {}
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }, // pre-load 200px before entering view
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [c, p, visible, position]);
  if (
    !visible ||
    !c.enabled ||
    !p ||
    p.mode === "off" ||
    p.mode === "reserved" ||
    (p.categories.length && !p.categories.includes(category)) ||
    (sensitive && p.mode === "adsense")
  )
    return null;
  return (
    <aside
      className={"ad-slot ad-" + position + " ad-device-" + p.device}
      aria-label="Advertisement"
    >
      <span className="ad-label">ADVERTISEMENT</span>
      {p.mode === "sponsor" ? (
        <a
          href={p.url}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="sponsor"
        >
          {p.imageUrl && (
            <img
              src={p.imageUrl}
              alt={p.title || "Sponsored banner"}
              className="ad-banner-image"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <strong>{p.title || "Sponsored"}</strong>
          <p>{p.description}</p>
          <span>
            Learn more <ExternalLink size={13} />
          </span>
        </a>
      ) : (
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%" }}
          data-ad-client={c.publisher}
          data-ad-slot={p.slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </aside>
  );
}
