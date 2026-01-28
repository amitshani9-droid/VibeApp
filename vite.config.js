import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vibe_logo.jpg'],
      manifest: {
        name: 'Vibe',
        short_name: 'Vibe',
        description: 'Vibe - Personal Management & Growth',
        theme_color: '#050505',
        background_color: '#050505',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'vibe_logo.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'vibe_logo.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      }
    })
  ],
})
