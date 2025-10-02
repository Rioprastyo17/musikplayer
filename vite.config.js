import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 'define' digunakan untuk mengganti variabel global saat build.
  // 'global' dibutuhkan oleh beberapa library yang bergantung pada Node.js.
  define: {
    'global': 'globalThis',
  },
  // 'resolve.alias' memberitahu Vite untuk menggunakan versi library
  // yang ramah-browser saat ada kode yang mencoba mengimpor modul inti Node.js.
  resolve: {
    alias: {
      // PERBAIKAN: Hapus '/browser' dari sini
      process: "process",
      stream: "stream-browserify",
      zlib: "browserify-zlib",
      util: "util"
    }
  }
})


