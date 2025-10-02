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
    // --- FUNGSI PEMBANTU YANG SEKARANG SUDAH LENGKAP ---
    generateTime() {
      if (isNaN(this.audio.duration)) return;
      let width = (100 / this.audio.duration) * this.audio.currentTime;
      this.barWidth = width + '%';
      let durmin = Math.floor(this.audio.duration / 60);
      let dursec = Math.floor(this.audio.duration - durmin * 60);
      let curmin = Math.floor(this.audio.currentTime / 60);
      let cursec = Math.floor(this.audio.currentTime - curmin * 60);
      if (durmin < 10) durmin = '0' + durmin;
      if (dursec < 10) dursec = '0' + dursec;
      if (curmin < 10) curmin = '0' + curmin;
      if (cursec < 10) cursec = '0' + cursec;
      this.duration = durmin + ':' + dursec;
      this.currentTime = curmin + ':' + cursec;
    },
    updateBar(x) {
      let progress = this.$refs.progressBar.$refs.progress;
      if (!progress || !this.currentTrack) return;
      let maxduration = this.audio.duration;
      let position = x - progress.getBoundingClientRect().left;
      let percentage = (100 * position) / progress.offsetWidth;
      if (percentage > 100) percentage = 100;
      if (percentage < 0) percentage = 0;
      this.barWidth = percentage + '%';
      this.audio.currentTime = (maxduration * percentage) / 100;
    },
    clickProgress(e) {
      if (!this.currentTrack) { // Jika belum ada lagu, mainkan yang pertama
        this.loadAndPlayTrack(0);
        // Kita perlu sedikit penundaan sebelum update bar karena durasi belum siap
        setTimeout(() => this.updateBar(e.pageX), 500);
        return;
      }
      this.updateBar(e.pageX);
      this.audio.play();
      this.isTimerPlaying = true;
    },
    parseLRC(lrcContent) {
      this.lyrics = [];
      const lines = lrcContent.split('\n');
      const regex = /\[(\d{2}):(\d{2})[.:](\d{2,3})\](.*)/;
      for (const line of lines) {
        const match = line.match(regex);
        if (match) {
          const minutes = parseInt(match[1], 10);
          const seconds = parseInt(match[2], 10);
          const milliseconds = parseInt(match[3].padEnd(3, '0'), 10);
          const time = minutes * 60 + seconds + milliseconds / 1000;
          const text = match[4].trim().replace(/"/g, '');
          if (text) {
            this.lyrics.push({ time, text });
          }
        }
      }
    },
    updateLyrics() {
      if (!this.lyrics.length) return;
      let newIndex = this.lyrics.findIndex((lyric, index) => {
        const nextLyric = this.lyrics[index + 1];
        return this.audio.currentTime >= lyric.time && (!nextLyric || this.audio.currentTime < nextLyric.time);
      });
      if (newIndex !== -1) {
        this.currentLyricIndex = newIndex;
      }
    },
    favorite() {
      if (this.currentTrack) {
        this.tracks[this.currentTrackIndex].favorited = !this.tracks[this.currentTrackIndex].favorited;
      }
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
    
    // --- LOGIKA PEMUATAN ---
    async loadAndPlayTrack(index) {
      if (this.isMetadataLoading) return;
      this.audio.pause();
      this.isTimerPlaying = false;
      this.isMetadataLoading = true;
      
      // Tetapkan placeholder sebagai lagu saat ini agar UI tidak kosong saat loading
      this.currentTrackIndex = index;
      this.currentTrack = this.tracks[index];

      const trackToLoad = this.tracks[index];
      if (!trackToLoad.isLoaded) {
        const metadata = await this.fetchSingleTrackMetadata(trackToLoad.source);
        // Perbarui data lagu di dalam array tracks secara reaktif
        this.tracks[index] = { ...trackToLoad, ...metadata, isLoaded: true };
      }
      // Perbarui lagi lagu saat ini dengan metadata yang sudah lengkap
      this.currentTrack = this.tracks[index];
      this.resetPlayerAndPlay();
    },
    
    play() {
      if (this.currentTrackIndex === -1) {
        this.loadAndPlayTrack(0);
        return;
      }
      if (this.audio.paused) {
        this.audio.play();
        this.isTimerPlaying = true;
      } else {
        this.audio.pause();
        this.isTimerPlaying = false;
      }
    },

    prevTrack() {
      if (this.tracks.length <= 1) return;
      const newIndex = this.currentTrackIndex > 0 ? this.currentTrackIndex - 1 : this.tracks.length - 1;
      this.transitionName = 'scale-in';
      this.loadAndPlayTrack(newIndex);
    },
    nextTrack() {
      if (this.tracks.length <= 1) return;
      const newIndex = this.currentTrackIndex < this.tracks.length - 1 ? this.currentTrackIndex + 1 : 0;
      this.transitionName = 'scale-out';
      this.loadAndPlayTrack(newIndex);
    },

    selectTrack(index) {
      this.isPlaylistVisible = false;
      if (this.currentTrackIndex === index) return;
      this.loadAndPlayTrack(index);
    },

    resetPlayerAndPlay() {
      this.barWidth = '0%';
      this.audio.currentTime = 0;
      this.audio.src = this.currentTrack.source;
      this.loadLyrics(this.currentTrack.source);
      
      this.audio.oncanplay = () => {
        this.audio.play();
        this.isTimerPlaying = true;
        this.isMetadataLoading = false;
        this.audio.oncanplay = null;
      };
      // Fallback jika 'oncanplay' tidak terpicu
      this.audio.load();
    },

    async fetchSingleTrackMetadata(sourcePath) {
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
        };
      } catch (error) {
        console.error(`Gagal membaca metadata untuk ${sourcePath}:`, error);
        return {
          name: sourcePath.split('/').pop(),
          artist: 'Error Loading Metadata',
          cover: '/img/default-cover.png',
        };
      }
    },
  },
  created() {
    this.audio = new Audio();
    this.audio.ontimeupdate = () => { this.generateTime(); this.updateLyrics(); };
    this.audio.onloadedmetadata = () => this.generateTime();
    this.audio.onended = () => this.nextTrack();

    this.tracks = this.sources.map(source => ({
      name: source.split('/').pop().replace(/\.\w+$/, ''),
      artist: 'Loading...',
      cover: '/img/default-cover.png',
      source: source,
      url: '#',
      favorited: false,
      isLoaded: false,
    }));
    
    // Jangan pilih lagu apa pun saat awal
    this.currentTrack = null;
    this.currentTrackIndex = -1;
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


