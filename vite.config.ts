import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081,
    strictPort: true,
    allowedHosts: [
      ".sandbox.novita.ai",
      "localhost",
      "127.0.0.1"
    ],
    cors: true,
    hmr: {
      clientPort: 8081,
      host: "8081-iudjr1x93ikq3ic9wcofs-583b4d74.sandbox.novita.ai"
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
}));
