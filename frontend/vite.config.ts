import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      overlay: false,
      clientPort: 443,
    },
    // Allow explicit preview URL patterns (Vite 5.4.12+ doesn't allow "all")
    allowedHosts: [
      '.preview.emergentagent.com',    // Public preview URLs
      '.preview.emergentcf.cloud',     // Internal K8s cluster hostnames  
      '.emergent.host',                // Production domains
      'localhost',
    ],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
