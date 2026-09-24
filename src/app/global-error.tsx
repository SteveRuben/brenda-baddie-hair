"use client";

import Link from "next/link";

// Dernier recours : remplace tout le layout racine, doit définir son propre
// <html> / <body>. Styles inline pour rester affichable même si le CSS échoue.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#fafafa",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 16,
            padding: 32,
            maxWidth: 380,
            textAlign: "center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          }}
        >
          <p style={{ fontSize: 56, fontWeight: 800, color: "#f6c2cc", margin: 0 }}>500</p>
          <h1 style={{ color: "#7c1426", fontSize: 20, margin: "12px 0 0" }}>
            Une erreur est survenue
          </h1>
          <p style={{ color: "#737373", fontSize: 14, margin: "8px 0 0" }}>
            Le site rencontre un problème technique. Réessayez dans un instant.
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: 24,
              width: "100%",
              border: 0,
              borderRadius: 999,
              background: "#9e1b32",
              color: "#fff",
              fontWeight: 700,
              padding: "12px 24px",
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            Réessayer
          </button>
          <div style={{ marginTop: 12 }}>
            <Link href="/" style={{ color: "#7c1426", fontWeight: 600, fontSize: 14 }}>
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
