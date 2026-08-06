import type { Metadata } from "next";

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
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.0/dist/tailwind.min.css" 
        />
      </head>
      <body>{children}</body>
    </html>
  );
}