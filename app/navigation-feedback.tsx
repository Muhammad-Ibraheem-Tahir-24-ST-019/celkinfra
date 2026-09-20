"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Layers3 } from "lucide-react";
import { tools } from "@/lib/catalog";

/* ─── Page Transition Overlay ─────────────────────────────────────────────── */

type TransitionState = "idle" | "entering" | "visible" | "exiting";

function NavigationFeedbackInner() {
  const pathname = usePathname();
  const params = useSearchParams();
  const route = pathname + "?" + params.toString();

  const previous = useRef(route);
  const started = useRef(0);
  const minTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, setState] = useState<TransitionState>("idle");
  const [label, setLabel] = useState("");
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAll = () => {
    if (minTimer.current) clearTimeout(minTimer.current);
    if (exitTimer.current) clearTimeout(exitTimer.current);
    if (progressRef.current) clearInterval(progressRef.current);
    minTimer.current = null;
    exitTimer.current = null;
    progressRef.current = null;
  };

  const startProgress = () => {
    setProgress(15);
    let p = 15;
    progressRef.current = setInterval(() => {
      // Snappy progress: fast start, smoothly eases up to 92%
      const remaining = 92 - p;
      const step = Math.max(0.8, remaining * 0.12);
      p = Math.min(p + step, 92);
      setProgress(p);
    }, 40);
  };

  const finishProgress = (onDone: () => void) => {
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(100);
    setTimeout(onDone, 240); // Quick, snappy 240ms arrival
  };

  const startTransition = (toolLabel: string) => {
    clearAll();
    started.current = Date.now();
    setLabel(toolLabel);
    setProgress(0);
    setState("entering");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setState("visible"));
    });
    startProgress();
    // Fast, crisp display time (~800ms)
    minTimer.current = setTimeout(() => {
      minTimer.current = null;
    }, 800);
  };

  const endTransition = () => {
    const elapsed = Date.now() - started.current;
    const minMs = 800;
    const remaining = Math.max(0, minMs - elapsed);

    setTimeout(() => {
      finishProgress(() => {
        setState("exiting");
        exitTimer.current = setTimeout(() => {
          setState("idle");
          started.current = 0;
          setProgress(0);
        }, 300);
      });
    }, remaining);
  };

  /* Intercept clicks on internal links */
  useEffect(() => {
    const click = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = (event.target as Element).closest("a");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      )
        return;
      const url = new URL(anchor.href, location.href);
      if (
        url.origin !== location.origin ||
        url.pathname + url.search === location.pathname + location.search
      )
        return;
      const tool = tools.find((t) => url.pathname === "/tools/" + t.id);
      const nextLabel =
        tool?.name ||
        (url.pathname === "/about"
          ? "About Bmaikr Tools"
          : url.pathname === "/"
            ? "Tool Directory"
            : "Page");
      startTransition(nextLabel);
    };
    document.addEventListener("click", click, true);
    return () => {
      document.removeEventListener("click", click, true);
      clearAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Route changed → end transition */
  useEffect(() => {
    if (previous.current === route) return;
    previous.current = route;
    if (started.current) {
      endTransition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  if (state === "idle") return null;

  return (
    <div
      className={`page-transition-overlay pt-${state}`}
      role="status"
      aria-live="polite"
      aria-label={`Loading ${label}`}
    >
      {/* Progress bar at top */}
      <div
        className="pt-progress-bar"
        style={{ width: `${progress}%` }}
      />

      {/* Center content */}
      <div className="pt-center">
        <div className="pt-logo">
          <Layers3 size={32} />
        </div>
        <div className="pt-label-wrap">
          <span className="pt-loading-text">Switching to</span>
          <strong className="pt-tool-name">{label}</strong>
        </div>
        {/* Fast circular spinner animation */}
        <div className="pt-spinner-wrap" aria-hidden="true">
          <svg className="pt-spinner-svg" viewBox="0 0 44 44">
            <circle
              className="pt-spinner-track"
              cx="22"
              cy="22"
              r="18"
              fill="none"
              strokeWidth="3.5"
            />
            <circle
              className="pt-spinner-dash"
              cx="22"
              cy="22"
              r="18"
              fill="none"
              strokeWidth="3.5"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function NavigationFeedback() {
  return (
    <Suspense fallback={null}>
      <NavigationFeedbackInner />
    </Suspense>
  );
}
