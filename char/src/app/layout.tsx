import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Syne({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "CHAR — swipe your soft spots",
  description: "Tinder for the lies your product tells itself.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} dark h-full`}
    >
      <body className="min-h-full bg-black font-sans text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
