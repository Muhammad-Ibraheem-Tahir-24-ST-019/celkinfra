"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Sun,
  Moon,
  Globe2,
  Network,
  Code2,
  PanelsTopLeft,
  ArrowUpRight,
  Layers3,
  ArrowRight,
  Bookmark,
  ShieldCheck,
  Menu,
  X,
  Activity,
} from "lucide-react";
import { toolIcons } from "@/lib/tool-icons";
import { AdSlot } from "./ads";
import { categories, tools, popular, Category } from "@/lib/catalog";
export const categoryIcons = {
  "DNS Tools": Globe2,
  "IP Tools": Network,
  "Dev Tools": Code2,
  "Webmasters Tools": PanelsTopLeft,
  "Network Tools": Activity,
};
export { Header } from "./navigation";
import { Header } from "./navigation";
export function Footer() {
  return (
    <footer>
      <Link href="/" className="brand">
        <Layers3 size={21} />
        Bmaikr Tools
      </Link>
      <span>Practical tools. Clear answers.</span>
      <div>
        <Link href="/about">About & privacy</Link>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
export default function Workspace() {
  const [category, setCategory] = useState<string>("All tools");
  const [search, setSearch] = useState("");
  const query = useSearchParams();
  const requestedCategory = query.get("category");
  useEffect(() => {
    setCategory(
      requestedCategory && categories.includes(requestedCategory as Category)
        ? requestedCategory
        : "All tools",
    );
  }, [requestedCategory]);
  const filtered = tools.filter(
    (t) =>
      (category === "All tools" || t.category === category) &&
      (t.name + " " + t.description + " " + t.category)
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div id="top">
      <Header />
      <div className="directory-sideads">
        <div className="rail-left">
          <AdSlot position="left" category={category} />
        </div>
        <div className="rail-right">
          <AdSlot position="right" category={category} />
        </div>
        <div className="page-wrap">
          <div className="intro">
            <div>
              <div className="eyebrow">
                <span className="mini-line" /> THE TOOLBOX
              </div>
              <h1>
                Everyday tools.
                <br />
                <span className="hero-gradient">Clearer answers.</span>
              </h1>
              <p>
                Check a domain. Debug a connection. Simplify your workflow.
                <br className="desktop-br" /> Sixty focused tools, all in one
                place.
              </p>
            </div>
            <div className="intro-mark" aria-hidden="true">
              <div className="orbit o1" />
              <div className="orbit o2" />
              <span className="orbit-icon i1 cat-dns-icon">
                <Globe2 />
              </span>
              <span className="orbit-icon i2 cat-dev-icon">
                <Code2 />
              </span>
              <span className="orbit-icon i3 cat-ip-icon">
                <Network />
              </span>
              <div className="core-mark">
                <Layers3 size={38} />
              </div>
              <div className="hero-float-badge float-badge-1">
                <span className="badge-dot dot-dns" /> DNS
              </div>
              <div className="hero-float-badge float-badge-2">
                <span className="badge-dot dot-dev" /> Debug
              </div>
              <div className="hero-float-badge float-badge-3">
                <span className="badge-dot dot-ip" /> Network
              </div>
              <div className="hero-float-badge float-badge-4">
                <span className="badge-dot dot-web" /> Analyse
              </div>
            </div>
          </div>
          <section className="tool-finder" aria-label="Find a tool">
            <div className="finder-heading">
              <strong>Find your next tool</strong>
              <span>60 tools. One workspace.</span>
            </div>
            <form
              className="finder-search"
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                document
                  .getElementById("tool-results")
                  ?.scrollIntoView({
                    block: "start",
                    behavior: matchMedia("(prefers-reduced-motion: reduce)")
                      .matches
                      ? "auto"
                      : "smooth",
                  });
              }}
            >
              <Search size={20} className="search-input-icon" />
              <input
                aria-label="Search tools"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tools, e.g. DNS lookup or JSON"
              />
              {search && (
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                >
                  <X size={18} />
                </button>
              )}
              <button type="submit" className="finder-submit primary-button">
                <Search size={16} />
                <span>Search</span>
              </button>
            </form>
            <span className="finder-live-count" role="status">
              {search ? `${filtered.length} matching tools` : ""}
            </span>
            <div
              className="finder-categories"
              role="group"
              aria-label="Tool categories"
            >
              {["All tools", ...categories].map((c) => {
                const Icon =
                  c === "All tools" ? Layers3 : categoryIcons[c as Category];
                const catIdx = c === "All tools" ? -1 : categories.indexOf(c as Category);
                return (
                  <button
                    className={`${category === c ? "selected" : ""} cat-badge-${catIdx}`}
                    aria-pressed={category === c}
                    key={c}
                    onClick={() => setCategory(c)}
                  >
                    <span className="finder-category-icon">
                      <Icon size={18} />
                    </span>
                    <span className="finder-category-name">
                      {c === "Webmasters Tools"
                        ? "Webmasters"
                        : c === "Network Tools"
                          ? "Network"
                          : c === "Dev Tools"
                            ? "Developer"
                            : c === "DNS Tools"
                              ? "DNS"
                              : c === "IP Tools"
                                ? "IP tools"
                                : c}
                    </span>
                    <span className="finder-count">
                      {c === "All tools"
                        ? 60
                        : tools.filter((t) => t.category === c).length}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
          <AdSlot position="top" category={category} />
          {!search && category === "All tools" && (
            <section className="featured">
              <div className="section-heading">
                <h2>
                  <Bookmark size={18} /> Everyday essentials
                </h2>
                <span>A good place to start</span>
              </div>
              <div className="featured-grid">
                {popular.map((id, i) => {
                  const t = tools.find((t) => t.id === id)!;
                  const Icon = toolIcons[t.id] || categoryIcons[t.category];
                  const catIdx = categories.indexOf(t.category);
                  return (
                    <Link
                      key={id}
                      href={"/tools/" + id}
                      className={"feature-card feature-" + i}
                    >
                      <span className={`feature-icon cat-${catIdx}`}>
                        <Icon size={22} />
                      </span>
                      <ArrowUpRight className="card-arrow" size={20} />
                      <h3>{t.name}</h3>
                      <p>{t.description}</p>
                      <span className="feature-link">
                        Open tool <ArrowRight size={15} />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
          <section className="directory" id="tool-results">
            <div className="section-heading">
              <h2>
                {search
                  ? "Search results"
                  : category === "All tools"
                    ? "Explore the toolkit"
                    : category}
                <span className="count">{filtered.length}</span>
              </h2>
              <span>
                {search
                  ? "Matching your search"
                  : "Built for the details that matter"}
              </span>
            </div>
            {filtered.length === 0 ? (
              <div className="empty">
                <Search size={28} />
                <h3>No matching tools</h3>
                <p>Try “DNS”, “JSON”, or choose another category.</p>
                <button
                  className="secondary-button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All tools");
                  }}
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="tool-grid">
                {filtered.map((t) => {
                  const Icon = toolIcons[t.id] || categoryIcons[t.category];
                  const catIdx = categories.indexOf(t.category);
                  return (
                    <Link
                      className={`tool-card cat-card-${catIdx}`}
                      prefetch={false}
                      key={t.id}
                      href={"/tools/" + t.id}
                    >
                      <div className="tool-card-top">
                        <span className={`tool-icon cat-${catIdx}`}>
                          <Icon size={20} />
                        </span>
                        <ArrowUpRight size={17} className="arrow" />
                      </div>
                      <h3>{t.name}</h3>
                      <p>{t.description}</p>
                      <div className="card-foot">
                        <span className={`category-label cat-label-${catIdx}`}>{t.category}</span>
                        <span className="execution-label">
                          {t.mode === "local" ? (
                            <ShieldCheck size={12} />
                          ) : (
                            <Globe2 size={12} />
                          )}{" "}
                          {t.mode === "local"
                            ? "In your browser"
                            : "Network check"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
          <div className="bottom-note">
            <ShieldCheck size={20} />
            <div>
              <strong>Useful tools, thoughtful by design.</strong>
              <p>
                Local calculations stay in your browser. Network checks show
                their source and limitations.
              </p>
            </div>
          </div>
          <AdSlot position="above-footer" category={category} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
