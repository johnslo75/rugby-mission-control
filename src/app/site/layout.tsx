import type { Metadata } from "next";
import { Archivo, Archivo_Narrow, DM_Sans } from "next/font/google";
import "../globals.css";
import "./site.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["400", "500", "700", "800", "900"],
  display: "swap",
});

const archivoNarrow = Archivo_Narrow({
  subsets: ["latin"],
  variable: "--font-archivo-narrow",
  weight: ["400", "500", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Rugby Shithousery — Ireland's Home of Rugby Controversy",
    template: "%s | Rugby Shithousery",
  },
  description:
    "The cynical art of winning rugby. Irish rugby opinion, hot takes, shithousery moments, tactical breakdowns and World Cup 2027 coverage.",
  openGraph: {
    siteName: "Rugby Shithousery",
    type: "website",
    locale: "en_IE",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${archivo.variable} ${archivoNarrow.variable} ${dmSans.variable} site-root`}>
      {children}
    </div>
  );
}
