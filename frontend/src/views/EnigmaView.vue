<template>
  <div class="view">
    <div class="header">
      <button class="back" @click="$router.push('/audioguide')">← Atrás</button>
      <h2>Enigma</h2>
    </div>

    <div class="content">
      <div class="enigma-header">
        <div class="enigma-emoji">🧩</div>
        <h3>Resuelve el enigma</h3>
        <p>Responde correctamente para desbloquear el siguiente punto</p>
      </div>

      <div class="question-card">
        <p class="question">¿En qué año está prevista la finalización de la Sagrada Família?</p>
      </div>

      <div class="options">
        <button
          v-for="option in options"
          :key="option.value"
          :class="['option-btn', getClass(option.value)]"
          @click="selectOption(option.value)"
        >
          {{ option.label }}
        </button>
      </div>

      <div v-if="feedback" class="feedback" :class="isCorrect ? 'correct' : 'wrong'">
        {{ feedback }}
      </div>

      <button v-if="isCorrect" class="btn-success" @click="$router.push('/map')">
        Ver mapa del siguiente punto 🗺️
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const options = [
  { value: '2024', label: '2024' },
  { value: '2026', label: '2026' },
  { value: '2030', label: '2030' },
  { value: '2035', label: '2035' },
]

const selected = ref<string | null>(null)
const feedback = ref<string | null>(null)
const isCorrect = ref(false)

function selectOption(value: string) {
  selected.value = value
  if (value === '2026') {
    isCorrect.value = true
    feedback.value = '✅ ¡Correcto! +100 puntos. Siguiente punto desbloqueado.'
  } else {
    isCorrect.value = false
    feedback.value = '❌ No es correcto. Inténtalo de nuevo.'
  }
}

function getClass(value: string) {
  if (!selected.value) return ''
  if (value === '2026') return 'correct-opt'
  if (value === selected.value) return 'wrong-opt'
  return 'dim'
}
</script>

<style scoped>
.view { background: #0f0f1a; min-height: 100vh; color: #fff; }
.header { display: flex; align-items: center; gap: 12px; padding: 16px; background: #1e1e2e; }
.back { background: none; border: none; color: #6c63ff; font-size: 1rem; cursor: pointer; }
h2 { color: #fff; margin: 0; font-size: 1.1rem; }
.content { padding: 24px; }
.enigma-header { text-align: center; padding: 16px 0; }
.enigma-emoji { font-size: 56px; }
h3 { color: #fff; margin: 8px 0; }
p { color: #aaa; }
.question-card { background: #1e1e2e; border-radius: 16px; padding: 20px; margin: 16px 0; }
.question { color: #fff; font-size: 1.1rem; font-weight: 500; margin: 0; }
.options { display: flex; flex-direction: column; gap: 10px; margin: 16px 0; }
.option-btn { padding: 14px; border-radius: 12px; border: 2px solid #6c63ff; background: transparent; color: #fff; font-size: 1rem; cursor: pointer; text-align: left; transition: all 0.2s; }
.correct-opt { background: #2dd36f22; border-color: #2dd36f; color: #2dd36f; }
.wrong-opt { background: #eb445a22; border-color: #eb445a; color: #eb445a; }
.dim { opacity: 0.4; }
.feedback { text-align: center; padding: 12px; border-radius: 12px; margin: 8px 0; font-weight: bold; }
.correct { background: #2dd36f22; color: #2dd36f; }
.wrong { background: #eb445a22; color: #eb445a; }
.btn-success { display: block; width: 100%; padding: 14px; border-radius: 12px; background: #2dd36f; color: #fff; font-size: 1rem; font-weight: bold; border: none; cursor: pointer; margin-top: 12px; }
</style>