<template>
  <div class="wrapper">
    <!-- Tampilkan pemutar musik secara langsung -->
    <div class="player">
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

    <!-- Komponen Playlist -->
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
import AlbumCover from './components/AlbumCover.vue';
import PlayerControls from './components/PlayerControls.vue';
import ProgressBar from './components/ProgressBar.vue';
import LyricsDisplay from './components/LyricsDisplay.vue';
import Playlist from './components/Playlist.vue';

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
      // --- DATA LAGU MANUAL (LEBIH CEPAT & ANDAL) ---
      // Ganti dengan data lagu Anda yang sebenarnya.
      tracks: [
        {
          name: "Surga Cinta",
          artist: "Ada Band",
          cover: "/img/album-art-1.jpg", // Ganti dengan path gambar Anda di folder public/img
          source: "/mp3/01 - Ada Band - Surga Cinta.flac",
          url: "https://www.youtube.com/watch?v=...",
          favorited: true
        },
        {
          name: "Karena Wanita (Ingin Dimengerti)",
          artist: "Ada Band",
          cover: "/img/album-art-2.jpg",
          source: "/mp3/03 - Ada Band - Karena Wanita (Ingin Dimengerti).flac",
          url: "https://www.youtube.com/watch?v=...",
          favorited: false
        },
        // Tambahkan lagu-lagu lain di sini
      ],
      currentTrack: null,
      currentTrackIndex: 0, // Mulai dari lagu pertama
      transitionName: 'scale-out',
      lyrics: [],
      currentLyricIndex: -1,
      isPlaylistVisible: false,
    };
  },
  methods: {
    // --- SEMUA FUNGSI PEMBANTU YANG LENGKAP ---
    play() {
      if (this.audio.paused) {
        this.audio.play();
        this.isTimerPlaying = true;
      } else {
        this.audio.pause();
        this.isTimerPlaying = false;
      }
    },
    prevTrack() {
      this.transitionName = 'scale-in';
      this.currentTrackIndex = this.currentTrackIndex > 0 ? this.currentTrackIndex - 1 : this.tracks.length - 1;
      this.selectTrack(this.currentTrackIndex);
    },
    nextTrack() {
      this.transitionName = 'scale-out';
      this.currentTrackIndex = this.currentTrackIndex < this.tracks.length - 1 ? this.currentTrackIndex + 1 : 0;
      this.selectTrack(this.currentTrackIndex);
    },
    selectTrack(index) {
      this.isPlaylistVisible = false;
      if (this.currentTrackIndex === index && !this.audio.paused) return; // Jangan lakukan apa-apa jika lagu yang sama sedang diputar

      this.currentTrackIndex = index;
      this.currentTrack = this.tracks[this.currentTrackIndex];
      this.audio.src = this.currentTrack.source;
      this.loadLyrics(this.currentTrack.source);

      this.audio.oncanplay = () => {
        this.audio.play();
        this.isTimerPlaying = true;
        this.audio.oncanplay = null;
      };
      this.audio.load(); // Memuat audio
    },
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
      if (!progress) return;
      let maxduration = this.audio.duration;
      let position = x - progress.getBoundingClientRect().left;
      let percentage = (100 * position) / progress.offsetWidth;
      if (percentage > 100) percentage = 100;
      if (percentage < 0) percentage = 0;
      this.barWidth = percentage + '%';
      this.audio.currentTime = (maxduration * percentage) / 100;
    },
    clickProgress(e) {
      if (!this.currentTrack) return; // Jangan lakukan apa-apa jika belum ada lagu
      this.updateBar(e.pageX);
      this.audio.play();
      this.isTimerPlaying = true;
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
  },
  created() {
    // Inisialisasi audio object
    this.audio = new Audio();
    this.audio.ontimeupdate = () => { this.generateTime(); this.updateLyrics(); };
    this.audio.onloadedmetadata = () => this.generateTime();
    this.audio.onended = () => this.nextTrack();

    // Siapkan lagu pertama, tetapi jangan langsung diputar
    if (this.tracks.length > 0) {
      this.currentTrack = this.tracks[this.currentTrackIndex];
      this.audio.src = this.currentTrack.source;
      this.loadLyrics(this.currentTrack.source);
    }
  },
};
</script>

<style scoped>
.player__top {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}
</style>


