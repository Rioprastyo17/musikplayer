<template>
  <div class="wrapper">
    <!-- Tampilkan pemutar musik secara langsung -->
    <div class="player">
      <div class="player__top">
        <AlbumCover
          :tracks="tracks"
          :current-track-index="currentTrackIndex"
          :transition-name="transitionName"
          :is-metadata-loading="isMetadataLoading"
        />
        <LyricsDisplay
          :lyrics="lyrics"
          :current-lyric-index="currentLyricIndex"
        />
        <PlayerControls
          :is-playing="isTimerPlaying"
          :is-favorited="currentTrack && currentTrack.favorited"
          :track-url="currentTrack ? currentTrack.url : '#'"
          @play="play"
          @prev="prevTrack"
          @next="nextTrack"
          @favorite="favorite"
          @toggle-playlist="isPlaylistVisible = !isPlaylistVisible"
        />
      </div>
      <ProgressBar
        ref="progressBar"
        :duration="duration"
        :current-time="currentTime"
        :bar-width="barWidth"
        :current-track="currentTrack"
        @progress-clicked="clickProgress"
      />
    </div>

    <!-- Komponen Playlist akan muncul sebagai overlay jika isPlaylistVisible bernilai true -->
    <Playlist
      v-if="isPlaylistVisible"
      :tracks="tracks"
      :current-track-index="currentTrackIndex"
      @close="isPlaylistVisible = false"
      @track-selected="selectTrack"
    />
  </div>
</template>

<script>
// Impor semua komponen anak
import AlbumCover from './components/AlbumCover.vue';
import PlayerControls from './components/PlayerControls.vue';
import ProgressBar from './components/ProgressBar.vue';
import LyricsDisplay from './components/LyricsDisplay.vue';
import Playlist from './components/Playlist.vue';

// Impor library music-metadata-browser
import * as mm from 'music-metadata-browser';

