<template>
  <transition name="fade">
    <div v-if="connected">
      <div class="notify-box bottom-center">
        <div class="container">
          <div class="g-symbol">`</div>
          <p>Mover</p>
        </div>
        <div class="container">
          <div class="g-symbol">,</div>
          <p>Ação</p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useGamepad } from '@vueuse/core'

const selectedIndex = ref(0)
const { isSupported, gamepads, onConnected, onDisconnected } = useGamepad()
const gamepad = computed(() => gamepads.value.find((g) => g.mapping === 'standard'))

const selectors = ['button', '.btn', '[tabindex]', '.input', 'a', '.controller-index', 'input']
const options = ['Iniciar', 'Opções', 'Créditos', 'Sair']

const connected = computed(() => gamepad.value?.connected)

onConnected((index) => {
  const pad = gamepads.value[index]
  if (pad) console.log(`${pad.id} connected`)
})

onDisconnected((index) => {
  console.log(`Gamepad ${index} disconnected`)
  selectedIndex.value = 0
  clearHighlight()
})

let lastMove = 0
let lastSelect = false

function getFocusableItems() {
  return Array.from(document.querySelectorAll(selectors.join(','))).filter(
    (el) => el.offsetParent !== null,
  ) // visível
}

function updateHighlight(items) {
  items.forEach((el, i) => {
    if (i === selectedIndex.value) {
      el.classList.add('highlight')
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      el.classList.remove('highlight')
    }
  })
}

function clearHighlight() {
  const items = getFocusableItems()
  items.forEach((el) => el.classList.remove('highlight'))
}

function triggerAction(el) {
  if (el.tagName === 'A' || el.tagName === 'BUTTON') {
    el.click()
  } else if (el instanceof HTMLInputElement) {
    el.focus()
  } else if (el.matches('[type="checkbox"]')) {
    el.checked = !el.checked
    el.dispatchEvent(new Event('change', { bubbles: true }))
  } else {
    el.dispatchEvent(new Event('click'))
  }
}

onMounted(() => {
  const interval = setInterval(() => {
    const gp = gamepad.value
    if (!gp) return

    const now = performance.now()
    const up = gp.axes[1] < -0.5 || gp.buttons[12]?.pressed // eixo vertical negativo ou D-Pad cima
    const down = gp.axes[1] > 0.5 || gp.buttons[13]?.pressed // eixo vertical positivo ou D-Pad baixo
    const left = gp.axes[0] < -0.5 || gp.buttons[14]?.pressed // eixo horizontal negativo ou D-Pad esquerda
    const right = gp.axes[0] > 0.5 || gp.buttons[15]?.pressed // eixo horizontal positivo ou D-Pad direita

    const xPressed = gp.buttons[0]?.pressed
    const bPressed = gp.buttons[1]?.pressed

    const items = getFocusableItems()
    const maxIndex = items.length - 1
    if (items.length === 0) return

    if ((up || down || left || right) && now - lastMove > 200) {
      const moveDown = down || right
      const moveUp = up || left

      selectedIndex.value =
        (selectedIndex.value + (moveDown ? 1 : -1) + items.length) % items.length
      lastMove = now
      updateHighlight(items)
    }

    if (xPressed && !lastSelect) {
      triggerAction(items[selectedIndex.value])
      lastSelect = true
    } else if (!xPressed) {
      lastSelect = false
    }

    if (bPressed) {
      console.log('Voltar') // ex: router.back() ou lógica de navegação
    }
  }, 100)

  onUnmounted(() => {
    clearInterval(interval)
    selectedIndex.value = 0
    clearHighlight()
  })
})
</script>

<style scoped>
@font-face {
  font-family: 'gamepad';
  src: url('/src/assets/fonts/gamepad/EsquireGenericGamepdFont_CS.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

/* Usando a fonte */
.notify-box {
  display: flex;
  background-color: var(--bg2);
  border-radius: 25px;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
  color: var(--text);
  font-weight: bold;
  gap: 20px;
}

.notify-box.bottom-center {
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
}

.g-symbol {
  font-family: 'gamepad';
  font-size: 2rem;
  color: var(--primary);
}

.container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
</style>
