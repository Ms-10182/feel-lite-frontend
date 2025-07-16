import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        // target: 'http://57.159.27.100:8080',
        changeOrigin: true,
        secure: false, // if your backend is self-signed HTTPS
        rewrite: (path) => path.replace(/^\/api/, ""), // optional: strip `/api`
      },
    },
  },
  base: "/",
  build: {
    outDir: "dist", // ensures output goes to dist/
    sourcemap: true, // optional for debugging in production
  },
});
