import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  async rewrites() {
    return [
      // airsig invite links. With the app installed, iOS opens these in the
      // app directly (see public/.well-known/apple-app-site-association);
      // otherwise — or inside an in-app browser like LINE's — this
      // standalone page offers an "open in app" button and install steps.
      { source: "/i/:token", destination: "/airsig/invite.html" },
    ];
  },

  async headers() {
    return [
      {
        // iOS requires JSON for the extensionless association file.
        source: "/.well-known/apple-app-site-association",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
    ];
  },
};

export default nextConfig;
