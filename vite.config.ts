import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type PluginOption } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react() as unknown as PluginOption,
    tailwindcss() as unknown as PluginOption,
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: false },
      manifest: {
        name: "Proyecto Base",
        short_name: "Base",
        start_url: "/",
        display: "standalone",
        background_color: "#f5efe6",
        theme_color: "#1c1917",
        icons: [
          { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }) as unknown as PluginOption,
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
