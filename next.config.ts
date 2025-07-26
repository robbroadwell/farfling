import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['your-image-hosting.com', 'images.unsplash.com', 'plus.unsplash.com'],
  },
};


module.exports = nextConfig;
export default nextConfig;
