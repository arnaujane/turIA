<template>
  <div class="view">

    <!-- Header -->
    <div class="header">
      <button class="back-btn" @click="$router.push('/camera')">←</button>
      <span class="header-title">Audioguía</span>
      <div class="pwa-badge">PWA</div>
    </div>

    <!-- Monumento detectado -->
    <div class="detected-banner">
      <span class="detected-icon">📍</span>
      <div class="detected-text">
        <small>Monumento detectado</small>
        <strong>Sagrada Família</strong>
      </div>
      <span class="detected-badge">✅</span>
    </div>

    <div class="content">

      <!-- Imagen del monumento -->
      <div class="monument-card">
        <div class="monument-img">⛪</div>
        <div class="monument-info">
          <h2>Sagrada Família</h2>
          <p>Barcelona, España · 1882</p>
        </div>
      </div>

      <!-- Texto de la audioguía -->
      <div class="info-card">
        <h3>📖 Sobre este lugar</h3>
        <p>
          La Sagrada Família es la obra maestra inacabada de Antoni Gaudí, iniciada en 1882.
          Su arquitectura combina el gótico con el modernismo catalán, con torres que simbolizan
          los apóstoles. Está prevista su finalización para 2026, coincidiendo con el centenario
          de la muerte de Gaudí.
        </p>
      </div>

      <!-- Reproductor de audio -->
      <div class="audio-card">
        <div class="audio-header">
          <span>🎧</span>
          <strong>Escuchar audioguía</strong>
        </div>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <div class="player-controls">
          <button class="ctrl-btn">⏮</button>
          <button class="ctrl-btn play" @click="togglePlay">
            {{ playing ? '⏸' : '▶' }}
          </button>
          <button class="ctrl-btn">⏭</button>
        </div>
        <small class="audio-note">Audio generado con Text-to-Speech API</small>
      </div>

    </div>

    <!-- Botón siguiente -->
    <div class="bottom-action">
      <button class="btn-enigma" @click="$router.push('/enigma')">
        Resolver enigma 🧩
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

const playing = ref(false)

function togglePlay() {
  playing.value = !playing.value
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
.back-btn { background: none; border: none; color: #fff; font-size: 1.4rem; cursor: pointer; padding: 0 8px 0 0; }
.header-title { color: #fff; font-size: 1.1rem; font-weight: 700; flex: 1; }
.pwa-badge { background: rgba(255,255,255,0.2); color: #fff; font-size: 0.7rem; font-weight: 700; padding: 4px 8px; border-radius: 8px; }

/* Banner detectado */
.detected-banner {
  background: linear-gradient(135deg, #1a73e8, #0d47a1);
  padding: 0 20px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.detected-icon { font-size: 1.4rem; }
.detected-text { flex: 1; display: flex; flex-direction: column; }
.detected-text small { color: rgba(255,255,255,0.75); font-size: 0.75rem; }
.detected-text strong { color: #fff; font-size: 1rem; }
.detected-badge { font-size: 1.2rem; }

/* Content */
.content { flex: 1; padding: 20px; display: flex; flex-direction: column; gap: 14px; }

/* Monument card */
.monument-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.monument-img { font-size: 3.5rem; }
.monument-info { display: flex; flex-direction: column; gap: 4px; }
.monument-info h2 { color: #222; font-size: 1.2rem; }
.monument-info p { color: #888; font-size: 0.85rem; }

/* Info card */
.info-card {
  background: #fff;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.info-card h3 { color: #222; font-size: 0.95rem; font-weight: 700; }
.info-card p { color: #555; font-size: 0.9rem; line-height: 1.6; }

/* Audio card */
.audio-card {
  background: #fff;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.audio-header { display: flex; align-items: center; gap: 8px; }
.audio-header span { font-size: 1.3rem; }
.audio-header strong { color: #222; font-size: 0.95rem; }
.progress-bar { background: #eee; border-radius: 99px; height: 6px; overflow: hidden; }
.progress-fill { background: #1a73e8; width: 35%; height: 100%; border-radius: 99px; }
.player-controls { display: flex; justify-content: center; align-items: center; gap: 16px; }
.ctrl-btn {
  border: none;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f4ff;
  width: 44px;
  height: 44px;
  font-size: 1rem;
}
.play {
  background: #1a73e8;
  width: 56px;
  height: 56px;
  font-size: 1.2rem;
  box-shadow: 0 4px 16px rgba(26,115,232,0.35);
}
.audio-note { color: #aaa; font-size: 0.75rem; text-align: center; }

/* Bottom action */
.bottom-action { padding: 8px 20px 12px; }
.btn-enigma {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  background: #f59e0b;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(245,158,11,0.3);
}

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