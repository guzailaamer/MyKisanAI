import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/diagnose_crop': 'http://localhost:8000',
      '/market_advice': 'http://localhost:8000',
      '/subsidy_query': 'http://localhost:8000',
      '/tts': 'http://localhost:8000',
      '/stt': 'http://localhost:8000',
      // Add other endpoints as needed
    },
  },
})