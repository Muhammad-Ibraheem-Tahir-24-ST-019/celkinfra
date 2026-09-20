"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Copy,
  Download,
  Check,
  Clock3,
  ShieldCheck,
  Info,
  LoaderCircle,
  RotateCcw,
  ExternalLink,
  Search,
  TriangleAlert,
  FileCode2,
  Table2,
  ChevronRight,
} from "lucide-react";
import ResultRows from "./result-rows";
import { toolIcons } from "@/lib/tool-icons";
import { toolGuide } from "@/lib/tool-guide";
import type { ToolSeo } from "@/lib/tool-seo";
import { Tool, tools } from "@/lib/catalog";
import { fields } from "@/lib/fields";
import { Result, Values } from "@/lib/types";

import { Header, Footer, categoryIcons } from "./workspace";
import { AdSlot } from "./ads";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
const str = (v: unknown) =>
  v == null ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v);
export default function ToolWorkspace({
  tool,
  seo,
}: {
  tool: Tool;
  seo: ToolSeo;
}) {
  const config = fields(tool);
  const guide = toolGuide(tool);
  const initial = Object.fromEntries(config.map((f) => [f.key, f.value || ""]));
  const [values, setValues] = useState<Values>(initial),
    [result, setResult] = useState<Result | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [copied, setCopied] = useState(false);
  const control = useRef<AbortController | null>(null);
  const Icon = toolIcons[tool.id] || categoryIcons[tool.category];
  const isLocal =
    tool.mode === "local" ||
    (tool.id === "open-graph" && values.action === "Generate tags");
  const sensitive = ["email-header", "md5-base64", "json"].includes(tool.id);
  const execute = useCallback(
    async (custom?: Values) => {
      const data = custom || values;
      control.current?.abort();
      const ac = new AbortController();
      control.current = ac;
      setBusy(true);
      setError("");
      setResult(null);
      try {
        let r: Result;
        if (
          tool.mode === "local" ||
          (tool.id === "open-graph" && data.action === "Generate tags")
        )
          r = await (await import("@/lib/local")).runLocal(tool.id, data);
        else {
          const response = await fetch("/api/tools", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tool: tool.id, values: data }),
            signal: ac.signal,
          });
          const text = await response.text();
          let body: (Result & { error?: string }) | null = null;
          try {
            body = text ? (JSON.parse(text) as Result & { error?: string }) : null;
          } catch {
            body = null;
          }
          if (!response.ok || !body)
            throw Error(body?.error || "The check could not be completed.");
          r = body;
          if (r.pending && r.measurementId) {
            setResult(r);
            let attempts = 0;
            while (r.pending && attempts++ < 30) {
              await new Promise<void>((resolve, reject) => {
                const t = setTimeout(resolve, 2000);
                ac.signal.addEventListener(
                  "abort",
                  () => {
                    clearTimeout(t);
                    reject(new DOMException("Cancelled", "AbortError"));
                  },
                  { once: true },
                );
              });
              const p = new URLSearchParams({
                id: r.measurementId!,
                tool: tool.id,
                expected: data.expected || "",
              });
              const rr = await fetch("/api/tools?" + p, { signal: ac.signal });
              const rrText = await rr.text();
              let next: (Result & { error?: string }) | null = null;
              try {
                next = rrText ? (JSON.parse(rrText) as Result & { error?: string }) : null;
              } catch {
                next = null;
              }
              if (!rr.ok || !next)
                throw Error(
                  next?.error || "Could not retrieve the measurement.",
                );
              r = next;
              setResult(r);
            }
            if (r.pending) {
              r = {
                ...r,
                pending: false,
                status: "warning",
                summary: "Measurement exceeded the waiting time",
                notes: [
                  ...(r.notes || []),
                  "Some probes did not finish in time. The completed results are retained.",
                ],
              };
            }
          }
        }
        if (!ac.signal.aborted) setResult(r);
        return r;
      } catch (e) {
        if (!ac.signal.aborted)
          setError(
            e instanceof Error
              ? e.message
              : "Something went wrong. Please try again.",
          );
        return null;
      } finally {
        if (control.current === ac) setBusy(false);
      }
    },
    [tool.id, tool.mode, values],
  );
  useEffect(() => () => control.current?.abort(), []);
  useEffect(() => {
    const ctx = (
      document as unknown as { modelContext?: { registerTool: Function } }
    ).modelContext;
    if (!ctx?.registerTool) return;
    const ac = new AbortController();
    try {
      Promise.resolve(
        ctx.registerTool(
          {
            name: "run_netkit_tool",
            title: "Run " + tool.name,
            description: `Run ${tool.name} and update the visible result. ${isLocal ? "Processes input locally." : "Sends the target to network data providers for a diagnostic check."}`,
            inputSchema: {
              type: "object",
              properties: {
                values: {
                  type: "object",
                  additionalProperties: { type: "string" },
                },
              },
              required: ["values"],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false, untrustedContentHint: true },
            execute: async (input: unknown) => {
              const v = (input as { values: Values })?.values;
              if (
                !v ||
                typeof v !== "object" ||
                Object.values(v).some((x) => typeof x !== "string")
              )
                throw Error("Provide string form values.");
              const merged = { ...initial, ...v };
              setValues(merged);
              const r = await execute(merged);
              if (!r) throw Error("The tool could not complete.");
              return r;
            },
          },
          { signal: ac.signal },
        ),
      ).catch(() => {});
    } catch {}
    return () => ac.abort();
  }, [execute, tool.name, isLocal]);
  const columns = Array.from(
    new Set((result?.rows || []).flatMap(Object.keys)),
  );
  const serialized = result
    ? result.code || JSON.stringify(result, null, 2)
    : "";
  async function copy() {
    try {
      await navigator.clipboard.writeText(serialized);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError(
        "Clipboard access was unavailable. Select and copy the result instead.",
      );
    }
  }
  function download() {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = `bmaikr-tools-${tool.id}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  }
  return (
    <div id="top">
      <Header />
      <div className="tool-outer">
        <div className="left-ad-rail">
          <AdSlot
            position="left"
            category={tool.category}
            sensitive={sensitive}
          />
        </div>
        <main className="tool-main">
          {/* Visible breadcrumb — mirrors the BreadcrumbList structured data
              emitted by the page, which Google requires to match the page. */}
          <nav className="tool-breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">
                  <ArrowLeft size={14} />
                  <span>Tools</span>
                </Link>
              </li>
              <li aria-hidden="true" className="crumb-sep">
                <ChevronRight size={14} />
              </li>
              <li>
                <Link href={"/?category=" + encodeURIComponent(tool.category)}>
                  {tool.category}
                </Link>
              </li>
              <li aria-hidden="true" className="crumb-sep">
                <ChevronRight size={14} />
              </li>
              <li>
                <span aria-current="page">{tool.name}</span>
              </li>
            </ol>
          </nav>
          <div className="tool-heading">
            <span className="large-tool-icon">
              <Icon size={27} />
            </span>
            <div>
              <h1>{tool.name}</h1>
              <p>{tool.description}</p>
            </div>
            <span className="mode-badge">
              {isLocal ? <ShieldCheck size={14} /> : <GlobeIcon />}
              {isLocal ? "Runs locally" : "Live lookup"}
            </span>
          </div>
          {/* Answer-first: the definition comes before the widget and before
              any ad, so a reader (or an answer engine) gets the point of the
              page without having to run a check. */}
          <section className="tool-answer" aria-label={`What ${tool.name} is`}>
            <p>{seo.answer}</p>
          </section>
          <AdSlot
            position="top"
            category={tool.category}
            sensitive={sensitive}
          />
          <div className="tool-columns">
            <div className="tool-primary">
              <section className="input-panel">
                <div className="panel-title">
                  <h2>{isLocal ? "Your input" : "Start a check"}</h2>
                  <span>
                    {isLocal
                      ? "Private, browser-based processing"
                      : "Public internet targets only"}
                  </span>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    execute();
                  }}
                >
                  <div className="field-grid">
                    {config.map((f) => (
                      <label
                        className={
                          "field " + (f.type === "textarea" ? "field-wide" : "")
                        }
                        key={f.key}
                      >
                        <span>{f.label}</span>
                        {f.type === "select" ? (
                          <Select
                            value={values[f.key]}
                            onValueChange={(x) =>
                              setValues({ ...values, [f.key]: x })
                            }
                          >
                            <SelectTrigger
                              aria-label={f.label}
                              className="field-select"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {f.options?.map((o) => (
                                <SelectItem key={o} value={o}>
                                  {o}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : f.type === "textarea" ? (
                          <textarea
                            aria-label={f.label}
                            value={values[f.key] || ""}
                            onChange={(e) =>
                              setValues({ ...values, [f.key]: e.target.value })
                            }
                            placeholder={f.placeholder}
                            spellCheck={false}
                            rows={
                              tool.id === "json" || tool.id === "email-header"
                                ? 8
                                : 4
                            }
                          />
                        ) : (
                          <input
                            aria-label={f.label}
                            type={f.type === "number" ? "number" : "text"}
                            value={values[f.key] || ""}
                            onChange={(e) =>
                              setValues({ ...values, [f.key]: e.target.value })
                            }
                            placeholder={f.placeholder}
                            autoComplete="off"
                            spellCheck={false}
                          />
                        )}{" "}
                        {f.help && <small>{f.help}</small>}
                      </label>
                    ))}
                  </div>
                  {config.length === 0 && (
                    <p className="auto-note">
                      {tool.id === "ipv6-generate"
                        ? "Generate a fresh random local prefix."
                        : tool.id === "user-agent"
                          ? "Read the information your browser makes available."
                          : "Check the public connection seen by this website."}
                    </p>
                  )}
                  <div className="form-actions">
                    <button
                      className="primary-button"
                      disabled={busy}
                      type="submit"
                    >
                      {busy ? (
                        <LoaderCircle size={16} className="spin" />
                      ) : (
                        <Play size={15} />
                      )}{" "}
                      {busy ? "Checking…" : isLocal ? "Run tool" : "Run check"}
                    </button>
                    {busy ? (
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => {
                          control.current?.abort();
                          setBusy(false);
                          setResult((r) =>
                            r
                              ? {
                                  ...r,
                                  pending: false,
                                  status: "warning",
                                  summary: "Stopped — partial results",
                                }
                              : null,
                          );
                        }}
                      >
                        Stop
                      </button>
                    ) : (
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => {
                          setValues(initial);
                          setResult(null);
                          setError("");
                        }}
                      >
                        <RotateCcw size={14} />
                        Reset
                      </button>
                    )}
                    <span>
                      <ShieldCheck size={14} />
                      {isLocal
                        ? "Input stays on your device"
                        : "No account needed for tools"}
                    </span>
                  </div>
                </form>
              </section>
              {error && (
                <div className="error-box" role="alert">
                  <TriangleAlert size={18} />
                  <div>
                    <strong>Unable to complete this check</strong>
                    <p>{error}</p>
                  </div>
                </div>
              )}
              <section
                className="results-panel"
                aria-live="polite"
                aria-busy={busy}
              >
                <div className="panel-title">
                  <h2>Results</h2>
                  {result && (
                    <div className="result-actions">
                      <button
                        className="icon-button"
                        aria-label="Copy results"
                        onClick={copy}
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                      <button
                        className="icon-button"
                        aria-label="Download JSON results"
                        onClick={download}
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  )}
                </div>
                {!result ? (
                  <div className="result-empty">
                    {busy ? (
                      <LoaderCircle size={29} className="spin" />
                    ) : (
                      <Search size={29} />
                    )}
                    <h3>
                      {busy ? "Checking your target" : "Ready when you are"}
                    </h3>
                    <p>
                      {busy
                        ? "Collecting results from the selected service."
                        : "Enter your details above and run the tool."}
                    </p>
                  </div>
                ) : (
                  <div className="result-body">
                    <div className="result-context">
                      <div>
                        <span>DATA SOURCE</span>
                        <strong>{result.source || "Not provided"}</strong>
                      </div>
                      <div>
                        <span>CHECKED AT</span>
                        <strong>
                          {result.checkedAt
                            ? new Date(result.checkedAt).toLocaleString()
                            : "Not provided"}
                        </strong>
                      </div>
                      <div>
                        <span>CHECK STATUS</span>
                        <strong>
                          {result.pending
                            ? "In progress"
                            : result.status === "success"
                              ? "Completed"
                              : result.status === "unavailable"
                                ? "Unavailable"
                                : "Review notes"}
                        </strong>
                      </div>
                    </div>
                    <div className={"result-summary status-" + result.status}>
                      {result.pending ? (
                        <LoaderCircle size={18} className="spin" />
                      ) : result.status === "success" ? (
                        <Check size={18} />
                      ) : (
                        <Info size={18} />
                      )}
                      <strong>{result.summary}</strong>
                    </div>
                    {result.metrics && (
                      <div className="metrics">
                        {result.metrics.map((m) => (
                          <div key={m.label}>
                            <strong>{m.value}</strong>
                            <span>{m.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {result.preview && (
                      <div className="serp-preview">
                        <span>{result.preview.url}</span>
                        <h3>{result.preview.title}</h3>
                        <p>{result.preview.description}</p>
                      </div>
                    )}
                    {result.links && (
                      <div className="url-links">
                        <button
                          className="secondary-button"
                          onClick={() =>
                            result.links?.forEach((url) =>
                              window.open(url, "_blank", "noopener,noreferrer"),
                            )
                          }
                        >
                          Open all ({result.links.length}){" "}
                          <ExternalLink size={14} />
                        </button>
                        {result.links.map((url) => (
                          <a
                            href={url}
                            key={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {url}
                            <ExternalLink size={13} />
                          </a>
                        ))}
                      </div>
                    )}
                    <Tabs defaultValue="formatted">
                      <TabsList variant="line">
                        <TabsTrigger value="formatted">
                          <Table2 size={15} />
                          Overview
                        </TabsTrigger>
                        <TabsTrigger value="raw">
                          <FileCode2 size={15} />
                          Raw data
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="formatted">
                        {!!result.rows?.length && (
                          <ResultRows
                            key={result.checkedAt || result.summary}
                            rows={result.rows}
                          />
                        )}
                        {result.code && (
                          <pre className="code-output" tabIndex={0}>
                            {result.code}
                          </pre>
                        )}
                      </TabsContent>
                      <TabsContent value="raw">
                        <pre className="code-output" tabIndex={0}>
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      </TabsContent>
                    </Tabs>
                    {!!result.notes?.length && (
                      <h3 className="result-notes-title">
                        Notes and limitations
                      </h3>
                    )}
                    {result.notes?.map((n, i) => (
                      <div className="result-note" key={i}>
                        <Info size={15} />
                        <span>{n}</span>
                      </div>
                    ))}
                    <div className="result-source">
                      <Clock3 size={13} />
                      {result.source} ·{" "}
                      {result.checkedAt
                        ? new Date(result.checkedAt).toLocaleTimeString()
                        : ""}
                    </div>
                  </div>
                )}
              </section>
              <AdSlot
                position="below-tool"
                category={tool.category}
                sensitive={sensitive}
              />
              <section className="help-panel">
                <h2>How {tool.name} works</h2>
                <div className="explanation-cards">
                  <div>
                    <span className="explanation-icon">
                      <Icon size={20} />
                    </span>
                    <h3>What it does</h3>
                    <p>{tool.description}</p>
                  </div>
                  <div>
                    <span className="explanation-icon">
                      <Table2 size={20} />
                    </span>
                    <h3>What you get</h3>
                    <p>{guide.output}</p>
                  </div>
                  <div>
                    <span className="explanation-icon">
                      {isLocal ? (
                        <ShieldCheck size={20} />
                      ) : (
                        <Clock3 size={20} />
                      )}
                    </span>
                    <h3>{isLocal ? "On your device" : "Live data sources"}</h3>
                    <p>
                      {isLocal
                        ? "Your input is processed in this browser. Copy or download the result when you are ready."
                        : "The target is sent to a network provider. Results include their source; timeouts and unavailable data are clearly marked."}
                    </p>
                  </div>
                </div>
                <details>
                  <summary>What if a check cannot finish?</summary>
                  <p>
                    Confirm your input and try again. A timeout, blocked
                    request, or unavailable provider is not proof that a domain
                    is broken. Internet measurements and third-party services
                    have limits.
                  </p>
                </details>
              </section>
              {seo.faqs.length > 0 && (
                /* Rendered open, not inside <details>: answer engines and
                   snippet extraction both do better with visible text. */
                <section className="faq-panel" id="faq">
                  <h2>
                    <Info size={17} />
                    {tool.name} — frequently asked questions
                  </h2>
                  <div className="faq-list">
                    {seo.faqs.map((faq) => (
                      <div className="faq-item" key={faq.q}>
                        <h3>{faq.q}</h3>
                        <p>{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
            <aside className="tool-sidebar">
              <div className="related-tools">
                <h2>Keep exploring</h2>
                {tools
                  .filter(
                    (t) => t.category === tool.category && t.id !== tool.id,
                  )
                  .slice(0, 5)
                  .map((t) => (
                    <Link href={"/tools/" + t.id} key={t.id}>
                      <span>{t.name}</span>
                      <ArrowRight size={14} />
                    </Link>
                  ))}
                <Link href="/" className="browse-all">
                  Browse all 60 tools <ArrowUp />
                </Link>
              </div>
              <AdSlot
                position="right"
                category={tool.category}
                sensitive={sensitive}
              />
              <div className="sidebar-tip">
                <ShieldCheck size={20} />
                <h3>Know what you’re checking</h3>
                <p>
                  Every result includes its source. When a check is
                  inconclusive, we say so.
                </p>
              </div>
            </aside>
          </div>
          <AdSlot
            position="above-footer"
            category={tool.category}
            sensitive={sensitive}
          />
        </main>
      </div>
      <Footer />
    </div>
  );
}
function GlobeIcon() {
  return <ActivityIcon />;
}
function ActivityIcon() {
  return <Clock3 size={14} />;
}
function ArrowUp() {
  return <ExternalLink size={13} />;
}
