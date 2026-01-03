import type { Metadata } from "next";

import { Crimson_Pro, Inter } from "next/font/google";

import "../index.css";
import Providers from "@/components/providers";

const crimsonPro = Crimson_Pro({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Exhibit",
  description: "A platform for artists to showcase their work",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${crimsonPro.variable} ${inter.variable} antialiased bg-background text-foreground`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
