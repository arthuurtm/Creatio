import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import fs from 'fs'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const componentsDir = path.resolve(__dirname, 'src/components')
const componentSubdirs = fs
  .readdirSync(componentsDir)
  .filter((dir) => dir !== 'base')
  .map((dir) => path.join(componentsDir, dir))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    Components({
      dirs: componentSubdirs,
      extensions: ['vue'],
      deep: true,
      dts: true,
      exclude: [/\/base\//],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '#': fileURLToPath(new URL('./api', import.meta.url)),
    },
  },
  server: {
    allowedHosts: [],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
