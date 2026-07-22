import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: ['**/data/*.sqlite', '**/data/*.sqlite-shm', '**/data/*.sqlite-wal'],
    },
  },
  build: {
    rollupOptions: {
      input: {
        presentation: resolve(import.meta.dirname, 'index.html'),
        control: resolve(import.meta.dirname, 'control.html'),
      },
    },
  },
})