export default {
  components: {
    AlbumCover,
    PlayerControls,
    ProgressBar,
    LyricsDisplay,
    Playlist,
  },
  data() {
    return {
      audio: null,
      duration: '00:00',
      currentTime: '00:00',
      barWidth: '0%',
      isTimerPlaying: false,
      isMetadataLoading: false, // Untuk menampilkan spinner saat lagu dimuat
      sources: [
        '/mp3/01 - Ada Band - Surga Cinta.flac',
        '/mp3/03 - Ada Band - Karena Wanita (Ingin Dimengerti).flac',
        // Tambahkan semua file musik Anda yang lain di sini
      ],
      tracks: [], // Akan diisi dengan data placeholder
      currentTrack: null, // Awalnya null, tidak ada lagu yang dipilih
      currentTrackIndex: -1, // Awalnya -1, tidak ada lagu yang dipilih
      transitionName: 'scale-out',
      lyrics: [],
      currentLyricIndex: -1,
      isPlaylistVisible: false,
    };
  },
  methods: {
    // --- (METODE LAINNYA TETAP SAMA) ---
    generateTime() { /* ... kode tidak berubah ... */ },
    updateBar(x) { /* ... kode tidak berubah ... */ },
    clickProgress(e) { /* ... kode tidak berubah ... */ },
    parseLRC(lrcContent) { /* ... kode tidak berubah ... */ },
    updateLyrics() { /* ... kode tidak berubah ... */ },
    favorite() {
      if (this.currentTrack) {
        this.tracks[this.currentTrackIndex].favorited = !this.tracks[this.currentTrackIndex].favorited;
      }
    },
    async loadLyrics(trackSource) { /* ... kode tidak berubah ... */ },
    
    // --- LOGIKA PEMUATAN YANG BARU ---

    // Metode utama untuk memuat dan memutar lagu berdasarkan indeksnya
    async loadAndPlayTrack(index) {
      // Jika lagu yang sama diklik saat sedang loading, jangan lakukan apa-apa
      if (this.isMetadataLoading) return;

      // Hentikan lagu yang sedang berjalan jika ada
      this.audio.pause();
      this.isTimerPlaying = false;
      this.isMetadataLoading = true;
      
      this.currentTrackIndex = index;
      const trackToLoad = this.tracks[index];

      // Periksa apakah metadata sudah dimuat sebelumnya
      if (!trackToLoad.isLoaded) {
        // Jika belum, ambil metadata
        const metadata = await this.fetchSingleTrackMetadata(trackToLoad.source);
        // Perbarui data lagu di dalam array tracks
        this.tracks[index] = { ...trackToLoad, ...metadata, isLoaded: true };
      }

      // Perbarui lagu saat ini dan mulai pemutaran
      this.currentTrack = this.tracks[index];
      this.resetPlayerAndPlay();
      this.isMetadataLoading = false;
    },
    
    // Tombol putar utama
    play() {
      // Jika belum ada lagu yang pernah diputar, putar lagu pertama
      if (this.currentTrackIndex === -1) {
        this.loadAndPlayTrack(0);
        return;
      }
      // Jika ada lagu yang sedang dijeda, lanjutkan
      if (this.audio.paused) {
        this.audio.play();
        this.isTimerPlaying = true;
      } else {
        // Jika sedang berjalan, jeda
        this.audio.pause();
        this.isTimerPlaying = false;
      }
    },

    // Tombol Sebelumnya & Berikutnya
    prevTrack() {
      if (this.tracks.length === 0) return;
      const newIndex = this.currentTrackIndex > 0 ? this.currentTrackIndex - 1 : this.tracks.length - 1;
      this.transitionName = 'scale-in';
      this.loadAndPlayTrack(newIndex);
    },
    nextTrack() {
      if (this.tracks.length === 0) return;
      const newIndex = this.currentTrackIndex < this.tracks.length - 1 ? this.currentTrackIndex + 1 : 0;
      this.transitionName = 'scale-out';
      this.loadAndPlayTrack(newIndex);
    },

    // Saat memilih lagu dari daftar putar
    selectTrack(index) {
      this.isPlaylistVisible = false;
      if (this.currentTrackIndex === index) return;
      this.loadAndPlayTrack(index);
    },

    // Membantu mereset state dan memulai pemutaran
    resetPlayerAndPlay() {
      this.barWidth = '0%';
      this.audio.currentTime = 0;
      this.audio.src = this.currentTrack.source;
      this.loadLyrics(this.currentTrack.source);
      
      // Menggunakan event 'canplay' untuk memastikan file audio siap sebelum diputar
      this.audio.oncanplay = () => {
        this.audio.play();
        this.isTimerPlaying = true;
        this.audio.oncanplay = null; // Hapus listener agar tidak berjalan lagi
      };
    },

    // Fungsi pembantu untuk mengambil metadata satu lagu (tidak berubah)
    async fetchSingleTrackMetadata(sourcePath) {
       // ... (kode ini tetap sama persis seperti versi sebelumnya)
    },
  },
  created() {
    // Inisialisasi audio object
    this.audio = new Audio();
    this.audio.ontimeupdate = () => this.generateTime();
    this.audio.onloadedmetadata = () => this.generateTime();
    this.audio.onended = () => this.nextTrack();

    // Buat daftar putar awal dengan data placeholder
    this.tracks = this.sources.map(source => ({
      name: source.split('/').pop().replace(/\.\w+$/, ''), // Tampilkan nama file tanpa ekstensi
      artist: 'Loading...',
      cover: '/img/default-cover.png',
      source: source,
      url: '#',
      favorited: false,
      isLoaded: false, // Tandai bahwa metadata belum dimuat
    }));
  },
};
</script>

<style scoped>
/* ... (gaya scoped tetap sama) ... */
.loading-indicator {
  color: #71829e;
  font-size: 20px;
  text-align: center;
  padding: 50px;
}
.player__top {
    /* Menambahkan beberapa gaya untuk tata letak baru */
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%; /* Pastikan elemen ini memenuhi lebar */
}
</style>


