import type { NextConfig } from "next";

function r2Hostname(): string | null {
  try {
    return new URL(process.env.R2_PUBLIC_URL ?? "").hostname;
  } catch {
    return null;
  }
}

const remoteHostname = r2Hostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // domínio público padrão do R2 (ex: pub-xxxx.r2.dev)
      { protocol: "https", hostname: "*.r2.dev" },
      // domínio customizado do bucket, se configurado via R2_PUBLIC_URL
      ...(remoteHostname && !remoteHostname.endsWith(".r2.dev")
        ? [{ protocol: "https" as const, hostname: remoteHostname }]
        : []),
    ],
  },
};

export default nextConfig;
