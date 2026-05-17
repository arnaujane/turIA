# turIA

Base de trabajo compartida para **Mystery Tourist Lens**.

## Estado actual

La base tecnica real del proyecto vive hoy en `main` y se reparte asi:

- `backend/`: backend MVP de Persona 2 con endpoints reales, mocks y adaptador Google Cloud
- `frontend/`: frontend visual Vue/Ionic todavia hardcodeado
- `demo-data/`: datos canonicos de la ruta y fallbacks de Persona 3
- `docs/prompts/`: prompts versionados que backend debe consumir
- `docs/rutas-demo/`: contratos, flujo, Firestore, mapa y setup de Google Cloud
- `scripts/`: validaciones y smoke checks de Persona 3

La rama historica `integrations` queda como referencia previa. La reimplementacion activa de Persona 3 debe salir de una rama nueva creada desde `main`.

## Responsabilidad actual de Persona 3

Persona 3 gobierna:

- la ruta demo
- los datos canonicos de cada punto
- los contratos de integracion
- los prompts
- los fallbacks
- la guia operativa de Google Cloud

No construye el frontend completo ni el backend completo, pero si define la capa comun que ambos consumen.

## Contratos compartidos

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

### Progreso runtime actual

- `userId`
- `currentPointId`
- `score`
- `completedChallenges`
- `unlockedPoints`
- `routeStatus`

## Flujo esperado entre APIs

1. Frontend envia imagen al backend.
2. Vision aporta evidencia tecnica.
3. Backend resuelve `matchedPointId`.
4. Backend carga `canonicalPlace` desde `demo-data/`.
5. Gemini genera `placeInfo`, `audioGuideText` y `riddle` en JSON estructurado.
6. Text-to-Speech sintetiza `audioGuideText`.
7. `processPhoto` devuelve el contrato estable al frontend.
8. `processPhotoDebug` expone la traza extendida para Persona 3 y QA.

## Frontend hoy

- Existe en `frontend/`.
- Sigue con pantallas hardcodeadas.
- No consume todavia `/api/process-photo` ni `/api/process-photo-debug`.
- No debe tomarse como restriccion del contrato final, solo como base visual.

## Backend hoy

Endpoints disponibles:

- `GET /api/health`
- `GET /api/route`
- `POST /api/analyze-image`
- `POST /api/generate-guide`
- `POST /api/generate-audio`
- `POST /api/process-photo`
- `POST /api/process-photo-debug`
- `POST /api/check-answer`
- `GET /api/progress/:userId`
- `POST /api/progress`

El backend:

- usa `demo-data/` como fuente compartida
- soporta modo mock y modo real con Google Cloud
- ya no debe depender de prompts hardcodeados, sino de `docs/prompts/`

## Variables de entorno relevantes

Raiz:

- `VITE_GOOGLE_MAPS_API_KEY`
- `VITE_API_BASE_URL`
- `GOOGLE_CLOUD_PROJECT_ID`
- `GOOGLE_CLOUD_REGION`
- `FIRESTORE_USERS_COLLECTION`
- `FIRESTORE_PROGRESS_SUBCOLLECTION`
- `FIRESTORE_ROUTES_COLLECTION`
- `FIRESTORE_DEMO_ROUTE_ID`
- `DEMO_ROUTE_LOCALE`
- `DEMO_USE_STATIC_FALLBACKS`
- `DEMO_ENABLE_MOCK_PROGRESS`

Backend:

- `GOOGLE_CLOUD_USE_REAL_APIS`
- `VERTEX_MODEL`
- `TTS_VOICE_NAME`

## Comandos utiles

- `npm run validate:demo-data`
- `npm run smoke:persona3`
- `npm run check:persona3`
- `npm run backend:dev`
- `npm run backend:start`
- `node backend/demo-backend.js`

## Documentacion recomendada

- [docs/rutas-demo/contrato-integracion.md](docs/rutas-demo/contrato-integracion.md)
- [docs/rutas-demo/estructura-y-flujo.md](docs/rutas-demo/estructura-y-flujo.md)
- [docs/rutas-demo/google-cloud-persona3-setup.md](docs/rutas-demo/google-cloud-persona3-setup.md)
- [docs/rutas-demo/firestore-model.md](docs/rutas-demo/firestore-model.md)
- [docs/prompts/prompt-contract.md](docs/prompts/prompt-contract.md)

## Validacion actual

`npm run check:persona3` valida:

- coherencia de ruta
- contratos JSON
- answer options canonicas
- snapshots de progreso
- fallbacks
- consistencia basica de `processPhotoDebug`
