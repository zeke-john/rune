import type { Metadata } from "next";
// import Script from "next/script";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "rune",
  description: "ASCII art animations for React",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* <head>
        <Script
          src="https://unpkg.com/react-scan/dist/auto.global.js"
          strategy="beforeInteractive"
        />
      </head> */}
      <body
        className={`${geistMono.variable} ${geistMono.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
