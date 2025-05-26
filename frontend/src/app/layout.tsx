import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vendorly",
  description: "Vendorly is a platform for vendors to manage their business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
