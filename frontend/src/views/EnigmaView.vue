<template>
  <div class="view">

    <!-- Header -->
    <div class="header">
      <button class="back-btn" @click="$router.push('/audioguide')">←</button>
      <span class="header-title">Enigma</span>
      <div class="pwa-badge">PWA</div>
    </div>

    <!-- Banner -->
    <div class="banner">
      <span class="banner-icon">🧩</span>
      <div class="banner-text">
        <small>Sagrada Família</small>
        <strong>Resuelve el enigma para continuar</strong>
      </div>
    </div>

    <div class="content">

      <!-- Pregunta -->
      <div class="question-card">
        <h3>💬 Pregunta</h3>
        <p>¿En qué año está prevista la finalización de la Sagrada Família?</p>
      </div>

      <!-- Opciones -->
      <div class="options">
        <button
          v-for="option in options"
          :key="option.value"
          :class="['option-btn', getClass(option.value)]"
          @click="selectOption(option.value)"
        >
          <span class="option-label">{{ option.value }}</span>
          <span class="option-text">{{ option.label }}</span>
          <span class="option-icon">{{ getIcon(option.value) }}</span>
        </button>
      </div>

      <!-- Feedback -->
      <div v-if="feedback" :class="['feedback-card', isCorrect ? 'correct' : 'wrong']">
        <span class="feedback-icon">{{ isCorrect ? '🎉' : '❌' }}</span>
        <div class="feedback-text">
          <strong>{{ isCorrect ? '¡Correcto!' : 'Incorrecto' }}</strong>
          <small>{{ feedback }}</small>
        </div>
        <span v-if="isCorrect" class="feedback-pts">+100 pts</span>
      </div>

      <!-- Pista -->
      <button v-if="!isCorrect && selected" class="btn-hint" @click="showHint = !showHint">
        💡 {{ showHint ? 'Ocultar pista' : 'Ver pista' }}
      </button>
      <div v-if="showHint" class="hint-card">
        <p>Gaudí murió en 1926. La finalización está prevista 100 años después.</p>
      </div>

    </div>

    <!-- Botón siguiente -->
    <div class="bottom-action">
      <button
        v-if="isCorrect"
        class="btn-next"
        @click="$router.push('/map')"
      >
        Ver mapa del siguiente punto 🗺️
      </button>
      <button
        v-else
        class="btn-next disabled"
        disabled
      >
        Responde correctamente para continuar
      </button>
    </div>

    <!-- Bottom nav -->
    <div class="bottom-nav">
      <button class="nav-item" @click="$router.push('/home')">
        <span>🏠</span>
        <small>Inicio</small>
      </button>
      <button class="nav-item" @click="$router.push('/progress')">
        <span>☰</span>
        <small>Historial</small>
      </button>
      <button class="nav-item">
        <span>👤</span>
        <small>Perfil</small>
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Option {
  value: string
  label: string
}

const options: Option[] = [
  { value: '2024', label: 'Hace ya más de un año' },
  { value: '2026', label: 'Centenario de la muerte de Gaudí' },
  { value: '2030', label: 'Dentro de unos años' },
  { value: '2035', label: 'Aún queda mucho tiempo' },
]

const selected = ref<string | null>(null)
const feedback = ref<string | null>(null)
const isCorrect = ref(false)
const showHint = ref(false)

function selectOption(value: string) {
  if (isCorrect.value) return
  selected.value = value
  if (value === '2026') {
    isCorrect.value = true
    feedback.value = 'Siguiente punto desbloqueado. ¡Sigue explorando!'
  } else {
    isCorrect.value = false
    feedback.value = 'Esa no es la respuesta correcta. Inténtalo de nuevo.'
  }
}

function getClass(value: string) {
  if (!selected.value) return ''
  if (value === '2026') return 'correct-opt'
  if (value === selected.value) return 'wrong-opt'
  return 'dim'
}

