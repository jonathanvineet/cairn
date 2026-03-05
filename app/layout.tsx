import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Rajdhani, JetBrains_Mono, Exo_2 } from "next/font/google";

const rajdhani = Rajdhani({ 
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-rajdhani",
});

const jetbrainsMono = JetBrains_Mono({ 
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

const exo2 = Exo_2({ 
  weight: ["300", "500"],
  subsets: ["latin"],
  variable: "--font-exo2",
});

export const metadata: Metadata = {
  title: "SKYVAULT — 3D Drone Patrol Simulator",
  description:
    "Fly through a living forest, detect boundary breaches, register drones via holographic forms, and watch them join the autonomous patrol swarm.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${rajdhani.variable} ${jetbrainsMono.variable} ${exo2.variable} antialiased min-h-screen bg-[#050810] text-white overflow-x-hidden`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

