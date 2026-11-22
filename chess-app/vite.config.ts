import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'Chess Trainer',
        short_name: 'Chess',
        description: 'Học cờ vua từ cơ bản đến nâng cao: bài học, bài tập, chơi với máy và phân tích ván.',
        lang: 'vi',
        theme_color: '#2f6f4e',
        background_color: '#f4f1ea',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Stockfish wasm is ~7MB: allow it in the precache so the engine works offline.
        maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,wasm,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/lichess\.org\/api\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'lichess-api', expiration: { maxEntries: 50, maxAgeSeconds: 86400 } },
          },
          {
            urlPattern: /^https:\/\/api\.chess\.com\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'chesscom-api', expiration: { maxEntries: 50, maxAgeSeconds: 86400 } },
          },
        ],
      },
    }),
  ],
  build: { chunkSizeWarningLimit: 1500 },
});
