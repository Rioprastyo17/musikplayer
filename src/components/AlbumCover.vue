<template>
  <div class="player-cover">
    <transition-group :name="transitionName">
      <div
        class="player-cover__item"
        :key="currentCover"
        :style="{ backgroundImage: `url(${currentCover})` }"
      >
        <!-- Tampilkan overlay spinner jika metadata sedang dimuat -->
        <div class="loading-spinner-overlay" v-if="isMetadataLoading">
          <div class="spinner"></div>
        </div>
      </div>
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
    // Prop baru untuk mengetahui status loading
    isMetadataLoading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    currentCover() {
      // Jika belum ada lagu yang dipilih atau tracks masih kosong, tampilkan gambar default
      if (this.currentTrackIndex === -1 || !this.tracks[this.currentTrackIndex]) {
        return '/img/default-cover.png';
      }
      return this.tracks[this.currentTrackIndex].cover;
    },
  },
};
</script>

<style scoped>
/* Gaya untuk overlay dan spinner */
.loading-spinner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(238, 243, 247, 0.7); /* Warna senada dengan background player */
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 15px;
  z-index: 5;
  backdrop-filter: blur(2px);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #532ab9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>


