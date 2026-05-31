import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "../globals.css";
import "./site.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rugby Shithousery — Irish Rugby News, Hot Takes & Shithousery",
  description: "The home of Irish rugby opinion. Cynical play, referee management, professional fouls, controversies, and the hot takes nobody else will say.",
  openGraph: {
    siteName: "Rugby Shithousery",
    type: "website",
  },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${playfair.variable} ${inter.variable} site-root`}>
      {children}
    </div>
  );
}
