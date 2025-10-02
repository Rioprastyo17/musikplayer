<template>
  <div class="player-controls">
    <div
      class="player-controls__item -favorite"
      :class="{ active: isFavorited }"
      @click="$emit('favorite')"
    >
      <svg class="icon"><use xlink:href="/icons.svg#icon-heart-o"></use></svg>
    </div>

    <div class="player-controls__item" @click="$emit('toggle-playlist')">
      <svg class="icon"><use xlink:href="/icons.svg#icon-playlist"></use></svg>
    </div>

    <div class="player-controls__item" @click="$emit('prev')">
      <svg class="icon"><use xlink:href="/icons.svg#icon-prev"></use></svg>
    </div>

    <div class="player-controls__item -xl js-play" @click="$emit('play')">
      <svg class="icon">
        <use
          :xlink:href="
            isPlaying ? '/icons.svg#icon-pause' : '/icons.svg#icon-play'
          "
        ></use>
      </svg>
    </div>

    <div class="player-controls__item" @click="$emit('next')">
      <svg class="icon"><use xlink:href="/icons.svg#icon-next"></use></svg>
    </div>

    <a :href="trackUrl" target="_blank" class="player-controls__item">
      <svg class="icon"><use xlink:href="/icons.svg#icon-link"></use></svg>
    </a>
  </div>
</template>

<script>
export default {
  props: {
    // Menerima status putar/jeda dari App.vue
    isPlaying: {
      type: Boolean,
      default: false,
    },
    // Menerima status favorit dari App.vue
    isFavorited: {
      type: Boolean,
      default: false,
    },
    // Menerima URL lagu saat ini
    trackUrl: {
      type: String,
      default: '#',
    },
  },
};
</script>
