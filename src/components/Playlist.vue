<template>
  <transition name="fade">
    <div class="playlist-overlay" @click.self="$emit('close')">
      <div class="playlist">
        <h3>Daftar Putar</h3>

        <!-- KOLOM PENCARIAN BARU -->
        <div class="search-container">
          <input
            type="text"
            v-model="searchQuery"
            class="search-input"
            placeholder="Cari lagu atau artis..."
          />
        </div>

        <!-- DAFTAR LAGU -->
        <ul v-if="filteredTracks.length > 0">
          <!-- 
            Loop sekarang menggunakan 'filteredTracks' dari computed property.
            Kita mengambil 'track' dan 'originalIndex' dari setiap item.
           -->
          <li
            v-for="{ track, originalIndex } in filteredTracks"
            :key="track.source"
            :class="{ playing: originalIndex === currentTrackIndex }"
            @click="$emit('track-selected', originalIndex)"
          >
            <img :src="track.cover" class="playlist-cover" alt="cover" />
            <div class="playlist-info">
              <span class="playlist-title">{{ track.name }}</span>
              <span class="playlist-artist">{{ track.artist }}</span>
            </div>
          </li>
        </ul>

        <!-- Tampilan jika tidak ada hasil pencarian -->
        <div v-else class="no-results">
          <p>Tidak ada lagu yang cocok dengan pencarian Anda.</p>
        </div>

        <button @click="$emit('close')" class="close-btn">Tutup</button>
      </div>
    </div>
  </transition>
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
  },
  // 'data' untuk menyimpan state internal komponen
  data() {
    return {
      searchQuery: '', // State untuk menyimpan teks pencarian
    };
  },
  computed: {
    // Computed property untuk memfilter daftar lagu
    filteredTracks() {
      // Jika tidak ada teks pencarian, tampilkan semua lagu
      if (!this.searchQuery) {
        // Kita map untuk menambahkan 'originalIndex' agar App.vue tahu lagu mana yang dipilih
        return this.tracks.map((track, index) => ({
          track,
          originalIndex: index,
        }));
      }

      // Jika ada teks pencarian, lakukan filter
      const query = this.searchQuery.toLowerCase();
      return this.tracks
        .map((track, index) => ({ track, originalIndex: index })) // Tambahkan originalIndex
        .filter(({ track }) => {
          const titleMatch = track.name.toLowerCase().includes(query);
          const artistMatch = track.artist.toLowerCase().includes(query);
          return titleMatch || artistMatch;
        });
    },
  },
};
</script>

<style scoped>
/* Gaya untuk transisi fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ... (Gaya untuk .playlist-overlay, .playlist, .playlist li, dll tetap sama) ... */
.playlist-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 20px;
}
.playlist {
  background: #eef3f7;
  padding: 20px;
  border-radius: 15px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex; /* Menggunakan flexbox untuk layout */
  flex-direction: column; /* Arah vertikal */
}

/* GAYA BARU UNTUK INPUT PENCARIAN */
.search-container {
  margin-bottom: 15px;
}
.search-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #dfe7ef;
  border-radius: 8px;
  font-family: 'Bitter', serif;
  font-size: 16px;
}
.search-input:focus {
  outline: none;
  border-color: #acb8cc;
  box-shadow: 0 0 0 2px rgba(172, 184, 204, 0.5);
}

.playlist h3 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}
.playlist ul {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1; /* Biarkan daftar lagu mengisi ruang yang tersedia */
  overflow-y: auto; /* Scroll jika perlu */
}
.playlist li {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #dfe7ef;
}
.playlist li:last-child {
  border-bottom: none;
}
.playlist li:hover {
  background-color: #dfe7ef;
}
.playlist li.playing {
  background-color: #d0d8e6;
}
.playlist li.playing .playlist-title {
  color: #532ab9;
  font-weight: bold;
}
.playlist-cover {
  width: 45px;
  height: 45px;
  border-radius: 6px;
  margin-right: 15px;
  object-fit: cover;
  flex-shrink: 0;
}
.playlist-info {
  display: flex;
  flex-direction: column;
}
.playlist-title {
  font-size: 16px;
  color: #333;
}
.playlist-artist {
  font-size: 14px;
  color: #777;
}

/* GAYA BARU UNTUK PESAN "TIDAK ADA HASIL" */
.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #777;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn {
  display: block;
  width: 100%;
  margin-top: 20px;
  padding: 12px 20px;
  border: none;
  background: #acb8cc;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-family: 'Bitter', serif;
  font-size: 16px;
  flex-shrink: 0;
}
.close-btn:hover {
  background: #98a5bf;
}
</style>

