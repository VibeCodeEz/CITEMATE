import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import Link from "next/link";

import "./globals.css";

import { ToasterProvider } from "@/components/app/toaster-provider";
import { getSiteUrl } from "@/lib/site";

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const serif = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CiteMate",
  description: "A citation and research helper for college students.",
  metadataBase: new URL(getSiteUrl()),
  icons: {
    icon: "/img/Tab Logo - CiteMate.png",
    shortcut: "/img/Tab Logo - CiteMate.png",
    apple: "/img/Tab Logo - CiteMate.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} antialiased`}>
        <Link href="#main-content" className="skip-link">
          Skip to main content
        </Link>
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
