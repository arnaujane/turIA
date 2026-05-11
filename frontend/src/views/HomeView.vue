<template>
  <div class="view">

    <!-- Header -->
    <div class="header">
      <span class="app-title">Mystery Tourist Lens</span>
      <button class="profile-btn">👤</button>
    </div>

    <!-- Hero -->
    <div class="hero">
      <div class="hero-card">
        <div class="hero-text">
          <h1>¡Bienvenido a tu aventura!</h1>
          <p>y gestión de rutas</p>
        </div>
        <div class="hero-illustration">📱</div>
      </div>
    </div>

    <!-- Content -->
    <div class="content">
      <button class="btn-main" @click="$router.push('/camera')">
        <span class="btn-icon">📷</span>
        <div class="btn-text">
          <strong>Comenzar Nueva Ruta</strong>
          <small>Escanea un monumento para iniciar el análisis</small>
        </div>
      </button>

      <div class="section-header">
        <span>Mi Historial de Rutas Finalizadas</span>
        <button class="see-all">🕐</button>
      </div>

      <div v-if="routeHistory.length === 0" class="empty-state">
        <p>No hay rutas en progreso</p>
      </div>

      <div v-for="item in (routeHistory as RouteItem[])" :key="item.id" class="history-card">
        <span class="hist-icon">✅</span>
        <div class="hist-info">
          <strong>{{ item.name }}</strong>
          <small>{{ item.challenges }} Challenges</small>
        </div>
        <span class="hist-pts">{{ item.points }} pts</span>
      </div>
    </div>

    <!-- Bottom nav -->
    <div class="bottom-nav">
      <button class="nav-item active">
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
interface RouteItem {
  id: number
  name: string
  challenges: number
  points: number
}

const routeHistory: RouteItem[] = [
  { id: 1, name: 'Retiro', challenges: 3, points: 300 },
  { id: 2, name: 'Plaza Mayor', challenges: 2, points: 200 },
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
  justify-content: space-between;
  align-items: center;
}
.app-title { color: #fff; font-size: 1.1rem; font-weight: 700; }
.profile-btn { background: none; border: none; font-size: 1.4rem; cursor: pointer; }

.hero {
  background: linear-gradient(135deg, #1a73e8, #0d47a1);
  padding: 0 20px 28px;
}
.hero-card {
  background: rgba(255,255,255,0.15);
  border-radius: 20px;
  padding: 20px 24px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.hero-text { display: flex; flex-direction: column; gap: 4px; }
.hero-card h1 { font-size: 1.3rem; font-weight: 800; }
.hero-card p { font-size: 0.9rem; opacity: 0.85; }
.hero-illustration { font-size: 3.5rem; }

.content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-main {
  background: #1a73e8;
  border: none;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  width: 100%;
  text-align: left;
  box-shadow: 0 4px 16px rgba(26,115,232,0.3);
}
.btn-icon { font-size: 1.8rem; }
.btn-text { display: flex; flex-direction: column; gap: 2px; }
.btn-text strong { color: #fff; font-size: 1rem; }
.btn-text small { color: rgba(255,255,255,0.8); font-size: 0.78rem; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
.section-header span { font-size: 0.85rem; font-weight: 600; color: #333; }
.see-all { background: none; border: none; font-size: 1.1rem; cursor: pointer; }

.empty-state {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 0.9rem;
}

.history-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.hist-icon { font-size: 1.3rem; }
.hist-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.hist-info strong { color: #222; font-size: 0.95rem; }
.hist-info small { color: #888; font-size: 0.78rem; }
.hist-pts { color: #1a73e8; font-weight: 700; font-size: 0.9rem; }

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
.nav-item.active small { color: #1a73e8; font-weight: 700; }
</style>