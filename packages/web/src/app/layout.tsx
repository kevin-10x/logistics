import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AfriLogistics - Logistics Platform for Africa",
  description: "Complete logistics management: route optimization, fleet tracking, warehouse management, fuel optimization, and delivery prediction",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
