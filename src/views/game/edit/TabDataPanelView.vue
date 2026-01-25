<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEditorStore, getSubCategories, categories, normalizeItems } from '@/stores/editor'
import {
  VBtn, VSelect, VTextField, VTextarea, VFileInput,
  VCard, VCardTitle, VCardText, VCardActions,
  VRow, VCol, VContainer, VDivider, VList, VListItem, VCheckbox, VSwitch, VRadioGroup,
  VDialog, VIcon, VChip
} from 'vuetify/components'
import type { CategoryKey } from '#types/domain/editor/config.ts'
import CButton from '#src/components/ui/CButton.vue'
import type { ComponentPublicInstance } from 'vue'
import ComponentQuickEditPanel from '#src/components/modules/ComponentQuickEditPanel.vue'
import type { EditorState } from '#types/domain/editor/models.ts'

type FormType =
  | 'text'
  | 'password'
  | 'email'
  | 'number'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'switch'
  | 'radio'
  | 'date'
  | 'time'
  | 'datetime'
  | 'file'
  | 'button'


// --- Interfaces ---
interface FormParam {
  key: string
  type: FormType
  model: any
  label?: string
  rules?: ((v: any) => boolean | string)[]
  options?: any[]
  icon?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  [key: string]: any
}


interface SubCategoryItem {
  text: string
  params?: FormParam[]
  execute?: (params: Record<string, any>) => void
}

type CButtonInstance = ComponentPublicInstance<typeof CButton> & {
  play: () => void
  pause: () => void
}

// --- Estado ---
const searchQuery = ref('')
const activeCategory = ref<CategoryKey | null>(null)
const formParams = ref<FormParam[]>([])
const isDialogOpen = ref(false)
const createItemExecuteFn = ref<((params: Record<string, any>) => void) | null>(null)
const btns = reactive<Array<CButtonInstance | null>>([])
const editorStore = useEditorStore()
const allExpanded = ref(false)

// Map de componentes para o formulário dinâmico
const inputParamMap: Record<FormType, any> = {
  text: VTextField,
  email: VTextField,
  password: VTextField,
  number: VTextField,
  textarea: VTextarea,
  select: VSelect,
  checkbox: VCheckbox,
  switch: VSwitch,
  radio: VRadioGroup,
  date: VTextField,
  time: VTextField,
  datetime: VTextField,
  file: VFileInput,
  button: VBtn,
}


// --- Computados ---
const activeCategoryDatabase = computed(() => {
  if (!activeCategory.value) return []
  return (editorStore.$state as EditorState)[activeCategory.value] || []
})

const activeCategoryConfig = computed(() =>
  activeCategory.value ? categories[activeCategory.value] : null
)

// --- Ações ---
function openCategory(key: CategoryKey) {
  activeCategory.value = key
}

function addButtonHandler(item: SubCategoryItem) {
  formParams.value = item.params ? JSON.parse(JSON.stringify(item.params)) : []
  createItemExecuteFn.value = item.execute ?? null
  if (formParams.value.length > 0) isDialogOpen.value = true
}

function handleCreate() {
  if (createItemExecuteFn.value) {
    const paramsObject = formParams.value.reduce((acc: Record<string, any>, param) => {
      acc[param.key] = param.model
      return acc
    }, {})

    paramsObject.text = paramsObject.name || paramsObject.label || 'Novo Item'
    createItemExecuteFn.value(paramsObject)
    isDialogOpen.value = false
  }
}
</script>

<template>
  <v-card class="floating-panel" elevation="0" variant="text">
    <v-row no-gutters class="fill-height pa-6 ga-3">
      <!-- Sidebar -->
      <v-col cols="auto" permanent border="right" class="d-flex">
        <v-list nav density="comfortable">
          <v-list-item v-for="(cat, key, i) in categories" :key="key" rounded="pill" :active="activeCategory === key"
            @click="openCategory(key as CategoryKey)" class="ga-2" variant="text" density="comfortable">
            <!--@mouseenter="btns[i]?.play()" @mouseleave="btns[i]?.pause()"-->
            <template #prepend>
              <c-button :ref="el => {
                if (el && '$' in el) btns[i] = el as CButtonInstance
                else btns[i] = null
              }" :icon="cat.value.icon" class="ma-0" variant="text" />
            </template>
            <v-list-item-title>{{ cat.value.text }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-col>

      <!-- Conteúdo principal -->
      <transition name="tab-anim">
        <v-col cols="4" v-if="activeCategory" class="tree-column border-right d-flex flex-column"
          style="height: 100%; overflow: hidden;">
          <v-toolbar density="compact" flat title="Explorador" class="flex-grow-0">
            <v-spacer />
            <v-btn icon variant="text" size="small" @click="allExpanded = !allExpanded"
              :title="allExpanded ? 'Recolher tudo' : 'Expandir tudo'">
              <v-icon :icon="allExpanded ? 'unfold_less' : 'unfold_more'" />
            </v-btn>
            <v-menu location="bottom end">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon="add_circle" variant="text" color="primary" title="Adicionar novo" />
              </template>
              <v-list density="comfortable" min-width="220" class="pa-2 border shadow-lg">
                <v-list-item v-for="(cat, idx) in Object.values(getSubCategories(activeCategory))" :key="idx"
                  :title="cat.text" :prepend-icon="cat.icon || 'add'" @click="addButtonHandler(cat)" rounded="lg"
                  class="mb-1" />
              </v-list>
            </v-menu>
            <!-- <v-select :items="" item-title="text" @update:model-value="addButtonHandler" variant="plain" hide-details
              class="symbolic no-padding" style="width: 40px">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon="add_circle" variant="text" color="primary" title="Adicionar novo" />
              </template>
            </v-select> -->
          </v-toolbar>

          <div class="flex-grow-1 overflow-y-auto pa-2" style="min-height: 0;">

            <v-menu>
              <v-list>
                <v-list-item v-for="(sub, idx) in getSubCategories(activeCategory)" :key="idx"
                  @click="addButtonHandler(sub)">
                  <v-list-item-title>{{ sub.text }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

            <v-card variant="flat">
              <ComponentQuickEditPanel :modelValue="editorStore[activeCategory]" :start-expanded="allExpanded"
                :label="activeCategoryConfig?.value.text" />
            </v-card>

          </div>
        </v-col>
      </transition>

      <!-- Dialog -->
      <v-dialog v-model="isDialogOpen" max-width="500">
        <v-card>
          <v-card-title>Criar Novo Objeto</v-card-title>
          <v-divider />
          <v-card-text class="pt-4">
            <v-col>
              <v-row v-for="(param, index) in formParams" :key="index">
                <component v-if="inputParamMap[param.type]" :is="inputParamMap[param.type]" v-model="param.model"
                  :items="normalizeItems(param)" :label="param.label" variant="outlined" density="comfortable" />
                <div v-else class="text-red">
                  ⚠ Erro ao carregar componente: "{{ param.type }}".
                </div>
              </v-row>
            </v-col>
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn text="Cancelar" variant="text" @click="isDialogOpen = false" />
            <v-btn color="primary" text="Criar" @click="handleCreate" />
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </v-card>
</template>

<style scoped>
.tab-anim-enter-active,
.tab-anim-leave-active {
  transition: transform 0.35s ease;
}

.tab-anim-enter-from {
  transform: translateX(0%);
}

.tab-anim-enter-to {
  transform: translateX(100%);
}

.tab-anim-leave-from {
  transform: translateX(100%);
}

.tab-anim-leave-to {
  transform: translateX(0%);
}
</style>
