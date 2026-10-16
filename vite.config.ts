import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// ✅ 1. Import Visualizer
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // ✅ 2. Add Plugin
    visualizer({
      open: false, // Don't auto open browser in headless runs
      gzipSize: true,
      brotliSize: true,
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', '@reduxjs/toolkit', 'react-redux'],
          utils: ['axios', 'date-fns', 'dompurify'],
        },
      },
    },
  },

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});