# Pemutar Musik Mini Vue 3

Sebuah pemutar musik yang simpel dan elegan dibuat dengan Vue 3, Vite, dan Sass. Aplikasi ini memiliki antarmuka yang bersih, kontrol pemutaran, daftar putar yang dapat dicari, dan lirik yang tersinkronisasi.

-----

## 🎶 Fitur

  * **Pemutaran Audio Latar Belakang**: Lanjutkan mendengarkan bahkan saat aplikasi tidak aktif.
  * **Kontrol Pemutaran**: Putar, jeda, lewati ke trek berikutnya, dan kembali ke trek sebelumnya.
  * **Tampilan Sampul Album**: Lihat sampul album dari lagu yang sedang diputar.
  * **Bilah Progres**: Lihat dan atur progres pemutaran lagu.
  * **Informasi Lagu**: Tampilkan nama artis dan judul lagu yang sedang diputar.
  * **Lirik Tersinkronisasi**: Lirik akan otomatis bergulir seiring lagu diputar.
  * **Daftar Putar**: Lihat semua lagu yang tersedia dan pilih lagu untuk diputar.
  * **Pencarian**: Cari lagu atau artis dengan mudah di dalam daftar putar.
  * **Lagu Favorit**: Tandai lagu sebagai favorit.

-----

## 🛠️ Teknologi yang Digunakan

  * **Vue.js 3**: Kerangka kerja JavaScript progresif untuk membangun antarmuka pengguna.
  * **Vite**: Alat pengembangan frontend modern yang menyediakan server pengembangan cepat dan bundel produksi yang dioptimalkan.
  * **Sass**: Pre-prosesor CSS yang menambahkan fitur-fitur canggih seperti variabel, *nested rules*, dan *mixin*.
  * **JavaScript (ES6+)**: Bahasa pemrograman utama yang digunakan dalam proyek ini.
  * **HTML5 & CSS3**: Struktur dan gaya dari aplikasi web.

-----

## 🚀 Memulai

### Prasyarat

Pastikan Anda telah menginstal Node.js dan npm (atau Yarn) di mesin Anda.

### Instalasi

1.  **Kloning Repositori**

    ```bash
    git clone https://github.com/rioprastyo17/musikplayer.git
    cd musikplayer
    ```

2.  **Instal Dependensi**

    ```bash
    npm install
    ```

### Menjalankan Proyek

Untuk menjalankan server pengembangan, gunakan perintah berikut:

```bash
npm run dev
```

Buka browser Anda dan kunjungi `http://localhost:5173` (atau port lain yang ditampilkan di terminal).

### Membangun untuk Produksi

Untuk membuat build produksi yang dioptimalkan, jalankan:

```bash
npm run build
```

Perintah ini akan membuat direktori `dist` dengan semua file statis yang siap untuk di-deploy.

-----

## 📁 Struktur Proyek

```
musikplayer/
├── public/
│   ├── img/
│   ├── mp3/
│   └── ...
├── src/
│   ├── assets/
│   │   └── main.scss
│   ├── components/
│   │   ├── AlbumCover.vue
│   │   ├── LyricsDisplay.vue
│   │   ├── PlayerControls.vue
│   │   ├── Playlist.vue
│   │   └── ProgressBar.vue
│   ├── App.vue
│   └── main.js
├── index.html
├── package.json
└── vite.config.js
```

-----

## 🧩 Komponen

  * **`App.vue`**: Komponen utama yang menampung semua komponen lain dan mengelola status aplikasi.
  * **`AlbumCover.vue`**: Menampilkan sampul album dari lagu yang sedang diputar dengan efek transisi.
  * **`LyricsDisplay.vue`**: Menampilkan lirik yang tersinkronisasi dengan lagu yang sedang diputar.
  * **`PlayerControls.vue`**: Menyediakan tombol untuk kontrol pemutaran (putar, jeda, berikutnya, sebelumnya, favorit).
  * **`Playlist.vue`**: Menampilkan daftar semua lagu yang tersedia dan memungkinkan pengguna untuk mencari dan memilih lagu.
  * **`ProgressBar.vue`**: Menampilkan bilah progres pemutaran, durasi lagu, dan waktu saat ini.

-----

## 🎵 Menambahkan Musik Baru

Untuk menambahkan lagu baru ke dalam daftar putar, ikuti langkah-langkah berikut:

1.  Tempatkan file audio (misalnya, `.mp3`, `.flac`) di dalam direktori `public/mp3/`.
2.  (Opsional) Tempatkan file lirik (`.lrc`) dengan nama yang sama dengan file audio di direktori yang sama.
3.  (Opsional) Tempatkan file gambar sampul (misalnya, `.png`, `.jpg`) di dalam direktori `public/img/`.
4.  Buka `src/App.vue` dan tambahkan objek baru ke dalam array `tracks` di dalam `data()`. Contoh:

<!-- end list -->

```javascript
{
  name: "Judul Lagu Baru",
  artist: "Nama Artis",
  cover: "/img/nama-file-sampul.png",
  source: "/mp3/nama-file-audio.mp3",
  url: "https://www.youtube.com/watch?v=...", // Opsional
  favorited: false
}
```

-----

## 📄 Lisensi

Proyek ini dilisensikan di bawah [Lisensi MIT](https://opensource.org/licenses/MIT).
