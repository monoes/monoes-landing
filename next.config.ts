import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
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
