import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack configuration for WalletConnect compatibility
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  
  // Transpile WalletConnect packages
  transpilePackages: [
    "@walletconnect/modal",
    "@walletconnect/modal-ui",
    "@hashgraph/hedera-wallet-connect",
  ],
};

export default nextConfig;
