import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Velox Control",
  description: "Panel de control para negocios gastronómicos — Velox",
};

export const viewport: Viewport = {
  themeColor: "#0a0a13",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