function getIcon(value: string) {
  if (!selected.value) return ''
  if (value === '2026') return '✅'
  if (value === selected.value) return '❌'
  return ''
}
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.view {
  background: #f4f6fb;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', sans-serif;
}

.header {
  background: linear-gradient(135deg, #1a73e8, #0d47a1);
  padding: 48px 20px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.back-btn { background: none; border: none; color: #fff; font-size: 1.4rem; cursor: pointer; padding: 0 8px 0 0; }
.header-title { color: #fff; font-size: 1.1rem; font-weight: 700; flex: 1; }
.pwa-badge { background: rgba(255,255,255,0.2); color: #fff; font-size: 0.7rem; font-weight: 700; padding: 4px 8px; border-radius: 8px; }

.banner {
  background: linear-gradient(135deg, #1a73e8, #0d47a1);
  padding: 0 20px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.banner-icon { font-size: 1.6rem; }
.banner-text { display: flex; flex-direction: column; }
.banner-text small { color: rgba(255,255,255,0.75); font-size: 0.75rem; }
.banner-text strong { color: #fff; font-size: 0.95rem; }

.content { flex: 1; padding: 20px; display: flex; flex-direction: column; gap: 14px; }

.question-card {
  background: #fff;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.question-card h3 { color: #222; font-size: 0.95rem; font-weight: 700; }
.question-card p { color: #333; font-size: 1rem; line-height: 1.5; font-weight: 500; }

.options { display: flex; flex-direction: column; gap: 10px; }
.option-btn {
  background: #fff;
  border: 2px solid #e0e7ff;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}
.option-label { background: #f0f4ff; color: #1a73e8; font-weight: 700; font-size: 0.9rem; padding: 4px 10px; border-radius: 8px; min-width: 44px; text-align: center; }
.option-text { flex: 1; color: #333; font-size: 0.95rem; }
.option-icon { font-size: 1.1rem; }
.correct-opt { border-color: #22c55e; background: #f0fdf4; }
.correct-opt .option-label { background: #dcfce7; color: #16a34a; }
.correct-opt .option-text { color: #16a34a; font-weight: 600; }
.wrong-opt { border-color: #ef4444; background: #fef2f2; }
.wrong-opt .option-label { background: #fee2e2; color: #dc2626; }
.wrong-opt .option-text { color: #dc2626; }
.dim { opacity: 0.4; }

.feedback-card {
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.feedback-card.correct { background: #f0fdf4; border: 1.5px solid #22c55e; }
.feedback-card.wrong { background: #fef2f2; border: 1.5px solid #ef4444; }
.feedback-icon { font-size: 1.5rem; }
.feedback-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.feedback-text strong { font-size: 0.95rem; color: #222; }
.feedback-text small { font-size: 0.8rem; color: #666; }
.feedback-pts { font-size: 1rem; font-weight: 700; color: #16a34a; }

.btn-hint {
  background: none;
  border: 1.5px dashed #f59e0b;
  color: #f59e0b;
  border-radius: 12px;
  padding: 10px;
  font-size: 0.9rem;
  cursor: pointer;
  font-weight: 600;
}
.hint-card {
  background: #fffbeb;
  border: 1.5px solid #fcd34d;
  border-radius: 12px;
  padding: 14px;
}
.hint-card p { color: #92400e; font-size: 0.9rem; line-height: 1.5; }

.bottom-action { padding: 8px 20px 12px; }
.btn-next {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  background: #1a73e8;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(26,115,232,0.3);
}
.btn-next.disabled { background: #ccc; box-shadow: none; cursor: not-allowed; }

.bottom-nav {
  background: #fff;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-around;
  padding: 10px 0 20px;
  position: sticky;
  bottom: 0;
}
.nav-item {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  padding: 6px 20px;
  border-radius: 12px;
}
.nav-item span { font-size: 1.3rem; }
.nav-item small { font-size: 0.7rem; color: #999; }
</style>