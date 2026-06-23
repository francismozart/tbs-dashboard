import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Fixa a raiz no diretório do app (havia outro lockfile em C:\Users\franc).
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
