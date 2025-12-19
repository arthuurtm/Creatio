<template>
  <component :is="tag" class="c-group" :style="groupStyles" v-bind="$attrs">
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue'

/**
 * @typedef {'div' | 'span' | 'fieldset' | 'section' | 'ul' | 'li' | 'label'} CGroupTag
 * Elemento HTML que o grupo renderiza.
 */

/**
 * @typedef {'row' | 'column'} CGroupDirection
 * Direção do layout flexível.
 */

/**
 * @typedef {'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'} CGroupJustify
 * Controle do alinhamento horizontal (justify-content).
 */

/**
 * @typedef {'start' | 'center' | 'end' | 'stretch' | 'baseline'} CGroupAlign
 * Controle do alinhamento vertical (align-items).
 */

const props = defineProps({
  /**
   * @type {import('vue').PropType<CGroupTag>}
   * Elemento HTML a ser usado como contêiner.
   * @default 'div'
   */
  tag: { type: String, default: 'div' },

  /**
   * @type {import('vue').PropType<CGroupDirection>}
   * Direção dos itens do grupo (horizontal ou vertical).
   * @default 'row'
   */
  direction: { type: String, default: 'row' },

  /**
   * @type {import('vue').PropType<CGroupJustify>}
   * Distribuição dos itens no eixo principal.
   * @default 'start'
   */
  justify: { type: String, default: 'start' },

  /**
   * @type {import('vue').PropType<CGroupAlign>}
   * Alinhamento dos itens no eixo cruzado.
   * @default 'stretch'
   */
  align: { type: String, default: 'stretch' },

  /**
   * Espaçamento entre elementos (ex: `"1rem"`, `"8px"`, `"var(--gap-md)"`).
   */
  gap: { type: String, default: null },

  /**
   * Permite quebra de linha (equivalente a `flex-wrap: wrap`).
   */
  wrap: { type: Boolean, default: false },

  /**
   * Usa `inline-flex` em vez de `flex`.
   */
  inline: { type: Boolean, default: false },

  /**
   * Faz o grupo crescer para preencher o espaço disponível.
   */
  grow: { type: Boolean, default: false },

  // ---------------------------
  // 🔶 Aparência e tamanho
  // ---------------------------

  /** Largura do grupo (`100%`, `auto`, `200px`, etc.). */
  width: { type: String, default: null },

  /** Altura do grupo (`100vh`, `auto`, `400px`, etc.). */
  height: { type: String, default: null },

  /** Largura máxima permitida. */
  maxWidth: { type: String, default: null },

  /** Altura máxima permitida. */
  maxHeight: { type: String, default: null },

  /** Largura mínima. */
  minWidth: { type: String, default: null },

  /** Altura mínima. */
  minHeight: { type: String, default: null },

  /** Espaçamento interno (`padding`). */
  padding: { type: String, default: null },

  /** Espaçamento externo (`margin`). */
  margin: { type: String, default: null },

  /** Cor de fundo. */
  background: { type: String, default: null },

  /** Arredondamento das bordas (`border-radius`). */
  radius: { type: String, default: null },

  /** Controla o comportamento do overflow (`hidden`, `auto`, `scroll`). */
  overflow: { type: String, default: null },

  /** Exibe uma borda leve ao redor do grupo. */
  bordered: { type: Boolean, default: false },

  /** Exibe um contorno vermelho para depuração visual. */
  debug: { type: Boolean, default: false },

  /**
   * Centraliza o conteúdo no meio (tanto em `justify-content` quanto em `align-items`).
   */
  center: { type: Boolean, default: false },
})

/**
 * Mapeia os valores semânticos de `justify` para valores CSS válidos.
 * @param {CGroupJustify} val
 * @returns {string}
 */
function mapJustify(val) {
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

/**
 * Mapeia os valores semânticos de `align` para valores CSS válidos.
 * @param {CGroupAlign} val
 * @returns {string}
 */
function mapAlign(val) {
  const map = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
    baseline: 'baseline',
  }
  return map[val] || map.stretch
}

/**
 * Estilos computados baseados nas props.
 * Mantém apenas chaves válidas (sem `null`/`undefined`).
 */
const groupStyles = computed(() => {
  const styles = {
    display: props.inline ? 'inline-flex' : 'flex',
    flexDirection: props.direction,
    justifyContent: props.center ? 'center' : mapJustify(props.justify),
    alignItems: props.center ? 'center' : mapAlign(props.align),
    flexWrap: props.wrap ? 'wrap' : 'nowrap',
    gap: props.gap,
    flexGrow: props.grow ? 1 : undefined,

    width: props.width,
    height: props.height,
    maxWidth: props.maxWidth,
    maxHeight: props.maxHeight,
    minWidth: props.minWidth,
    minHeight: props.minHeight,

    padding: props.padding,
    margin: props.margin,
    background: props.background,
    borderRadius: props.radius,
    overflow: props.overflow,
    border: props.bordered ? '1px solid var(--border, #ccc)' : undefined,
    outline: props.debug ? '1px dashed red' : undefined,
  }

  return Object.fromEntries(Object.entries(styles).filter(([_, v]) => v != null))
})
</script>

<style scoped>
.c-group {
  min-width: 0;
  box-sizing: border-box;
}
</style>
