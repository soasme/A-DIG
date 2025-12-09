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
  title: "Clues of Who? - Logic Puzzle Game",
  description: "Test your deductive reasoning in this engaging logic puzzle game. Identify humble souls and villains using clues and logical deduction. No guessing allowed!",
  keywords: "logic puzzle, deduction game, demon puzzle, werewolf puzzle, xiuxian puzzle, brain teaser, reasoning game, logic game",
  authors: [{ name: "InkyLabs" }],
  openGraph: {
    title: "Clues of Who? - Logic Puzzle Game",
    description: "Test your deductive reasoning in this engaging logic puzzle game. Identify humble souls and villains using clues and logical deduction.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clues of Who? - Logic Puzzle Game",
    description: "Test your deductive reasoning in this engaging logic puzzle game. Identify humble souls and villains using clues and logical deduction.",
  },
  icons: {
    icon: "/favicon.ico",
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
