import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import fs from "fs";

const icons = JSON.parse(fs.readFileSync("public/icons.json", "utf-8")).icons;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "Math Tracker",
        short_name: "MathTracker",
        theme_color: "#ffffff",
        icons: icons.map((icon: { src: string; sizes: string }) => ({
            src: icon.src,
            sizes: icon.sizes,
            type: 'image/png'
        })),
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});