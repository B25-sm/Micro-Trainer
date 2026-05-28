import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Disable caching during development
    headers: {
      'Cache-Control': 'no-store',
    },
  },
  build: {
    // Generate unique hashes for each build
    rollupOptions: {
      output: {
        // Add timestamp to filenames to bust cache
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    }
  }
})
