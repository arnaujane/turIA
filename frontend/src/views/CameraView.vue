<template>
  <div class="view">

    <!-- Header -->
    <div class="header">
      <button class="back-btn" @click="$router.push('/home')">←</button>
      <span class="header-title">Escáner de Monumento</span>
      <div class="pwa-badge">PWA</div>
    </div>

    <!-- Visor -->
    <div class="visor-wrapper">
      <div class="visor">
        <img v-if="imagePreview" :src="imagePreview" class="preview-img" alt="preview" />
        <div v-else class="visor-placeholder">
          <div class="reticle">
            <span class="corner tl"></span>
            <span class="corner tr"></span>
            <span class="corner bl"></span>
            <span class="corner br"></span>
          </div>
          <p class="visor-hint">Apunta al monumento</p>
        </div>
      </div>
    </div>

    <!-- Controles -->
    <div class="controls">
      <button class="ctrl-btn secondary" @click="openGallery">🖼️</button>
      <button class="ctrl-btn shutter" @click="openCamera">📷</button>
      <button class="ctrl-btn secondary" @click="openGallery">🔄</button>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display:none"
      @change="onFileSelected"
    />

    <!-- Botón analizar -->
    <div class="bottom-action">
      <button
        class="btn-analyze"
        :disabled="!imagePreview"
        @click="$router.push('/audioguide')"
      >
        Analizar imagen →
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

const fileInput = ref<HTMLInputElement | null>(null)
const imagePreview = ref<string | null>(null)

function openCamera() {
  if (fileInput.value) {
    fileInput.value.setAttribute('capture', 'environment')
    fileInput.value.click()
  }
}

function openGallery() {
  if (fileInput.value) {
    fileInput.value.removeAttribute('capture')
    fileInput.value.click()
  }
}

function onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) imagePreview.value = URL.createObjectURL(file)
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

/* Header */
.header {
  background: linear-gradient(135deg, #1a73e8, #0d47a1);
  padding: 48px 20px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.back-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.4rem;
  cursor: pointer;
  padding: 0 8px 0 0;
}
.header-title { color: #fff; font-size: 1.1rem; font-weight: 700; flex: 1; }
.pwa-badge {
  background: rgba(255,255,255,0.2);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 8px;
}

/* Visor */
.visor-wrapper {
  flex: 1;
  background: #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  min-height: 340px;
}
.visor {
  width: 100%;
  max-width: 340px;
  aspect-ratio: 4/3;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}
.visor-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
  background: #12122a;
  border-radius: 12px;
}
.visor-hint { color: #ffffff66; font-size: 0.85rem; }

/* Retícula */
.reticle {
  width: 180px;
  height: 180px;
  position: relative;
}
.corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border-color: #fff;
  border-style: solid;
  opacity: 0.8;
}
.tl { top: 0; left: 0; border-width: 3px 0 0 3px; border-radius: 4px 0 0 0; }
.tr { top: 0; right: 0; border-width: 3px 3px 0 0; border-radius: 0 4px 0 0; }
.bl { bottom: 0; left: 0; border-width: 0 0 3px 3px; border-radius: 0 0 0 4px; }
.br { bottom: 0; right: 0; border-width: 0 3px 3px 0; border-radius: 0 0 4px 0; }

/* Controles */
.controls {
  background: #1a1a2e;
  padding: 16px 40px 20px;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.ctrl-btn {
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.shutter {
  width: 72px;
  height: 72px;
  background: #1a73e8;
  font-size: 1.8rem;
  box-shadow: 0 4px 20px rgba(26,115,232,0.5);
}
.secondary {
  width: 48px;
  height: 48px;
  background: rgba(255,255,255,0.15);
  font-size: 1.2rem;
}

/* Botón analizar */
.bottom-action { padding: 16px 20px 8px; }
.btn-analyze {
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
.btn-analyze:disabled { opacity: 0.4; cursor: not-allowed; }

/* Bottom nav */
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