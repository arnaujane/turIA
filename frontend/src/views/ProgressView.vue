<template>
  <div class="view">
    <div class="header">
      <button class="back" @click="$router.push('/home')">← Atrás</button>
      <h2>Mi progreso</h2>
    </div>

    <div class="content">
      <div class="score-header">
        <div class="trophy">🏆</div>
        <h3>Puntuación total</h3>
        <div class="score">100 pts</div>
      </div>

      <div class="stats-grid">
        <div class="stat">
          <div class="stat-value">1/3</div>
          <div class="stat-label">Puntos completados</div>
        </div>
        <div class="stat">
          <div class="stat-value">1</div>
          <div class="stat-label">Enigmas resueltos</div>
        </div>
        <div class="stat">
          <div class="stat-value">33%</div>
          <div class="stat-label">Ruta completada</div>
        </div>
      </div>

      <h3 class="section-title">Historial</h3>
      <div class="history-list">
        <div v-for="item in history" :key="item.id" class="history-item">
          <span class="hist-emoji">{{ item.emoji }}</span>
          <div class="hist-info">
            <strong>{{ item.title }}</strong>
            <small>{{ item.subtitle }}</small>
          </div>
          <span class="hist-points">+{{ item.points }} pts</span>
        </div>
      </div>

      <button class="btn-outline" @click="$router.push('/home')">Volver al inicio</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const history = [
  { id: 1, emoji: '⛪', title: 'Sagrada Família', subtitle: 'Enigma resuelto a la primera', points: 100 },
]
</script>

<style scoped>
.view { background: #0f0f1a; min-height: 100vh; color: #fff; }
.header { display: flex; align-items: center; gap: 12px; padding: 16px; background: #1e1e2e; }
.back { background: none; border: none; color: #6c63ff; font-size: 1rem; cursor: pointer; }
h2 { color: #fff; margin: 0; font-size: 1.1rem; }
.content { padding: 24px; }
.score-header { text-align: center; padding: 24px 0 16px; }
.trophy { font-size: 56px; }
h3 { color: #fff; margin: 8px 0; }
.score { font-size: 2.5rem; font-weight: bold; color: #6c63ff; }
.stats-grid { display: flex; justify-content: space-around; background: #1e1e2e; border-radius: 16px; padding: 20px; margin: 16px 0; }
.stat { text-align: center; }
.stat-value { font-size: 1.5rem; font-weight: bold; color: #6c63ff; }
.stat-label { font-size: 0.72rem; color: #888; margin-top: 4px; }
.section-title { margin: 20px 0 12px; }
.history-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
.history-item { background: #1e1e2e; border-radius: 12px; padding: 14px; display: flex; align-items: center; gap: 12px; }
.hist-emoji { font-size: 1.4rem; }
.hist-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.hist-info strong { color: #fff; }
.hist-info small { color: #888; font-size: 0.8rem; }
.hist-points { color: #2dd36f; font-weight: bold; font-size: 0.9rem; }
button { display: block; width: 100%; padding: 14px; border-radius: 12px; font-size: 1rem; cursor: pointer; }
.btn-outline { background: transparent; color: #6c63ff; border: 2px solid #6c63ff; }
</style>