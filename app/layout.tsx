import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const titleFont = Space_Grotesk({ subsets: ["latin"], variable: "--font-title" });
const bodyFont = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });

export const metadata: Metadata = {
  metadataBase: new URL("https://blinddevtoolkit.com"),
  title: "Blind Dev Toolkit | Screen Reader Optimized Coding Environment",
  description:
    "Blind Dev Toolkit gives blind and low-vision developers a coding workspace with high-signal keyboard navigation, structured code narration, and voice-assisted review.",
  openGraph: {
    title: "Blind Dev Toolkit",
    description:
      "Screen reader optimized coding environment with voice-first code review and keyboard-only workflows.",
    url: "https://blinddevtoolkit.com",
    siteName: "Blind Dev Toolkit",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Blind Dev Toolkit",
    description:
      "A practical coding platform designed for screen reader users and teams building inclusive software."
  },
  robots: {
    index: true,
    follow: true
  },
  keywords: [
    "screen reader coding",
    "accessible developer tools",
    "blind programmer toolkit",
    "voice code review",
    "keyboard-first IDE"
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${titleFont.variable} ${bodyFont.variable} antialiased`}>{children}</body>
    </html>
  );
}
