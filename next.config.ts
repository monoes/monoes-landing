import type { NextConfig } from "next";

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
    ];
  },
};

export default nextConfig;
