import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    /*hmr: {
      clientPort: 443,
      port: 5173,
    },*/
    host: true,
    allowedHosts: ["bradytelic-derek-gloopily.ngrok-free.dev", "localhost"],
    proxy: {
      "/api": {
        target: "http://localhost:5000", //development
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
