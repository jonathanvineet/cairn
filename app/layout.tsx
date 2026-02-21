import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "BoundaryTruth — Legal-Proof Fence Inspections",
  description:
    "Tamper-proof evidence infrastructure for every boundary inspection. Autonomous drone patrols, blockchain-verified records.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#0a1a0f] text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

