import type { Metadata } from "next";
import Providers from "./providers";
import "../globals.css";

export const metadata: Metadata = {
  title: "Mission Control — Rugby Shithousery",
  description: "Daily operations dashboard for Rugby Shithousery content",
};

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-gray-50">{children}</div>
    </Providers>
  );
}
