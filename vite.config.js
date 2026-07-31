import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  // Mac+Caddy sirve todo bajo /signtrack/; Render Static Site sirve el sitio
  // en la raíz del dominio, así que ese deploy pasa VITE_BASE_PATH=/ al build.
  base: process.env.VITE_BASE_PATH || '/signtrack/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5180,
    open: '/signtrack/',
    proxy: {
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        secure: false,
      },
      '/hubs': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/recognition-api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  },
})
