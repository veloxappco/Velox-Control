import type { Metadata, Viewport } from "next";
// Inter autoalojada (solo latín y los 4 pesos que se usan).
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "VeloxAdmin",
  description: "Panel de control para negocios gastronómicos — VeloxAdmin",
  applicationName: "VeloxAdmin",
  appleWebApp: { capable: true, title: "VeloxAdmin", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
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
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
