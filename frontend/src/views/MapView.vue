<template>
  <div class="view">

    <!-- Header -->
    <div class="header">
      <button class="back-btn" @click="$router.push('/enigma')">←</button>
      <span class="header-title">Mapa de la ruta</span>
      <div class="pwa-badge">PWA</div>
    </div>

    <!-- Banner -->
    <div class="banner">
      <span class="banner-icon">🗺️</span>
      <div class="banner-text">
        <small>Ruta en progreso</small>
        <strong>1 de 3 puntos completados</strong>
      </div>
      <span class="banner-pts">300 pts</span>
    </div>

    <!-- Mapa placeholder -->
    <div class="map-placeholder">
      <div class="map-overlay">
        <span class="map-icon">🗺️</span>
        <p>Aquí se integrará Google Maps</p>
        <small>Google Maps Platform API</small>
      </div>
    </div>

    <div class="content">

      <!-- Puntos de la ruta -->
      <h3 class="section-title">Puntos de la ruta</h3>
      <div class="points-list">
        <div v-for="point in points" :key="point.id" :class="['point-card', point.completed ? 'done' : point.current ? 'active' : 'locked']">
          <div class="point-left">
            <div class="point-status-icon">{{ point.completed ? '✅' : point.current ? '📍' : '🔒' }}</div>
            <div class="point-line" v-if="point.id < points.length"></div>
          </div>
          <div class="point-info">
            <strong>{{ point.name }}</strong>
            <small>{{ point.description }}</small>
            <span v-if="point.distance" class="point-distance">📏 {{ point.distance }}</span>
          </div>
          <span :class="['point-badge', point.completed ? 'badge-done' : point.current ? 'badge-active' : 'badge-locked']">
            {{ point.completed ? 'Completado' : point.current ? 'Actual' : 'Bloqueado' }}
          </span>
        </div>
      </div>

    </div>

    <!-- Botón siguiente -->
    <div class="bottom-action">
      <button class="btn-next" @click="$router.push('/camera')">
        📷 Ir al siguiente punto
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
interface RoutePoint {
  id: number
  name: string
  description: string
  completed: boolean
  current: boolean
  distance?: string
}

const points: RoutePoint[] = [
  { id: 1, name: 'Sagrada Família', description: 'Obra maestra de Gaudí', completed: true, current: false },
  { id: 2, name: 'Park Güell', description: 'Jardines modernistas de Gaudí', completed: false, current: true, distance: '2.3 km' },
  { id: 3, name: 'Casa Batlló', description: 'El dragón de piedra', completed: false, current: false, distance: '3.1 km' },
]
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
.banner-text { display: flex; flex-direction: column; flex: 1; }
.banner-text small { color: rgba(255,255,255,0.75); font-size: 0.75rem; }
.banner-text strong { color: #fff; font-size: 0.95rem; }
.banner-pts { background: rgba(255,255,255,0.2); color: #fff; font-weight: 700; font-size: 0.9rem; padding: 6px 12px; border-radius: 20px; }

.map-placeholder {
  background: #c8d8e8;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.map-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.85);
  padding: 16px 24px;
  border-radius: 14px;
  text-align: center;
}
.map-icon { font-size: 2rem; }
.map-overlay p { color: #333; font-weight: 600; font-size: 0.9rem; }
.map-overlay small { color: #888; font-size: 0.75rem; }

.content { flex: 1; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.section-title { color: #222; font-size: 1rem; font-weight: 700; }

.points-list { display: flex; flex-direction: column; gap: 0; }
.point-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 10px;
  border-left: 4px solid #e0e7ff;
}
.point-card.done { border-left-color: #22c55e; }
.point-card.active { border-left-color: #1a73e8; }
.point-card.locked { border-left-color: #e5e7eb; opacity: 0.7; }

.point-left { display: flex; flex-direction: column; align-items: center; }
.point-status-icon { font-size: 1.4rem; }

.point-info { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.point-info strong { color: #222; font-size: 0.95rem; }
.point-info small { color: #888; font-size: 0.8rem; }
.point-distance { color: #1a73e8; font-size: 0.78rem; font-weight: 600; margin-top: 2px; }

.point-badge { font-size: 0.72rem; padding: 4px 10px; border-radius: 20px; white-space: nowrap; font-weight: 600; }
.badge-done { background: #dcfce7; color: #16a34a; }
.badge-active { background: #dbeafe; color: #1a73e8; }
.badge-locked { background: #f3f4f6; color: #9ca3af; }

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