import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SessionProvider } from "./providers/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenFloat POS X - Intelligent Commerce Platform",
  description: "OpenFloat POS X - Intelligent Commerce OS & ERP Engine",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100 antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}