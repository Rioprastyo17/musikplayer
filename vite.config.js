import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// Impor plugin yang baru kita instal
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Jalankan plugin-nya
    nodePolyfills({
      protocolImports: true,
    }),
  ],
})


