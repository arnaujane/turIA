<template>
  <div class="home">
    <h1>🗺️ Mystery Tourist Lens</h1>
    <p>Fotografía cualquier monumento o lugar de interés. La IA lo identificará, te explicará su historia y te propondrá un reto para seguir explorando la ciudad.</p>
    <button @click="$router.push('/camera')">Comenzar aventura 🚀</button>
    <button @click="$router.push('/progress')">Ver mi progreso</button>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.home { background: #0f0f1a; min-height: 100vh; color: white; padding: 48px 24px; text-align: center; }
button { display: block; width: 100%; margin: 12px 0; padding: 16px; border-radius: 12px; background: #6c63ff; color: white; border: none; font-size: 1rem; cursor: pointer; }
</style>