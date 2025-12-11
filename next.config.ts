import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },

  // Next.js 16 no longer supports "eslint" option in next.config.
  // Removed to avoid type error.

  env: {
    PAYPAL_CLIENT_ID:
      "BAAQambvfgf8cMiIWoROWluTo5X08lvESisQno-RXyWIK7Mk8JzNL7UNonzp8h5g5ZGjd8HTp2vBHD_4zk",
  },
};

export default nextConfig;
