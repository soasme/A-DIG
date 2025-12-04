import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cultivators or Demon-In-Disguise - Logic Puzzle Game",
  description: "Test your deductive reasoning in this engaging logic puzzle game. Identify cultivators and demons-in-disguise using clues and logical deduction. No guessing allowed!",
  keywords: "logic puzzle, deduction game, cultivators, demon puzzle, brain teaser, reasoning game, logic game",
  authors: [{ name: "Cultivators Game" }],
  openGraph: {
    title: "Cultivators or Demon-In-Disguise - Logic Puzzle Game",
    description: "Test your deductive reasoning in this engaging logic puzzle game. Identify cultivators and demons-in-disguise using clues and logical deduction.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cultivators or Demon-In-Disguise - Logic Puzzle Game",
    description: "Test your deductive reasoning in this engaging logic puzzle game. Identify cultivators and demons-in-disguise using clues and logical deduction.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
