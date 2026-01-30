<template>
  <v-card :width="width" class="game-card rounded-xl position-relative" border elevation="0" v-bind="$attrs">
    <v-img :src="item.coverImage || item.thumbnails?.cover" :aspect-ratio="2 / 3" cover
      class="bg-surface-variant align-end">
      <template v-slot:placeholder>
        <div class="d-flex align-center justify-center fill-height">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
      </template>

      <div class="card-overlay pa-3">
        <div class="text-subtitle-1 font-weight-bold text-white text-truncate">
          {{ item.title }}
        </div>
        <div class="d-flex align-center justify-space-between mt-1">
          <v-chip size="x-small" color="primary" label class="font-weight-bold">
            {{ item.genre || "RPG" }}
          </v-chip>
          <span class="text-caption text-grey-lighten-2" v-if="item.rating">
            <v-icon size="x-small" color="amber" start>star</v-icon>{{ item.rating }}
          </span>
        </div>
      </div>
    </v-img>
  </v-card>
</template>

<script setup lang="ts">
defineProps({
  item: { type: Object, required: true },
  width: { type: [String, Number], default: 200 },
});
</script>

<style scoped>
.game-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  overflow: hidden;
  cursor: pointer;
}

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.card-overlay {
  background: linear-gradient(to top,
      rgba(0, 0, 0, 0.9) 10%,
      rgba(0, 0, 0, 0.4) 50%,
      transparent 100%);
  width: 100%;
}
</style>
