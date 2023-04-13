import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import apiServer from './backend'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true
  },
  plugins: [
    vue(),
    apiServer,
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
