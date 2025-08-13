import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      // This will forward any request starting with /api to your backend
      '/api': {
        target: 'http://localhost:3000', // The address Vercel CLI runs the backend on
        changeOrigin: true,
      }
    }
  }
})
