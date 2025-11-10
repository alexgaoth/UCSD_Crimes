import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'UCSD Crime app',
        short_name: 'App',
        description: 'the App to see, track, report all Crimes that happen in and around UCSD',
        theme_color: '#8b7355',
        background_color: '#8b7355',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base: '/UCSD_Crimes/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  // Preview configuration for testing production build locally
  preview: {
    port: 4173,
    strictPort: false
  }
})

