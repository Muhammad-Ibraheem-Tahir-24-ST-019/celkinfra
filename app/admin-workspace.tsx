"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Save,
  LayoutTemplate,
  ShieldCheck,
  ArrowLeft,
  LoaderCircle,
  Info,
} from "lucide-react";
import { Header, Footer } from "./workspace";
import { AdConfig, defaultAds } from "@/lib/ads-config";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { categories } from "@/lib/catalog";
const labels = {
  top: "Above the tool",
  left: "Left sidebar",
  right: "Right sidebar",
  "below-tool": "Below results",
  "above-footer": "Above the footer",
};
export default function Admin() {
  const [c, setC] = useState<AdConfig>(defaultAds),
    [admin, setAdmin] = useState(false),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/ads")
      .then(
        (r) =>
          r.json() as Promise<{
            config: AdConfig;
            admin: boolean;
            storageAvailable?: boolean;
          }>,
      )
      .then((d) => {
        setC(d.config);
        setAdmin(d.admin);
        if (d.storageAvailable === false)
          setError("Settings storage is temporarily unavailable.");
      })
      .catch(() => setError("Unable to load advertising settings."))
      .finally(() => setLoading(false));
  }, []);
  async function save() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const r = await fetch("/api/ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c),
      });
      const d = (await r.json()) as { config: AdConfig; error?: string };
      if (!r.ok) throw Error(d.error || "Unable to save settings.");
      setC(d.config);
      setMessage("Advertising settings saved.");
      window.dispatchEvent(
        new CustomEvent("netkit-ads-updated", { detail: d.config }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }
  function update(i: number, patch: Partial<AdConfig["placements"][number]>) {
    setC({
      ...c,
      placements: c.placements.map((p, j) =>
        i === j ? { ...p, ...patch } : p,
      ),
    });
  }
  return (
    <div id="top">
      <Header />
      <main className="admin-main">
        <Link className="backlink" href="/">
          <ArrowLeft size={15} />
          Back to tools
        </Link>
        <div className="tool-heading">
          <span className="large-tool-icon">
            <LayoutTemplate size={26} />
          </span>
          <div>
            <h1>Advertising</h1>
            <p>Control where ads appear, without crowding the tools.</p>
          </div>
        </div>
        {loading ? (
          <div className="empty">
            <LoaderCircle className="spin" />
            Loading settings…
          </div>
        ) : !admin ? (
          <section className="input-panel admin-gate">
            <ShieldCheck size={30} />
            <h2>Administrator sign-in required</h2>
            <p>
              Sign in with the approved administrator account to manage
              advertising.
            </p>
            <a
              className="primary-button"
              href="/signin-with-chatgpt?return_to=/admin"
              target="_top"
            >
              Sign in with ChatGPT
            </a>
            <p className="small-note">
              Already signed in? Your account must be on the administrator
              allowlist.
            </p>
          </section>
        ) : (
          <>
            <section className="input-panel">
              <div className="panel-title">
                <h2>Ad settings</h2>
                <span>Site-wide controls</span>
              </div>
              <label className="switch-row">
                <div>
                  <strong>Enable advertising placements</strong>
                  <p>Turn off to remove all reserved spaces and managed ads.</p>
                </div>
                <Switch
                  checked={c.enabled}
                  onCheckedChange={(enabled) => setC({ ...c, enabled })}
                />
              </label>
              <label className="field">
                <span>AdSense publisher ID</span>
                <input
                  value={c.publisher}
                  placeholder="ca-pub-0000000000000000"
                  onChange={(e) => setC({ ...c, publisher: e.target.value })}
                />
                <small>
                  Use your approved AdSense account. Ad delivery depends on
                  Google approval and inventory.
                </small>
              </label>
              <label className="switch-row">
                <div>
                  <strong>Google Auto ads</strong>
                  <p>
                    Allow Google to choose additional placements. Configure
                    consent and ad exclusions in your AdSense account before
                    enabling.
                  </p>
                </div>
                <Switch
                  checked={c.autoAds}
                  onCheckedChange={(autoAds) => setC({ ...c, autoAds })}
                />
              </label>
              <div className="result-note">
                <Info size={16} />
                <span>
                  Admin pages and sensitive text tools exclude third-party ad
                  scripts. Sidebars collapse on smaller screens.
                </span>
              </div>
            </section>
            <div className="section-heading">
              <h2>Placements</h2>
              <span>Reserved spaces never load an ad network</span>
            </div>
            <div className="ad-config-grid">
              {c.placements.map((p, i) => (
                <section className="input-panel ad-config" key={p.id}>
                  <h3>{labels[p.id]}</h3>
                  <div
                    className={"placement-diagram diagram-" + p.id}
                    aria-hidden="true"
                  >
                    <i />
                    <b />
                    <em />
                  </div>
                  <div className="field-grid">
                    <label className="field">
                      <span>Display mode</span>
                      <Select
                        value={p.mode}
                        onValueChange={(mode) =>
                          update(i, { mode: mode as typeof p.mode })
                        }
                      >
                        <SelectTrigger className="field-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["off", "reserved", "sponsor", "adsense"].map(
                            (m) => (
                              <SelectItem key={m} value={m}>
                                {m === "off"
                                  ? "Hidden"
                                  : m === "reserved"
                                    ? "Reserved space"
                                    : m === "sponsor"
                                      ? "Banner image / sponsored link"
                                      : "AdSense unit"}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </label>
                    <label className="field">
                      <span>Devices</span>
                      <Select
                        value={p.device}
                        onValueChange={(device) =>
                          update(i, { device: device as typeof p.device })
                        }
                      >
                        <SelectTrigger className="field-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["all", "desktop", "mobile"].map((m) => (
                            <SelectItem key={m} value={m}>
                              {m === "all"
                                ? "All devices"
                                : m === "desktop"
                                  ? "Desktop only"
                                  : "Mobile only"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>
                  </div>
                  {p.mode === "sponsor" && (
                    <>
                      {(
                        ["title", "description", "url", "imageUrl"] as const
                      ).map((k) => (
                        <label className="field" key={k}>
                          <span>
                            {k === "imageUrl"
                              ? "Banner image URL (HTTPS, optional)"
                              : k === "url"
                                ? "Destination URL"
                                : k === "title"
                                  ? "Headline"
                                  : "Description"}
                          </span>
                          <input
                            value={p[k] || ""}
                            onChange={(e) => update(i, { [k]: e.target.value })}
                          />
                        </label>
                      ))}
                      <p className="small-note">
                        Use a hosted banner image and a destination link, or
                        leave the image empty for a text ad. Images scale to fit
                        without cropping.
                      </p>
                      {p.imageUrl && (
                        <a
                          className="admin-banner-preview"
                          href={p.url || undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={p.imageUrl}
                            alt={p.title || "Banner preview"}
                            loading="lazy"
                          />
                          <span>Banner preview</span>
                        </a>
                      )}
                    </>
                  )}
                  {p.mode === "adsense" && (
                    <label className="field">
                      <span>Ad slot ID</span>
                      <input
                        value={p.slot}
                        onChange={(e) => update(i, { slot: e.target.value })}
                        placeholder="1234567890"
                      />
                    </label>
                  )}
                  <p className="small-note">
                    Categories · leave unchecked for all pages
                  </p>
                  <label className="field">
                    <span>Hide on specific pages</span>
                    <textarea
                      rows={3}
                      placeholder={"/about\n/tools/json"}
                      value={(p.excludedPaths || []).join("\n")}
                      onChange={(e) =>
                        update(i, {
                          excludedPaths: e.target.value
                            .split("\n")
                            .filter(Boolean),
                        })
                      }
                    />
                    <small>
                      One exact path per line. These exclusions control this
                      managed placement. Google Auto ads exclusions must also be
                      set in AdSense.
                    </small>
                  </label>
                  <div className="category-checks">
                    {categories.map((cat) => (
                      <label key={cat}>
                        <Checkbox
                          checked={p.categories.includes(cat)}
                          onCheckedChange={(checked) =>
                            update(i, {
                              categories: checked
                                ? [...p.categories, cat]
                                : p.categories.filter((c) => c !== cat),
                            })
                          }
                        />
                        {cat}
                      </label>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            <div className="save-bar">
              <span>Changes apply after saving.</span>
              <button
                className="primary-button"
                disabled={saving}
                onClick={save}
              >
                {saving ? (
                  <LoaderCircle className="spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                Save changes
              </button>
            </div>
          </>
        )}
        {message && (
          <div className="result-summary status-success" role="status">
            {message}
          </div>
        )}
        {error && (
          <div className="error-box" role="alert">
            {error}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
