<template>
  <div class="lyrics-container">
    <div class="lyrics-scroll" v-if="lyrics && lyrics.length > 0">
      <p
        v-for="(line, index) in lyrics"
        :key="index"
        :class="{ active: index === currentLyricIndex }"
        ref="lyricLines"
      >
        {{ line.text || '&nbsp;' }}
      </p>
    </div>
    <div class="no-lyrics" v-else>
      <p>Lirik tidak tersedia.</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    // Array lirik, setiap objek berisi { time, text }
    lyrics: {
      type: Array,
      default: () => [],
    },
    // Indeks dari baris lirik yang sedang aktif
    currentLyricIndex: {
      type: Number,
      default: -1,
    },
  },
  watch: {
    // 'watch' akan memantau perubahan pada prop 'currentLyricIndex'
    currentLyricIndex(newIndex) {
      // Jika indeks valid dan elemen DOM sudah ada
      if (
        newIndex >= 0 &&
        this.$refs.lyricLines &&
        this.$refs.lyricLines[newIndex]
      ) {
        // Gunakan API browser 'scrollIntoView' untuk menggulir elemen
        // yang aktif ke tengah-tengah container.
        this.$refs.lyricLines[newIndex].scrollIntoView({
          behavior: 'smooth', // Animasi gulir yang mulus
          block: 'center', // Posisikan di tengah secara vertikal
        });
      }
    },
  },
};
</script>

<style scoped>
/* 'scoped' berarti gaya ini hanya akan berlaku untuk komponen ini saja
  dan tidak akan bocor ke komponen lain.
*/
.lyrics-container {
  /* Atur tinggi container agar pas di layout mobile */
  height: 54px;
  overflow: hidden;
  text-align: center;
  color: #71829e;
  margin-top: 20px;
  position: relative;
}

/* Tambahkan efek gradien di atas dan bawah untuk menyamarkan tepi */
.lyrics-container::before,
.lyrics-container::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 15px;
  z-index: 1;
}

.lyrics-container::before {
  top: 0;
  background: linear-gradient(to bottom, #eef3f7, transparent);
}

.lyrics-container::after {
  bottom: 0;
  background: linear-gradient(to top, #eef3f7, transparent);
}

.lyrics-scroll p {
  font-size: 16px;
  line-height: 1.5;
  padding: 2px 0;
  opacity: 0.5;
  transition: all 0.5s ease;
}

/* Gaya untuk baris lirik yang sedang aktif */
.lyrics-scroll p.active {
  font-weight: bold;
  opacity: 1;
  color: #532ab9;
  transform: scale(1.1);
}

.no-lyrics p {
  line-height: 54px; /* Pusatkan secara vertikal */
  opacity: 0.6;
}
</style>
