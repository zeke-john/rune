import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "rune",
  description: "ASCII animations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script src="//unpkg.com/react-scan/dist/auto.global.js" async />
      </head>
      <body
        className={`${geistMono.variable} ${geistMono.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
