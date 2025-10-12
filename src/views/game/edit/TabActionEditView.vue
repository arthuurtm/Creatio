<template>
  <main class="editor-main">
    <div class="editor-container">
      <!-- Cabeçalho -->
      <div class="editor-header">
        <h2>Event Details</h2>
        <p>Manage the details of the selected event.</p>
      </div>

      <div class="editor-sections">
        <!-- Seções -->
        <EventSection
          title="Actions"
          icon="play_arrow"
          addLabel="Add Action"
          :items="actions"
          @add="() => emit('add-action')"
          @edit="(item) => emit('edit-action', item)"
        />

        <EventSection
          title="Choices"
          icon="rule"
          addLabel="Add Choice"
          :items="choices"
          @add="() => emit('add-choice')"
          @edit="(item) => emit('edit-choice', item)"
        />

        <EventSection
          title="Conditions"
          icon="check_box"
          addLabel="Add Condition"
          :items="conditions"
          @add="() => emit('add-condition')"
          @edit="(item) => emit('edit-condition', item)"
        />

        <EventSection
          title="Consequences"
          icon="flag"
          addLabel="Add Consequence"
          :items="consequences"
          @add="() => emit('add-consequence')"
          @edit="(item) => emit('edit-consequence', item)"
        />
      </div>
    </div>
  </main>
</template>

<script setup>
const props = defineProps({
  store: { type: Object, default: () => ({}) },
})

const emit = defineEmits([
  'add-action',
  'edit-action',
  'add-choice',
  'edit-choice',
  'add-condition',
  'edit-condition',
  'add-consequence',
  'edit-consequence',
])
</script>

<style scoped>
.editor-main {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: var(--background);
}

.editor-container {
  max-width: 900px;
  margin: 0 auto;
}

.editor-header {
  margin-bottom: 2rem;
}
.editor-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
}
.editor-header p {
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.editor-sections {
  display: grid;
  gap: 2rem;
}
</style>
