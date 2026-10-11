import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /* 90 for photos: the default 75 visibly softened dark, high-contrast
       club shots. 75 stays allowed for anything that does not ask. */
    qualities: [75, 90],
  },
  experimental: {
    /* The page's CSS goes into the HTML itself instead of separate files the
       browser must fetch before it can draw anything. The styles are small
       (about 13 KB), and on a phone connection those blocking requests were
       the largest delay before the headline appeared. */
    inlineCss: true,
  },
};

export default nextConfig;
