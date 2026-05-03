# Checklist de integracion

## Datos

- `route.demo.json` y `points.demo.json` validan sin errores.
- `startPointId` existe y coincide con el primer elemento de `pointOrder`.
- Todos los `nextPointId` apuntan a puntos reales o terminan en `null`.

## Backend

- `process-photo` usa nombres de campo alineados con `sample-responses.json`.
- `check-answer` devuelve `isCorrect`, `awardedScore`, `routeStatus` y `feedback`.
- Existe fallback estable si Vision o Gemini fallan.

## Frontend

- El mapa puede leer `coordinates` desde `points.demo.json`.
- El estado global puede persistir `currentPointId`, `score`, `completedChallenges` y `unlockedPoints`.
- Las pantallas de resultado consumen `guideText`, `audio`, `riddle` y `routeStatus`.

## Progreso

- Firestore o mock local usan el mismo vocabulario de campos.
- El ultimo punto cambia el estado de la ruta a `completed`.
- La puntuacion no baja por debajo de 0 al aplicar penalizaciones.

