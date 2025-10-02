// --- TAMBAHKAN DUA BARIS DI BAWAH INI ---
import { Buffer } from 'buffer';
window.Buffer = Buffer;
// -----------------------------------------

import { createApp } from 'vue'
import App from './App.vue'

// Impor file gaya global kita
import './assets/main.scss'

// Buat instance aplikasi Vue dan pasang ke elemen dengan id 'app'
createApp(App).mount('#app')

