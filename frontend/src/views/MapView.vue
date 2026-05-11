<template>
  <div class="view">
    <div class="header">
      <button class="back" @click="$router.push('/enigma')">← Atrás</button>
      <h2>Mapa de la ruta</h2>
    </div>

    <div class="map-placeholder">
      <p>🗺️ Aquí se integrará Google Maps</p>
    </div>

    <div class="content">
      <h3>Puntos de la ruta</h3>
      <div class="points-list">
        <div v-for="point in points" :key="point.id" class="point-item">
          <span class="point-icon">{{ point.completed ? '✅' : point.current ? '📍' : '🔒' }}</span>
          <div class="point-info">
            <strong>{{ point.name }}</strong>
            <small>{{ point.description }}</small>
          </div>
          <span class="point-badge" :class="point.completed ? 'done' : point.current ? 'active' : 'locked'">
            {{ point.completed ? 'Completado' : point.current ? 'Actual' : 'Bloqueado' }}
          </span>
        </div>
      </div>

      <button class="btn-primary" @click="$router.push('/camera')">📷 Ir al siguiente punto</button>
      <button class="btn-outline" @click="$router.push('/progress')">Ver progreso completo</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const points = [
  { id: 1, name: 'Sagrada Família', description: 'Obra maestra de Gaudí', completed: true, current: false },
  { id: 2, name: 'Park Güell', description: 'Jardines modernistas de Gaudí', completed: false, current: true },
  { id: 3, name: 'Casa Batlló', description: 'El dragón de piedra', completed: false, current: false },
]
</script>

<style scoped>
.view { background: #0f0f1a; min-height: 100vh; color: #fff; }
.header { display: flex; align-items: center; gap: 12px; padding: 16px; background: #1e1e2e; }
.back { background: none; border: none; color: #6c63ff; font-size: 1rem; cursor: pointer; }
h2 { color: #fff; margin: 0; font-size: 1.1rem; }
.map-placeholder { background: #1e1e2e; height: 260px; display: flex; align-items: center; justify-content: center; color: #555; font-size: 1rem; }
.content { padding: 24px; }
h3 { color: #fff; margin: 0 0 16px; }
.points-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
.point-item { background: #1e1e2e; border-radius: 12px; padding: 14px; display: flex; align-items: center; gap: 12px; }
.point-icon { font-size: 1.4rem; }
.point-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.point-info strong { color: #fff; }
.point-info small { color: #888; font-size: 0.8rem; }
.point-badge { font-size: 0.75rem; padding: 4px 10px; border-radius: 20px; white-space: nowrap; }
.done { background: #2dd36f22; color: #2dd36f; }
.active { background: #ffc40922; color: #ffc409; }
.locked { background: #ffffff11; color: #666; }
button { display: block; width: 100%; padding: 14px; border-radius: 12px; font-size: 1rem; cursor: pointer; border: none; margin-bottom: 10px; }
.btn-primary { background: #6c63ff; color: #fff; }
.btn-outline { background: transparent; color: #6c63ff; border: 2px solid #6c63ff !important; }
</style>