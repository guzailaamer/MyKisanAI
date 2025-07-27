import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'MyKisanAI - Smart Farming Assistant',
        short_name: 'MyKisanAI',
        description: 'AI-powered agricultural assistant for Indian farmers',
        theme_color: '#22c55e',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
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
  server: {
    proxy: {
      '/diagnose_crop': 'http://localhost:8000',
      '/market_advice': 'http://localhost:8000',
      '/subsidy_query': 'http://localhost:8000',
      '/tts': 'http://localhost:8000',
      '/stt': 'http://localhost:8000',
      '/conversations': 'http://localhost:8000',
      '/agent': 'http://localhost:8000',
      '/analyze-crop': 'http://localhost:8000',
      // Add other endpoints as needed
    },
  },
})