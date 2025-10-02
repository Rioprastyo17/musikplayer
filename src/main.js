// Dua baris polyfill manual yang kita tambahkan sebelumnya
// sekarang sudah tidak diperlukan lagi karena ditangani oleh plugin.

import { createApp } from 'vue'
import App from './App.vue'

// Impor file gaya global kita
import './assets/main.scss'

// Buat instance aplikasi Vue dan pasang ke elemen dengan id 'app'
createApp(App).mount('#app')


