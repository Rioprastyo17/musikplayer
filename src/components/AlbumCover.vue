<template>
  <div class="player-cover">
    <!-- 
      Transition-group masih digunakan untuk animasi.
      Sekarang kita hanya merender SATU elemen div di dalamnya.
      'key' yang unik akan memberitahu Vue kapan harus menjalankan animasi transisi.
    -->
    <transition-group :name="transitionName">
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
    // Computed property untuk mendapatkan URL sampul saat ini dengan aman.
    // Ini lebih baik daripada logika kompleks di dalam template.
    currentCover() {
      return this.tracks[this.currentTrackIndex]
        ? this.tracks[this.currentTrackIndex].cover
        : '/img/default-cover.png';
    },
  },
};
</script>

