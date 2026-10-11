import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    /* The page's CSS goes into the HTML itself instead of separate files the
       browser must fetch before it can draw anything. The styles are small
       (about 13 KB), and on a phone connection those blocking requests were
       the largest delay before the headline appeared. */
    inlineCss: true,
  },
};

export default nextConfig;
