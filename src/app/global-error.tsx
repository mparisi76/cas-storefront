"use client";

// Last-resort fallback if the root layout itself fails. Must render its own
// <html>/<body> and can't rely on the site's components or styles loading.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Arial, Helvetica, sans-serif", background: "#F9F8F6", color: "#27272a" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 420, textAlign: "center" }}>
            <p style={{ letterSpacing: "0.4em", fontSize: 11, textTransform: "uppercase", color: "#52525b" }}>
              Catskill Architectural Salvage
            </p>
            <h1 style={{ fontSize: 28, margin: "16px 0" }}>Something went wrong</h1>
            <p style={{ lineHeight: 1.6, color: "#52525b" }}>
              The site hit an unexpected error. Please try again in a moment.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
              <button
                onClick={reset}
                style={{ background: "#18181b", color: "#fff", border: 0, padding: "12px 24px", cursor: "pointer" }}
              >
                Try again
              </button>
              <a href="/" style={{ border: "1px solid #d4d4d8", padding: "12px 24px", color: "#27272a", textDecoration: "none" }}>
                Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
