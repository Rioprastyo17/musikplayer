<template>
  <div class="wrapper">
    <div v-if="isLoading" class="loading-indicator">
      <p>Memuat lagu...</p>
    </div>

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

    <div v-else class="loading-indicator">
      <p>Gagal memuat lagu. Pastikan file musik ada di folder `src/assets/mp3`.</p>
    </div>

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

// --- BAGIAN OTOMATISASI DIMULAI DI SINI ---
const musicFiles = import.meta.glob('/src/assets/mp3/*.{flac,wav,aif,mp3}');
const sources = Object.keys(musicFiles);
// --- BAGIAN OTOMATISASI SELESAI ---

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
      sources: sources,
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
    // --- KONTROL AUDIO ---
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
      this.currentTrackIndex =
        this.currentTrackIndex > 0
          ? this.currentTrackIndex - 1
          : this.tracks.length - 1;
      this.currentTrack = this.tracks[this.currentTrackIndex];
      this.resetPlayer();
    },
    nextTrack() {
      this.transitionName = 'scale-out';
      this.currentTrackIndex =
        this.currentTrackIndex < this.tracks.length - 1
          ? this.currentTrackIndex + 1
          : 0;
      this.currentTrack = this.tracks[this.currentTrackIndex];
      this.resetPlayer();
    },
    resetPlayer() {
      this.barWidth = '0%';
      this.audio.currentTime = 0;
      this.audio.src = this.currentTrack.source;
      this.loadLyrics(this.currentTrack.source);
      setTimeout(() => {
        if (this.isTimerPlaying) {
          this.audio.play();
        }
      }, 300);
    },
    favorite() {
      this.tracks[this.currentTrackIndex].favorited =
        !this.tracks[this.currentTrackIndex].favorited;
    },

    // --- PROGRESS BAR & WAKTU ---
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
      if (!this.isTimerPlaying) {
        this.isTimerPlaying = true;
      }
      this.updateBar(e.pageX);
      this.audio.play();
    },

    // --- METADATA & LIRIK ---
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
    parseLRC(lrcContent) {
      this.lyrics = [];
      const lines = lrcContent.split('\n');
      // Regex diperbarui untuk menangani format [mm:ss.xx] atau [mm:ss:xx]
      const regex = /\[(\d{2}):(\d{2})[.:](\d{2,3})\](.*)/;
      for (const line of lines) {
        const match = line.match(regex);
        if (match) {
          const minutes = parseInt(match[1], 10);
          const seconds = parseInt(match[2], 10);
          // Pastikan milidetik selalu 3 digit (misal .25 menjadi .250)
          const milliseconds = parseInt(match[3].padEnd(3, '0'), 10);
          const time = minutes * 60 + seconds + milliseconds / 1000;
          // Hapus tanda kutip dari teks lirik
          const text = match[4].trim().replace(/"/g, ''); 
          if (text) {
             this.lyrics.push({ time, text });
          }
        }
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
    
    // --- PLAYLIST ---
    selectTrack(index) {
      if (this.currentTrackIndex === index) {
        this.isPlaylistVisible = false;
        return;
      }
      this.currentTrackIndex = index;
      this.currentTrack = this.tracks[this.currentTrackIndex];
      this.resetPlayer();
      this.isPlaylistVisible = false;
    },
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
```eof
