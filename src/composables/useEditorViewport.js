import { ref, computed } from 'vue'

export function useEditorViewport(min, max) {
  const zoom = ref(1)
  const ZOOM_STEP = 0.1

  function handleZoom(direction) {
    const newZoom = direction === 'in' ? zoom.value + ZOOM_STEP : zoom.value - ZOOM_STEP
    // arredonda para haver precisão
    zoom.value = Math.min(Math.max(Math.round(newZoom * 100) / 100, min), max)
  }

  const gridStyle = computed(() => {
    const size = 20 * zoom.value
    return {
      backgroundSize: `${size}px ${size}px`,
      backgroundPosition: '0 0',
    }
  })

  const editorStyle = computed(() => ({
    transform: `scale(${zoom.value})`,
    transformOrigin: '0 0',

    width: `${100 / zoom.value}%`,
    height: `${100 / zoom.value}%`,
  }))
  return { zoom, gridStyle, editorStyle, handleZoom }
}
