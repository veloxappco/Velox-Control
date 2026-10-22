import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fija la raíz de Turbopack en esta carpeta. Si hay otro package-lock.json
  // en una carpeta superior, Next escanea de más y el modo desarrollo se vuelve
  // lentísimo (20-40 s por página) y puede fallar con errores de manifest.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
