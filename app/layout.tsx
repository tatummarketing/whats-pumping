import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://apps.tatum.io/whats-pumping"),
  title: "What's Pumping? · Tatum",
  description:
    "Meme-coin radar for the best pumps of the day. Powered by Tatum trending tokens API.",
  icons: {
    icon: [
      {
        url: "https://apps.tatum.io/whats-pumping/favicon.png",
        type: "image/png",
        sizes: "32x32",
      },
    ],
    apple: [
      {
        url: "https://apps.tatum.io/whats-pumping/apple-touch-icon.png",
        type: "image/png",
        sizes: "256x256",
      },
    ],
    shortcut: "https://apps.tatum.io/whats-pumping/favicon.png",
  },
  openGraph: {
    title: "What's Pumping? · Tatum",
    description:
      "Live meme-coin radar for Solana, Base & BSC. Powered by Tatum Trending Tokens API.",
    url: "https://apps.tatum.io/whats-pumping",
    siteName: "Tatum",
    type: "website",
    images: [
      {
        // Prefer Webflow CDN — more reliable for X/Twitter crawlers than the Cloud worker.
        url: "https://cdn.prod.website-files.com/618a9dc0e5826661c77e6a67/6aabb705346351ac10d36876_whats-pumping-og.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "What's Pumping? — Trending Tokens API",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "What's Pumping? · Tatum",
    description:
      "Live meme-coin radar for Solana, Base & BSC. Powered by Tatum Trending Tokens API.",
    images: [
      "https://cdn.prod.website-files.com/618a9dc0e5826661c77e6a67/6aabb705346351ac10d36876_whats-pumping-og.png",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
