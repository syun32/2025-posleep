import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// 공통(운영 포함)
const base: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
};

// 개발 모드에서만 /api → 8080 프록시
const config = (phase: string): NextConfig => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      ...base,
      async rewrites() {
        return [
          { source: "/api/:path*", destination: "http://localhost:8080/:path*" },
        ];
      },
    };
  }
  return base;
};

export default config;
