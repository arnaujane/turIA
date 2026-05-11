import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: () => import('@/views/HomeView.vue') },
  { path: '/camera', component: () => import('@/views/CameraView.vue') },
  { path: '/audioguide', component: () => import('@/views/AudioguideView.vue') },
  { path: '/enigma', component: () => import('@/views/EnigmaView.vue') },
  { path: '/map', component: () => import('@/views/MapView.vue') },
  { path: '/progress', component: () => import('@/views/ProgressView.vue') },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router