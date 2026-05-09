# Checklist de integracion

Checklist de Persona 3 para revisar contratos sin tocar `backend/` ni `frontend/`.

## Datos canonicos

- `route.demo.json` y `points.demo.json` validan sin errores.
- `startPointId` existe y coincide con el primer elemento de `pointOrder`.
- Todos los `nextPointId` apuntan a puntos reales o terminan en `null`.
- Cada `expectedRiddle` y `correctAnswer` sigue alineado con `sample-responses.json`.
- `testImageRef` queda estable como referencia logica compartida.

## Contrato runtime actual

- `processPhoto` mantiene: `pointId`, `detectedPlace`, `guideText`, `audio`, `riddle`, `nextPointId`, `routeStatus`.
- `checkAnswer` mantiene: `isCorrect`, `awardedScore`, `unlockedPointId`, `routeStatus`, `feedback`.
- `progress.demo.json` mantiene: `userId`, `currentPointId`, `score`, `completedChallenges`, `unlockedPoints`, `routeStatus`.
- `routeId` no forma parte del progreso runtime actual.

## Mapa

- El contrato minimo por punto para mapa sigue siendo `id`, `name`, `coordinates`.
- Con eso frontend puede mostrar ubicacion actual, punto actual, siguiente punto desbloqueado y distancia aproximada.
- `VITE_GOOGLE_MAPS_API_KEY` queda documentada, pero la clave real no entra en el repo.

## Progreso y puntuacion

- El ultimo punto cambia `routeStatus` a `completed`.
- El backend actual ya refleja `correctAnswer` y `routeCompletionBonus`.
- `photoValidated` y `hintPenalty` siguen siendo reglas de diseno, no reglas activas del runtime actual.
- Los ejemplos de progreso no deben insinuar puntuacion runtime que backend todavia no aplica.

## Handoff a companeros

- Persona 1 no debe renombrar campos por conveniencia de UI.
- Persona 2 no debe romper el vocabulario compartido al evolucionar endpoints.
- Si backend adopta `routeId` en runtime o activa nuevas reglas de puntuacion, antes debe actualizarse esta carpeta como fuente de verdad.
