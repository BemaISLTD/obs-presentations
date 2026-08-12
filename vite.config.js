import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: [
        "**/data/*.sqlite",
        "**/data/*.sqlite-shm",
        "**/data/*.sqlite-wal",
      ],
    },
  },
  // Absolute, because the app is served from nested routes (/program,
  // /camera-setup) and the MediaPipe WASM/model assets are loaded at runtime
  // from absolute paths that must resolve identically from every route.
  base: "/",
  build: {
    rollupOptions: {
      input: {
        presentation: resolve(import.meta.dirname, "index.html"),
        control: resolve(import.meta.dirname, "control.html"),
        cameraSetup: resolve(import.meta.dirname, "camera-setup.html"),
      },
    },
  },
});
