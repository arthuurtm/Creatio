<template>
  <component :is="tag" class="c-group" :style="groupStyles">
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue'

/**
 * @typedef {'div' | 'span' | 'fieldset' | 'ul' | 'li' | 'label'} CGroupTag
 * @typedef {'row' | 'column'} CGroupDirection
 * @typedef {'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'} CGroupJustify
 * @typedef {'start' | 'center' | 'end' | 'stretch' | 'baseline'} CGroupAlign
 */

const props = defineProps({
  /**
   * @type {import('vue').PropType<CGroupTag>}
   * A tag HTML a ser renderizada (div, span, fieldset, etc.)
   */
  tag: {
    type: String,
    default: 'div',
  },
  /**
   * @type {import('vue').PropType<CGroupDirection>}
   * A direção do flex (row = horizontal, column = vertical)
   */
  direction: {
    type: String,
    default: 'row',
  },
  /**
   * @type {import('vue').PropType<CGroupJustify>}
   * Alinhamento no eixo principal (justify-content)
   */
  justify: {
    type: String,
    default: 'start',
  },
  /**
   * @type {import('vue').PropType<CGroupAlign>}
   * Alinhamento no eixo cruzado (align-items)
   */
  align: {
    type: String,
    default: 'stretch',
  },
  /**
   * Espaçamento entre os elementos (ex: "1rem", "8px", "var(--spacing-md)")
   */
  gap: {
    type: String,
    default: null,
  },
  /**
   * Permite que os itens quebrem para a próxima linha
   */
  wrap: {
    type: Boolean,
    default: false,
  },
  /**
   * Usa 'display: inline-flex' em vez de 'display: flex'
   */
  inline: {
    type: Boolean,
    default: false,
  },
  /**
   * Faz o grupo crescer para preencher o espaço (flex-grow: 1)
   */
  grow: {
    type: Boolean,
    default: false,
  },
})

function mapearJustify(val) {
  const map = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
  }
  return map[val] || map.start
}

function mapearAlign(val) {
  const map = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
    baseline: 'baseline',
  }
  return map[val] || map.stretch
}

const groupStyles = computed(() => {
  const styles = {
    display: props.inline ? 'inline-flex' : 'flex',
    flexDirection: props.direction,
    justifyContent: mapearJustify(props.justify),
    alignItems: mapearAlign(props.align),
    flexWrap: props.wrap ? 'wrap' : 'nowrap',
  }

  if (props.gap) {
    styles.gap = props.gap
  }

  if (props.grow) {
    styles.flexGrow = 1
  }

  return styles
})
</script>

<style scoped>
.c-group {
  min-width: 0;
}
</style>
