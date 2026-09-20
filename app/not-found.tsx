"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layers3, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  return (
    <main className="nf-root">
      {/* ── animated circle rings ── */}
      <div className="nf-rings" aria-hidden="true">
        <span className="nf-ring r1" />
        <span className="nf-ring r2" />
        <span className="nf-ring r3" />
        <span className="nf-ring r4" />
        {/* center logo */}
        <div className="nf-logo">
          <Layers3 size={30} />
        </div>
      </div>

      {/* ── copy ── */}
      <div className="nf-body">
        <div className="nf-code">404</div>
        <h1 className="nf-title">Page not found</h1>
        <p className="nf-desc">
          This page doesn&apos;t exist or was moved.
          <br />
          Head back to the toolbox — 60 tools are waiting.
        </p>

        {/* ── buttons ── */}
        <div className="nf-actions">
          <button className="nf-btn-back" onClick={() => router.back()}>
            <ArrowLeft size={17} />
            Go back
          </button>
          <Link href="/" className="nf-btn-home">
            <Home size={17} />
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
