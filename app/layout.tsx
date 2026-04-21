import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://blinddevtoolkit.com"),
  title: "Blind Dev Toolkit | Screen Reader Optimized Coding Environment",
  description:
    "Blind Dev Toolkit is a screen reader optimized coding environment with audio code navigation, collaborative editing, and accessible debugging workflows built for NVDA, JAWS, and VoiceOver.",
  keywords: [
    "accessible IDE",
    "screen reader coding",
    "blind developer tools",
    "NVDA",
    "JAWS",
    "VoiceOver",
    "inclusive engineering"
  ],
  openGraph: {
    title: "Blind Dev Toolkit",
    description:
      "Code faster with a screen reader-first IDE: audio navigation, accessible debugging, and collaboration built for blind developers.",
    type: "website",
    url: "https://blinddevtoolkit.com",
    siteName: "Blind Dev Toolkit"
  },
  twitter: {
    card: "summary_large_image",
    title: "Blind Dev Toolkit",
    description:
      "A coding environment engineered for blind and visually impaired developers, not adapted as an afterthought."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        {children}
      </body>
    </html>
  );
}
