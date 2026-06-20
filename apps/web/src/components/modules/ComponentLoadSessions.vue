<template>
  <div class="project-list-loader">
    <v-slide-group v-if="!isGridMode" v-model="model" class="py-4" selected-class="bg-primary" show-arrows>
      <template v-slot:next>
        <v-btn icon="arrow_forward_ios" variant="text" density="comfortable"></v-btn>
      </template>
      <template v-slot:prev>
        <v-btn icon="arrow_back_ios" variant="text" density="comfortable"></v-btn>
      </template>

      <v-slide-group-item v-for="(card, index) in items" :key="index">
        <div class="ma-2">
          <ProjectCard :item="card" :width="cardWidth" @click="emitAction(card)" />
        </div>
      </v-slide-group-item>
    </v-slide-group>

    <v-row v-else class="mt-2">
      <v-col v-for="(card, index) in items" :key="index" cols="12" sm="6" md="4" lg="3">
        <ProjectCard :item="card" width="100%" @click="emitAction(card)" />
      </v-col>
    </v-row>

    <div v-if="items.length === 0" class="text-center py-10 text-medium-emphasis">
      <v-icon size="large" class="mb-2">folder_off</v-icon>
      <p>Nenhum código encontrado nesta seção.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import ProjectCard from "@/components/ui/ProjectCard.vue";

const props = defineProps({
  items: { type: Object, required: true },
  styleType: { type: String, default: "line" },
  cardsType: { type: String },
});

const emits = defineEmits(["emitEvent"]);
const model = ref(null);

const gridModes = ["grade", "spaced", "library"];

const isGridMode = computed(() => gridModes.includes(props.styleType));

const cardWidth = computed(() => {
  if (props.cardsType === "reduced") return 220;
  if (props.cardsType === "large") return 320;
  return 280; // Projetos de código precisam de um pouco mais de largura para títulos e dados
});

function emitAction(card: any) {
  if (card.action && typeof card.action === "function") {
    card.action();
  } else {
    emits("emitEvent", { id: card.id, type: "open" });
  }
}
</script>
