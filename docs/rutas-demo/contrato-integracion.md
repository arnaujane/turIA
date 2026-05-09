# Contrato de integracion de Persona 3

Documento de referencia para dejar claro que significa hoy `integrations` y que partes del juego siguen siendo objetivo futuro.

## Fuente de verdad

- `integrations` es la fuente de verdad comun para `demo-data/`, `docs/prompts/`, `docs/rutas-demo/` y `scripts/`.
- Si frontend o backend necesitan cambiar nombres de campo, primero debe actualizarse esta rama.
- La rama `frontend` accesible hoy no se toma como referencia funcional de integracion.

## Contrato runtime actual

### Ruta

- `id`
- `name`
- `locale`
- `startPointId`
- `pointOrder`
- `totalPoints`
- `scoringRules`

### Punto

- `id`
- `slug`
- `name`
- `baseDescription`
- `coordinates`
- `testImageRef`
- `expectedRiddle`
- `correctAnswer`
- `nextPointId`

### `processPhoto`

- `pointId`
- `detectedPlace`
- `guideText`
- `audio`
- `riddle`
- `nextPointId`
- `routeStatus`

### `checkAnswer`

- `isCorrect`
- `awardedScore`
- `unlockedPointId`
- `routeStatus`
- `feedback`

### Progreso runtime

- `userId`
- `currentPointId`
- `score`
- `completedChallenges`
- `unlockedPoints`
- `routeStatus`

## Diseno objetivo del juego

- `photoValidated` forma parte del sistema de puntuacion previsto, pero no esta activa todavia en el runtime actual.
- `hintPenalty` forma parte del sistema de puntuacion previsto, pero no esta activa todavia en el runtime actual.
- `correctAnswer` ya esta reflejada por el backend actual.
- `routeCompletionBonus` ya esta reflejada por el backend actual.
- `routeId` se mantiene en el modelo logico de Firestore, pero no forma parte del progreso runtime actual.

## Contrato minimo de mapa

- Por punto solo se congelan `id`, `name` y `coordinates`.
- Con eso debe poder mostrarse:
  - ubicacion actual del usuario
  - punto actual
  - siguiente punto desbloqueado
  - distancia aproximada

## Discrepancias abiertas con backend

- El backend actual no aplica `photoValidated`.
- El backend actual no aplica `hintPenalty`.
- El backend actual no guarda `routeId` en el progreso runtime.
- Estas discrepancias no deben compensarse inventando campos nuevos en frontend.

## Revision manual recomendada

- `GET /api/route`
- `POST /api/process-photo`
- `POST /api/check-answer`
- `GET /api/progress/:userId`
- `POST /api/progress`
