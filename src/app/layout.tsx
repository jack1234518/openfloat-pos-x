import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenFloat POS X - Intelligent Commerce Platform",
  description: "OpenFloat POS X - Intelligent Commerce OS & ERP Engine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}