import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://plausible.io",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://plausible.io",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
      {
        source: "/api/community/org-run-files/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "sandbox; frame-ancestors 'self'" },
        ],
      },
      {
        source: "/",
        headers: [
          {
            key: "Link",
            value: [
              '</.well-known/api-catalog>; rel="api-catalog"',
              '</api/openapi.json>; rel="service-desc"',
              '</docs>; rel="service-doc"',
            ].join(", "),
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/community/api-docs",
        destination: "/docs",
        permanent: true,
      },
      {
        source: "/projects/monobrain",
        destination: "/projects/monomind",
        permanent: true,
      },
      {
        source: "/projects/monobrain/architecture",
        destination: "/projects/monomind/architecture",
        permanent: true,
      },
      {
        source: "/research",
        destination: "/whitepaper",
        permanent: true,
      },
      {
        source: "/blog/monomind-v28-workforce-orchestration-release",
        destination: "/blog/monomind-v28-antigravity-multiplatform",
        permanent: true,
      },
      {
        source: "/blog/monomind-v25-local-second-brain-release",
        destination: "/blog/monomind-v25-second-brain",
        permanent: true,
      },
      {
        source: "/blog/monomind-v20-deterministic-dag-engine-release",
        destination: "/blog/monomind-v22-org-runtime-v2",
        permanent: true,
      },
      {
        source: "/blog/monomind-v15-universal-cli-protocol-release",
        destination: "/blog/monomind-v23-local-memory-engine",
        permanent: true,
      },
      {
        source: "/blog/monomind-v10-open-source-foundation-release",
        destination: "/blog/monomind-v29-hardening-review-swarm",
        permanent: true,
      },
    ];
  },
};

initOpenNextCloudflareForDev();

export default nextConfig;
