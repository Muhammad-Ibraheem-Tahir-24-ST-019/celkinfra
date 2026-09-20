"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="empty">
      <h1>Something interrupted this page</h1>
      <p>Please try loading it again.</p>
      <button className="primary-button" onClick={reset}>
        Try again
      </button>
      <a href="/">Return to tools</a>
    </main>
  );
}
