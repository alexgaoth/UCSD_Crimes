import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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