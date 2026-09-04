import dns from "node:dns";
import type { NextConfig } from "next";
import path from "path";

// Node 17+ prefers IPv6; a broken ::1 / IPv6 path can stall every page ~75–90s.
dns.setDefaultResultOrder("ipv4first");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
