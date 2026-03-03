import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // 'autoUpdate' : le SW se met à jour automatiquement en arrière-plan
      // dès qu'un nouveau build est détecté.
      registerType: 'autoUpdate',

      // Mode injectManifest : on fournit notre propre SW (src/sw.js) qui gère
      // le push. Workbox injecte le precache manifest dedans à la build.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',

      // Fichiers à pré-mettre en cache au moment du build (precache)
      includeAssets: ['favicon.svg', 'icons/*.png'],

      // Manifeste Web App (rend l'app installable sur mobile/desktop)
      manifest: {
        name: 'AcademiX',
        short_name: 'AcademiX',
        description: 'Plateforme académique intelligente pour étudiants',
        theme_color: '#1e40af',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait-primary',
        categories: ['education'],
        icons: [
          { src: 'icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
          { src: 'icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
          { src: 'icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: 'icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
          { src: 'icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          // Icônes maskable séparées (safe-zone 80 %)
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },

      // Configuration Workbox pour injectManifest
      injectManifest: {
        // Fichiers à précacher automatiquement
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      },

      // Activer le SW en mode développement (nécessaire pour les push)
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    // allowedHosts: true,

    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/socket.io': {
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