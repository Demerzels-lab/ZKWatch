import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { InteractiveBackground } from "@/components/InteractiveBackground";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ZKWatch - AI-Powered Whale Tracking Platform",
  description: "Monitor whale activity with AI-enhanced tracking and zero-knowledge privacy features. Real-time insights with guaranteed privacy.",
  keywords: "whale tracking, crypto, blockchain, AI, zero-knowledge, privacy, ethereum, polygon, arbitrum",
  authors: [{ name: "ZKWatch Team" }],
  icons: {
    icon: "/logo.jpeg",
  },
  openGraph: {
    title: "ZKWatch - AI-Powered Whale Tracking Platform",
    description: "Monitor whale activity with AI-enhanced tracking and zero-knowledge privacy features.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#050505] text-gray-100`}>
        <InteractiveBackground />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
