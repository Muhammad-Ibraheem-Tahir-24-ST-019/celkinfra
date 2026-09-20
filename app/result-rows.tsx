"use client";
import { useState } from "react";
import { Search, Copy, Check } from "lucide-react";
const display = (value: unknown) =>
  value == null
    ? "—"
    : typeof value === "object"
      ? JSON.stringify(value)
      : String(value);
export default function ResultRows({
  rows,
}: {
  rows: Record<string, unknown>[];
}) {
  const [query, setQuery] = useState(""),
    [type, setType] = useState("All"),
    [copied, setCopied] = useState<number | null>(null),
    [copyError, setCopyError] = useState("");
  const types = Array.from(
    new Set(
      rows.map((r) => r.Type).filter((v): v is string => typeof v === "string"),
    ),
  );
  const columns = Array.from(new Set(rows.flatMap(Object.keys)));
  const filtered = rows.filter(
    (r) =>
      (type === "All" || r.Type === type) &&
      Object.values(r).some((v) =>
        display(v).toLowerCase().includes(query.toLowerCase()),
      ),
  );
  return (
    <div className="result-records">
      <div className="record-toolbar">
        <label>
          <Search size={15} />
          <input
            aria-label="Search result rows"
            placeholder="Filter these results…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <span role="status">
          {filtered.length} of {rows.length} rows
        </span>
      </div>
      {types.length > 1 && (
        <div
          className="record-types"
          aria-label="Filter record types"
          role="group"
        >
          {["All", ...types].map((t) => (
            <button
              key={t}
              aria-pressed={type === t}
              onClick={() => setType(t)}
            >
              {t}
              <span>
                {t === "All"
                  ? rows.length
                  : rows.filter((r) => r.Type === t).length}
              </span>
            </button>
          ))}
        </div>
      )}
      {copyError && <p role="alert">{copyError}</p>}
      <div className="result-table">
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
              <th scope="col">Copy</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td key={c} data-label={c}>
                    {c === "Type" ? (
                      <span className="record-type">{display(r[c])}</span>
                    ) : (
                      display(r[c])
                    )}
                  </td>
                ))}
                <td data-label="Copy">
                  <button
                    className="icon-button"
                    aria-label={"Copy result row " + (i + 1)}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          JSON.stringify(r, null, 2),
                        );
                        setCopied(i);
                        setCopyError("");
                        setTimeout(() => setCopied(null), 1600);
                      } catch {
                        setCopyError(
                          "Clipboard unavailable. Select the row text to copy it.",
                        );
                      }
                    }}
                  >
                    {copied === i ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <p className="record-empty">No rows match these filters.</p>
        )}
      </div>
    </div>
  );
}
