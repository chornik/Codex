import type { NextConfig } from "next";
const config: NextConfig = {
  serverExternalPackages: [
    "@prisma/client",
    "tesseract.js",
    "@tesseract.js-data/eng",
    "pdf-parse",
    "sharp",
  ],
  experimental: { cpus: 2 },
  poweredByHeader: false,
  allowedDevOrigins: process.env.APP_ORIGIN
    ? [new URL(process.env.APP_ORIGIN).hostname]
    : [],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
export default config;
