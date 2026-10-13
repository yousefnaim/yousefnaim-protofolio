import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    // local dev has no serverless runtime: forward /api to your deployed site
    // proxy: { '/api': { target: 'https://YOUR-SITE.vercel.app', changeOrigin: true } },
  },
})
