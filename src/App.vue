<template>
  <div class="wrapper">
    <!-- Tampilkan loading saat metadata sedang diekstrak -->
    <div v-if="isLoading" class="loading-indicator">
      <p>Memuat lagu...</p>
    </div>

    <!-- Tampilkan pemutar setelah lagu berhasil dimuat -->
    <div class="player" v-else-if="tracks.length > 0">
      <div class="player__top">
        <AlbumCover
          :tracks="tracks"
          :current-track-index="currentTrackIndex"
          :transition-name="transitionName"
        />
        <LyricsDisplay
          :lyrics="lyrics"
          :current-lyric-index="currentLyricIndex"
        />
        <PlayerControls
          :is-playing="isTimerPlaying"
          :is-favorited="currentTrack.favorited"
          :track-url="currentTrack.url"
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

    <!-- Tampilkan pesan error jika tidak ada lagu yang bisa dimuat -->
    <div v-else class="loading-indicator">
      <p>Gagal memuat lagu. Pastikan file musik ada di folder `public/mp3`.</p>
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
      isLoading: true,
      // KEMBALI MENGGUNAKAN DAFTAR MANUAL
      // GANTI DENGAN NAMA FILE ANDA YANG SEBENARNYA
      sources: [
        '/mp3/01 - Ada Band - Surga Cinta.flac',
        '/mp3/03 - Ada Band - Karena Wanita (Ingin Dimengerti).flac',
        // Tambahkan semua file musik Anda yang lain di sini
      ],
      tracks: [],
      currentTrack: {},
      currentTrackIndex: 0,
      transitionName: 'scale-out',
      lyrics: [],
      currentLyricIndex: -1,
      isPlaylistVisible: false,
    };
  },
  methods: {
    // ... (SEMUA METODE LAINNYA TIDAK PERLU DIUBAH)
    // Cukup pastikan semua metode dari versi sebelumnya ada di sini:
    // play, prevTrack, nextTrack, resetPlayer, favorite, generateTime, updateBar,
    // clickProgress, loadTracksMetadata, parseLRC, loadLyrics, updateLyrics, selectTrack
    async loadTracksMetadata() {
      let trackPromises = this.sources.map(async (sourcePath) => {
        try {
          const metadata = await mm.fetchFromUrl(sourcePath);
          const tags = metadata.common;
          let coverUrl = '/img/default-cover.png';
          if (tags.picture && tags.picture.length > 0) {
            const picture = tags.picture[0];
            const blob = new Blob([picture.data], { type: picture.format });
            coverUrl = URL.createObjectURL(blob);
          }
          return {
            name: tags.title || sourcePath.split('/').pop(),
            artist: tags.artist || 'Unknown Artist',
            cover: coverUrl,
            source: sourcePath,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(tags.artist || '')}+${encodeURIComponent(tags.title || '')}`,
            favorited: false,
          };
        } catch (error) {
          console.error(`Gagal membaca metadata untuk ${sourcePath}:`, error);
          return {
            name: sourcePath.split('/').pop(),
            artist: 'Unknown Artist',
            cover: '/img/default-cover.png',
            source: sourcePath,
            url: '#',
            favorited: false,
          };
        }
      });
      this.tracks = await Promise.all(trackPromises);
      if (this.tracks.length > 0) {
        this.currentTrack = this.tracks[0];
        this.audio.src = this.currentTrack.source;
        this.loadLyrics(this.currentTrack.source);
      }
      this.isLoading = false;
    },
    async loadLyrics(trackSource) {
      this.lyrics = [];
      this.currentLyricIndex = -1;
      const lrcPath = trackSource.substring(0, trackSource.lastIndexOf('.')) + '.lrc';
      try {
        const response = await fetch(lrcPath);
        if (!response.ok) throw new Error('LRC file not found');
        const lrcContent = await response.text();
        this.parseLRC(lrcContent);
      } catch (error) {
        console.warn(`File lirik tidak ditemukan untuk: ${lrcPath}`);
      }
    },
    // ... dan semua metode lainnya
  },
  created() {
    this.audio = new Audio();
    this.loadTracksMetadata();
    this.audio.ontimeupdate = () => {
      this.generateTime();
      this.updateLyrics();
    };
    this.audio.onloadedmetadata = () => this.generateTime();
    this.audio.onended = () => this.nextTrack();
  },
};
</script>

<style scoped>
/* ... (gaya scoped tetap sama) ... */
</style>
```

#### Langkah 3: Commit dan Push Perubahan Final

1.  Jalankan `git status` di terminal untuk melihat perubahannya.
2.  Tambahkan semua perubahan:
    ```bash
    git add .
    ```
3.  Buat commit:
    ```bash
    git commit -m "Final Fix: Pindahkan aset ke public untuk build produksi"
    ```
4.  Push ke GitHub:
    ```bash
    git push origin master
    


