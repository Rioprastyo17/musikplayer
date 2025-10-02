<template>
  <div class="player-cover">
    <transition-group :name="transitionName">
      <!-- 
        'key' yang unik berdasarkan path sampul akan memastikan
        Vue menjalankan animasi transisi setiap kali gambar berubah.
      -->
      <div
        class="player-cover__item"
        :key="currentCover"
        :style="{ backgroundImage: `url(${currentCover})` }"
      ></div>
    </transition-group>
  </div>
</template>

<script>
export default {
  props: {
    tracks: {
      type: Array,
      required: true,
    },
    currentTrackIndex: {
      type: Number,
      required: true,
    },
    transitionName: {
      type: String,
      default: 'scale-out',
    },
  },
  computed: {
    // Properti terkomputasi untuk mendapatkan URL sampul saat ini dengan aman.
    currentCover() {
      // Tampilkan sampul lagu saat ini, atau gambar default jika belum ada lagu.
      return this.tracks[this.currentTrackIndex]
        ? this.tracks[this.currentTrackIndex].cover
        : '/img/default-cover.png';
    },
  },
};
</script>

<style scoped>
/* Tidak ada gaya spesifik yang dibutuhkan di sini karena sudah diatur secara global. */
</style>


