import type { MetadataRoute } from "next";

// Permite "Agregar a pantalla de inicio" en Android (Chrome) e iPhone (Safari)
// como app independiente, con el logo de Velox.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VeloxAdmin",
    short_name: "VeloxAdmin",
    description: "Panel de control para negocios gastronómicos",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f7fb",
    theme_color: "#7c3aed",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
