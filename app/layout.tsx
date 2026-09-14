import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://whats-pumping.vercel.app"),
  title: "What's Pumping? · Tatum",
  description:
    "Meme-coin radar for the best pumps of the day. Powered by Tatum trending tokens API.",
  openGraph: {
    title: "What's Pumping? · Tatum",
    description: "Get trending tokens. Best pumps and rugs of the day.",
    url: "https://whats-pumping.vercel.app",
    siteName: "Tatum",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "What's Pumping? — Get Trending Tokens",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "What's Pumping? · Tatum",
    description: "Get trending tokens. Best pumps and rugs of the day.",
    images: ["/og.png"],
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
