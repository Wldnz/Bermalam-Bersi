import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images : {
    remotePatterns : [
      {
        hostname : "*", // sementer gini dlu
        protocol:"https",
      }
    ]
  }
};

export default nextConfig;
