# Handoff de integracion

Documento corto de Persona 3 para dejar claro que necesita cada companero en esta fase.

## Persona 1

- Consumir `id`, `name` y `coordinates` como contrato minimo de mapa.
- Usar `currentPointId` como fuente de verdad del punto actual.
- Destacar el siguiente punto desbloqueado como objetivo activo cuando exista.
- Mostrar todos los puntos si ayuda a la lectura visual, pero destacar solo el actual y el objetivo activo.
- Calcular distancia solo contra el objetivo activo.
- Soportar fallback sin geolocalizacion sin romper la pantalla.
- Configurar `VITE_GOOGLE_MAPS_API_KEY` fuera del repo.

## Persona 2

- Mantener `demo-data/` como fuente comun mientras el contenido siga mock.
- Respetar el contrato runtime actual de progreso:
  - `userId`
  - `currentPointId`
  - `score`
  - `completedChallenges`
  - `unlockedPoints`
  - `routeStatus`
- Mantener activas solo las reglas runtime actuales:
  - `correctAnswer`
  - `routeCompletionBonus`
- No activar implicitamente en runtime:
  - `photoValidated`
  - `hintPenalty`
  - `routeId` dentro de `progress`
- Usar backend como autoridad de progreso, scoring y persistencia.
- Adoptar Firestore real sin romper el vocabulario compartido cuando se conecte la capa definitiva.
