import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      // Ancien nom de la page collection (liens/bookmarks existants)
      { source: "/catalogue", destination: "/collection", permanent: true },
      { source: "/catalogue/:path*", destination: "/collection/:path*", permanent: true },
      // Alias du manifeste PWA (certains outils cherchent /manifest.json)
      { source: "/manifest.json", destination: "/manifest.webmanifest", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
