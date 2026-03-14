import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Community Skills Exchange",
  description: "Community Skills Exchange Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-800">{children}</body>
    </html>
  );
}
