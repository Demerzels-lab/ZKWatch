import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/lib/web3Provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ZKWatch - AI-Powered Whale Tracking Platform",
  description: "Monitor whale activities with AI-enhanced tracking and zero-knowledge privacy features",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-gray-950 text-gray-100`}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
