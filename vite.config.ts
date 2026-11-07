import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative base keeps the built app portable: it works both at the
  // domain root locally and under https://<user>.github.io/My_Heart/.
  base: './',
  plugins: [react()],
  server: {
    port: 5178,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: false,
      },
      '/ws': {
        target: 'ws://127.0.0.1:8787',
        ws: true,
      },
      '/admin': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: false,
      },
    },
  },
  preview: {
    port: 4178,
    host: '0.0.0.0',
  },
})
