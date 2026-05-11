<template>
  <div class="view">
    <div class="header">
      <button class="back" @click="$router.push('/home')">← Atrás</button>
      <h2>Fotografiar monumento</h2>
    </div>

    <div class="content">
      <h3>¿Dónde estás?</h3>
      <p>Haz una foto al monumento o lugar que tengas delante y la IA lo identificará automáticamente.</p>
      <div class="preview-box" @click="openGallery">
        <div v-if="!imagePreview" class="placeholder">
          <span>📷</span>
          <p>Toca para seleccionar imagen</p>
        </div>
        <img v-else :src="imagePreview" alt="Foto" />
      </div>

      <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileSelected" />

      <button class="btn-primary" @click="openCamera">📷 Hacer foto</button>
      <button class="btn-outline" @click="openGallery">🖼️ Subir desde galería</button>
      <button class="btn-success" :disabled="!imagePreview" @click="$router.push('/audioguide')">
        Analizar imagen →
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
.view { background: #0f0f1a; min-height: 100vh; color: #fff; }
.header { display: flex; align-items: center; gap: 12px; padding: 16px; background: #1e1e2e; }
.back { background: none; border: none; color: #6c63ff; font-size: 1rem; cursor: pointer; }
h2 { color: #fff; margin: 0; font-size: 1.1rem; }
.content { padding: 24px; }
.chip { background: #6c63ff; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; }
h3 { color: #fff; margin: 16px 0 8px; }
p { color: #aaa; margin: 0 0 16px; }
.preview-box { background: #1e1e2e; border-radius: 16px; min-height: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 16px 0; overflow: hidden; cursor: pointer; }
.placeholder span { font-size: 56px; }
.placeholder p { color: #666; margin: 8px 0 0; }
.preview-box img { width: 100%; border-radius: 16px; }
button { display: block; width: 100%; margin: 8px 0; padding: 14px; border-radius: 12px; font-size: 1rem; cursor: pointer; border: none; }
.btn-primary { background: #6c63ff; color: #fff; }
.btn-outline { background: transparent; color: #6c63ff; border: 2px solid #6c63ff !important; border: none; }
.btn-success { background: #2dd36f; color: #fff; }
button:disabled { opacity: 0.4; cursor: not-allowed; }
</style>