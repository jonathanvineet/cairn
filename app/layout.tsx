import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BoundaryTruth",
  description: "Tamper-proof evidence for every boundary inspection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0a1a0f]">
        {children}
      </body>
    </html>
  );
}
