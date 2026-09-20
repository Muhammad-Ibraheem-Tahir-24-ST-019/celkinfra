"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Layers3,
  ChevronDown,
  ArrowRight,
  Sun,
  Moon,
  Menu,
  X,
  Search,
} from "lucide-react";
import { categories, tools, Category } from "@/lib/catalog";
import { toolIcons } from "@/lib/tool-icons";

export function Header() {
  const [active, setActive] = useState<Category | null>(null),
    [mobile, setMobile] = useState(false),
    [dark, setDark] = useState(true),
    [query, setQuery] = useState("");
  const root = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const params = useSearchParams();
  const selectedTool = tools.find((t) => pathname === "/tools/" + t.id);
  const selectedCategory = selectedTool?.category || params.get("category");
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelHover = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };
  const openSoon = (category: Category) => {
    cancelHover();
    hoverTimer.current = setTimeout(() => {
      setQuery("");
      setActive(category);
    }, 120);
  };
  const closeSoon = () => {
    cancelHover();
    hoverTimer.current = setTimeout(() => setActive(null), 240);
  };
  useEffect(() => () => cancelHover(), []);
  useEffect(() => {
    const value = localStorage.getItem("netkit-theme");
    const d = value !== null ? value === "dark" : true;
    setDark(d);
    document.documentElement.dataset.theme = d ? "dark" : "light";
  }, []);
  useEffect(() => {
    setActive(null);
    setMobile(false);
  }, [pathname]);
  useEffect(() => {
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) {
        setActive(null);
        setMobile(false);
      }
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  const close = () => {
    cancelHover();
    setActive(null);
    setMobile(false);
    setQuery("");
  };
  const list = (category: Category) =>
    tools.filter(
      (t) =>
        t.category === category &&
        (t.name + " " + t.description)
          .toLowerCase()
          .includes(query.toLowerCase()),
    );
  return (
    <header
      ref={root}
      className="site-navigation"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          close();
          root.current
            ?.querySelector<HTMLButtonElement>('[aria-expanded="true"]')
            ?.focus();
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setActive(null);
      }}
    >
      <div className="topbar">
        <Link href="/" className="brand" onClick={close}>
          <span className="brandmark">
            <Layers3 size={23} />
          </span>
          <span>
            Bmaikr <span className="brand-word">Tools</span>
          </span>
        </Link>
        <nav
          className="desktop-mega-nav"
          aria-label="Tool categories"
          onMouseLeave={closeSoon}
          onMouseEnter={cancelHover}
        >
          {categories.map((c) => (
            <div
              className="nav-category"
              key={c}
              onMouseEnter={() => openSoon(c)}
            >
              <button
                aria-expanded={active === c}
                aria-controls={"mega-" + c.replaceAll(" ", "-")}
                data-selected={selectedCategory === c || undefined}
                onClick={() => {
                  cancelHover();
                  setActive(active === c ? null : c);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    cancelHover();
                    setActive(c);
                    requestAnimationFrame(() =>
                      root.current
                        ?.querySelector<HTMLAnchorElement>(".mega-panel a")
                        ?.focus(),
                    );
                  }
                }}
              >
                {c.replace("Webmasters", "Webmaster")}
                <ChevronDown size={13} />
              </button>
              {active === c && (
                <div
                  className="mega-panel"
                  onMouseEnter={cancelHover}
                  id={"mega-" + c.replaceAll(" ", "-")}
                >
                  <div className="mega-intro">
                    <span className="eyebrow">EXPLORE THE TOOLBOX</span>
                    <h2>{c}</h2>
                    <p>
                      Find the right tool.
                      <br />
                      Get a clearer answer.
                    </p>
                    <Link
                      href={"/?category=" + encodeURIComponent(c)}
                      onClick={close}
                    >
                      Browse category <ArrowRight size={15} />
                    </Link>
                    <span className="mega-count">
                      {list(c).length} focused tools
                    </span>
                  </div>
                  <div className="mega-tools">
                    {list(c).map((t) => {
                      const Icon = toolIcons[t.id];
                      return (
                        <Link
                          prefetch={false}
                          href={"/tools/" + t.id}
                          key={t.id}
                          aria-current={
                            selectedTool?.id === t.id ? "page" : undefined
                          }
                          onClick={close}
                        >
                          <span className="menu-icon-tile">
                            <Icon size={19} />
                          </span>
                          <span>
                            <strong>{t.name}</strong>
                            <small>{t.description}</small>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/about" className="about-nav">
            About
          </Link>
          <button
            className="icon-button"
            aria-label={dark ? "Use light theme" : "Use dark theme"}
            onClick={() => {
              setDark(!dark);
              document.documentElement.dataset.theme = !dark ? "dark" : "light";
              localStorage.setItem("netkit-theme", !dark ? "dark" : "light");
            }}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="icon-button mobile-mega-toggle"
            aria-label={mobile ? "Close tool menu" : "Open tool menu"}
            aria-expanded={mobile}
            aria-controls="mobile-tool-menu"
            onClick={() => setMobile(!mobile)}
          >
            {mobile ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {mobile && (
        <nav
          className="mobile-mega"
          id="mobile-tool-menu"
          aria-label="All tools"
        >
          <div className="mobile-menu-heading">
            <strong>Your complete toolbox</strong>
            <span>60 tools · 5 categories</span>
          </div>
          <label className="menu-search">
            <Search size={17} />
            <input
              aria-label="Search navigation tools"
              placeholder="Find any tool…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          {categories.map((c) => (
            <div className="mobile-category" key={c}>
              <button
                aria-expanded={active === c || !!query}
                onClick={() => setActive(active === c ? null : c)}
              >
                {c}
                <span>
                  {tools.filter((t) => t.category === c).length}
                  <ChevronDown size={16} />
                </span>
              </button>
              {(active === c || !!query) && (
                <div className="mobile-tool-links">
                  {list(c).map((t) => {
                    const Icon = toolIcons[t.id];
                    return (
                      <Link
                        prefetch={false}
                        key={t.id}
                        aria-current={
                          selectedTool?.id === t.id ? "page" : undefined
                        }
                        href={"/tools/" + t.id}
                        onClick={close}
                      >
                        <span className="menu-icon-tile">
                          <Icon size={18} />
                        </span>
                        <span>
                          <strong>{t.name}</strong>
                          <small>{t.description}</small>
                        </span>
                        <ArrowRight size={13} />
                      </Link>
                    );
                  })}
                  {!list(c).length && (
                    <p>No matching tools in this category.</p>
                  )}
                </div>
              )}
            </div>
          ))}
          <Link href="/about" className="mobile-about" onClick={close}>
            About Bmaikr Tools <ArrowRight size={15} />
          </Link>
        </nav>
      )}
    </header>
  );
}
