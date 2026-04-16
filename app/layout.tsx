import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blind Dev Toolkit | Screen Reader Optimized Coding Environment",
  description:
    "Blind Dev Toolkit is a screen reader-first coding environment with semantic navigation, audio diagnostics, keyboard workflows, and built-in accessibility checks.",
  metadataBase: new URL("https://blinddevtoolkit.com"),
  openGraph: {
    title: "Blind Dev Toolkit",
    description:
      "A coding environment built for developers who rely on screen readers. Semantic navigation, audio feedback, and keyboard-only workflows.",
    url: "https://blinddevtoolkit.com",
    siteName: "Blind Dev Toolkit",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Blind Dev Toolkit",
    description:
      "Screen reader optimized coding environment and tools with paywalled collaboration workspace."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[var(--background)] text-[var(--foreground)] antialiased">{children}</body>
    </html>
  );
}
