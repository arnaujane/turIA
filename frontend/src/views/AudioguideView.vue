<template>
  <div class="view">
    <div class="header">
      <button class="back" @click="$router.push('/camera')">← Atrás</button>
      <h2>Audioguía</h2>
    </div>

    <div class="content">
      <div class="monument-header">
        <div class="monument-emoji">⛪</div>
        <h3>Sagrada Família</h3>
        <span class="badge">✅ Monumento detectado</span>
      </div>

      <div class="info-card">
        <p>La Sagrada Família es la obra maestra inacabada de Antoni Gaudí, iniciada en 1882. Su arquitectura combina el gótico con el modernismo catalán, con torres que simbolizan los apóstoles. Está prevista su finalización para 2026, coincidiendo con el centenario de la muerte de Gaudí.</p>
      </div>

      <div class="audio-player">
        <p class="audio-label">🎧 Escuchar audioguía</p>
        <div class="player-controls">
          <button class="ctrl">⏮</button>
          <button class="ctrl play">▶</button>
          <button class="ctrl">⏭</button>
        </div>
        <p class="audio-note">El audio se generará con Text-to-Speech API</p>
      </div>

      <button class="btn-warning" @click="$router.push('/enigma')">Resolver enigma 🧩</button>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.view { background: #0f0f1a; min-height: 100vh; color: #fff; }
.header { display: flex; align-items: center; gap: 12px; padding: 16px; background: #1e1e2e; }
.back { background: none; border: none; color: #6c63ff; font-size: 1rem; cursor: pointer; }
h2 { color: #fff; margin: 0; font-size: 1.1rem; }
.content { padding: 24px; }
.monument-header { text-align: center; padding: 16px 0; }
.monument-emoji { font-size: 64px; margin-bottom: 8px; }
h3 { color: #fff; margin: 8px 0; font-size: 1.4rem; }
.badge { background: #2dd36f22; color: #2dd36f; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; }
.info-card { background: #1e1e2e; border-radius: 16px; padding: 16px; margin: 20px 0; }
.info-card p { color: #ccc; line-height: 1.6; margin: 0; }
.audio-player { background: #1e1e2e; border-radius: 16px; padding: 16px; text-align: center; margin: 16px 0; }
.audio-label { color: #fff; font-weight: bold; margin: 0 0 12px; }
.player-controls { display: flex; justify-content: center; gap: 12px; margin-bottom: 8px; }
.ctrl { background: #2a2a3e; border: none; color: #fff; width: 44px; height: 44px; border-radius: 50%; font-size: 1rem; cursor: pointer; }
.play { background: #6c63ff; width: 56px; height: 56px; font-size: 1.2rem; }
.audio-note { color: #555; font-size: 0.75rem; margin: 0; }
button.btn-warning { display: block; width: 100%; padding: 14px; border-radius: 12px; background: #ffc409; color: #000; font-size: 1rem; font-weight: bold; border: none; cursor: pointer; margin-top: 8px; }
</style>