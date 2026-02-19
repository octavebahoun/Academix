import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  tailwindcss(),
  ],
  server: {
    host: true,
    allowedHosts: true, // Be as permissive as possible in dev mode
    hmr: {
      clientPort: 443 // Critical for ngrok HTTPS
    },
    proxy: {
      '/api': {
        target: 'https://pretty-singers-dance.loca.lt',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://pretty-singers-dance.loca.lt',
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
