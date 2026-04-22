import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "@/app/globals.css";
import "@/styles/accessibility.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans"
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://blind-dev-toolkit.example.com"),
  title: {
    default: "Blind Dev Toolkit | Screen Reader Optimized IDE",
    template: "%s | Blind Dev Toolkit"
  },
  description:
    "Blind Dev Toolkit is a screen reader optimized coding environment with audio navigation, keyboard-first workflows, and accessible debugging for NVDA, JAWS, and VoiceOver.",
  keywords: [
    "accessible IDE",
    "screen reader developer tools",
    "NVDA coding",
    "JAWS development",
    "VoiceOver engineering",
    "blind developer toolkit"
  ],
  openGraph: {
    title: "Blind Dev Toolkit",
    description:
      "A coding environment built for blind and visually impaired developers with spoken code navigation and accessible debugging.",
    type: "website",
    siteName: "Blind Dev Toolkit"
  },
  twitter: {
    card: "summary_large_image",
    title: "Blind Dev Toolkit",
    description: "Screen reader optimized coding environment and tools"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
