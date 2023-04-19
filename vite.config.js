import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

import apiServer from './backend'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      workbox: {
        // NOTE: 缺省情况下 Workbox 将拦截所有 navigation request 并直接返回已经缓存的 index.html 内容，
        //       一般来说这是 SPA 应用所需要的，但是本程序的导出功能是通过在新窗口打开 /api/sheet/export
        //       链接来实现的，这是一个 navigation request，所以需要对这种请求放行。
        navigateFallbackDenylist: [/^\/api\//]
      }
    }),
    vue(),
    apiServer,
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
