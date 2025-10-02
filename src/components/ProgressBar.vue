<template>
  <div class="progress">
    <div class="progress__top">
      <div class="album-info" v-if="currentTrack">
        <div class="album-info__name">{{ currentTrack.artist }}</div>
        <div class="album-info__track">{{ currentTrack.name }}</div>
      </div>
      <div class="progress__duration">{{ duration }}</div>
    </div>

    <div
      class="progress__bar"
      ref="progress"
      @click="$emit('progress-clicked', $event)"
    >
      <div class="progress__current" :style="{ width: barWidth }"></div>
    </div>

    <div class="progress__time">{{ currentTime }}</div>
  </div>
</template>

<script>
export default {
  // Komponen ini menerima semua data yang dibutuhkannya dari App.vue
  props: {
    // Durasi total lagu (contoh: "03:45")
    duration: {
      type: String,
      default: '00:00',
    },
    // Waktu pemutaran saat ini (contoh: "01:23")
    currentTime: {
      type: String,
      default: '00:00',
    },
    // Lebar progress bar dalam persen (contoh: "45%")
    barWidth: {
      type: String,
      default: '0%',
    },
    // Objek lagu yang sedang diputar untuk menampilkan info artis/judul
    currentTrack: {
      type: Object,
      required: true,
    },
  },
};
</script>
