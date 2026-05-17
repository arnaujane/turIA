# Contrato de integracion de Persona 3

Documento de referencia para dejar claro como queda la capa Persona 3 tras rehacerla desde una rama nueva basada en `main`.

## Fuente de verdad

- La rama historica `integrations` ya no se usa como base tecnica.
- La implementacion activa de Persona 3 debe salir de una rama nueva creada desde `main`.
- La fuente de verdad comun sigue viviendo en:
  - `demo-data/`
  - `docs/prompts/`
  - `docs/rutas-demo/`
  - `scripts/`
- Frontend y backend pueden evolucionar, pero no deben romper estos contratos sin coordinacion previa.

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
- `city`
- `country`
- `constructionYear`
- `emoji`
- `baseDescription`
- `coordinates`
- `testImageRef`
- `visionAliases`
- `expectedRiddle`
- `answerOptions`
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

### `processPhotoDebug`

- `requestId`
- `matchedPointId`
- `usedFallback`
- `vision`
- `canonicalPlace`
- `promptInputs`
- `promptOutputs`
- `audio`
- `finalProcessPhoto`

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

## Reglas de integracion

- `processPhoto` sigue siendo el endpoint estable de producto.
- `processPhotoDebug` existe para Persona 3, QA y tuning de prompts.
- `name`, `city`, `country`, `constructionYear` y `emoji` deben salir de `demo-data/`.
- Vision no debe decidir por si sola la respuesta final de producto.
- Gemini solo debe devolver bloques creativos y estructurados.
- TTS solo debe sintetizar `audioGuideText`.

## Diseno objetivo del juego

- `photoValidated` forma parte del sistema de puntuacion previsto, pero no esta activa todavia en el runtime actual.
- `hintPenalty` forma parte del sistema de puntuacion previsto, pero no esta activa todavia en el runtime actual.
- `correctAnswer` ya esta reflejada por el backend actual.
- `routeCompletionBonus` ya esta reflejada por el backend actual.
- `routeId` se mantiene en el modelo logico de Firestore, pero no forma parte del progreso runtime actual.

## Contrato minimo de mapa

- Por punto se congelan como minimo `id`, `name` y `coordinates`.
- La API key de mapa es independiente del backend y se configura como `VITE_GOOGLE_MAPS_API_KEY`.

## Revision manual recomendada

- `GET /api/route`
- `POST /api/process-photo`
- `POST /api/process-photo-debug`
- `POST /api/check-answer`
- `GET /api/progress/:userId`
- `POST /api/progress`
