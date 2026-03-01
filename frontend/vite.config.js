import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    // allowedHosts: true, // Tu peux le garder si besoin, mais souvent inutile en local pur

    // 1. On retire complètement le bloc "hmr: { clientPort: 443 }"

    proxy: {
      '/api': {
        // 2. On remet l'URL locale de ton serveur Laravel
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/socket.io': {
        // Idem ici si tu as un serveur WebSocket local
        target: 'http://localhost:8000',
        ws: true,
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});