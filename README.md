# turIA

Base de trabajo compartida para **Mystery Tourist Lens**.

La rama `main` contiene hoy dos bloques reales:

- la capa comun de Persona 3 para ruta, datos, prompts, mapa, progreso e integracion
- el backend MVP de Persona 2 alineado con esos contratos

La implementacion funcional de `frontend/` aun no esta integrada en el repositorio. Por eso, la fuente de verdad de integracion sigue viviendo en la superficie preparada por Persona 3:

- `demo-data/`
- `docs/prompts/`
- `docs/rutas-demo/`
- `scripts/`

## Vision general y estado actual

- La demo canonica esta pensada para **Barcelona** y recorre 4 obras de **Antoni Gaudi**.
- Los contratos JSON de ruta, puntos, progreso y respuestas demo estan cerrados y validados.
- Backend ya existe y debe respetar esos contratos al evolucionar Vision, Gemini, TTS y persistencia.
- Google Maps y Firestore siguen preparados a nivel de contrato, documentacion y variables, pero no estan activados de forma real dentro del repo.
- El frontend sigue pendiente de integracion funcional; no debe tomarse una rama de frontend previa como referencia de implementacion.

## Que ha preparado Persona 3

Persona 3 no esta construyendo el frontend ni el backend completo. Su responsabilidad actual es la capa de juego, datos, integracion y coherencia entre equipos.

Lo ya preparado por Persona 3 es:

- una ruta demo cerrada de 4 puntos sobre Gaudi en Barcelona
- contratos JSON estables para ruta, puntos, progreso runtime y respuestas de respaldo
- prompts base para audioguia, enigma, validacion y contrato de prompts
- modelo logico objetivo de Firestore para progreso y ruta
- setup documental de Google Maps con contrato minimo de mapa
- snapshots canonicos de progreso runtime para comparar integraciones
- validaciones automatizadas para detectar roturas de contrato
- fallbacks y respuestas de referencia para no depender de APIs reales durante la demo

## Contratos congelados hoy

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

### Progreso runtime actual

- `userId`
- `currentPointId`
- `score`
- `completedChallenges`
- `unlockedPoints`
- `routeStatus`

### Reglas runtime activas hoy

- `correctAnswer`: activa
- `routeCompletionBonus`: activa
- `photoValidated`: no activa todavia
- `hintPenalty`: no activa todavia
- `routeId`: fuera del progreso runtime actual

## Lo que necesita saber Frontend

Frontend debe tomar la capa de Persona 3 como fuente de verdad de nombres de campo y flujo demo.

- El flujo demo es lineal: punto actual, foto, audioguia, enigma, validacion y desbloqueo del siguiente punto.
- `currentPointId` determina el punto actual de la experiencia.
- `nextPointId` determina el siguiente objetivo de la ruta.
- El punto inicial es `route.demo.json -> startPointId`.
- El orden canonico es `route.demo.json -> pointOrder`.
- El contrato minimo de mapa por punto es `id`, `name` y `coordinates`.
- El progreso runtime actual solo usa `userId`, `currentPointId`, `score`, `completedChallenges`, `unlockedPoints` y `routeStatus`.
- `routeId` no forma parte del runtime actual aunque exista en el modelo logico de Firestore.
- Frontend no debe renombrar campos por comodidad visual sin coordinar antes la capa comun de Persona 3.
- `guideText` debe poder mostrarse tal cual y reutilizarse en audio.
- `VITE_GOOGLE_MAPS_API_KEY` es necesaria para activar el mapa real, pero la clave no se guarda en el repo.

### Comportamiento funcional esperado del mapa

- Si hay permisos de geolocalizacion, el mapa debe mostrar ubicacion actual del usuario.
- El mapa debe mostrar el punto actual.
- El mapa debe mostrar el siguiente punto desbloqueado como objetivo activo cuando exista.
- Se pueden renderizar todos los puntos de la ruta, pero solo se deben destacar visualmente el punto actual y el objetivo activo.
- La distancia debe calcularse solo contra el objetivo activo.
- Si el usuario niega geolocalizacion, el mapa debe seguir mostrando la ruta y los puntos relevantes, pero sin posicion actual ni distancia.

Referencia funcional: `docs/rutas-demo/maps-setup.md`

### Campos que frontend consumira con mas frecuencia

- Ruta: `id`, `name`, `locale`, `startPointId`, `pointOrder`, `totalPoints`, `scoringRules`
- Punto: `id`, `slug`, `name`, `baseDescription`, `coordinates`, `testImageRef`, `expectedRiddle`, `correctAnswer`, `nextPointId`
- Respuesta de `processPhoto`: `pointId`, `detectedPlace`, `guideText`, `audio`, `riddle`, `nextPointId`, `routeStatus`
- Respuesta de `checkAnswer`: `isCorrect`, `awardedScore`, `unlockedPointId`, `routeStatus`, `feedback`

## Lo que necesita saber Backend

Backend debe consumir `demo-data/` como fuente comun mientras no exista una capa real de contenido o configuracion.

- Backend debe respetar los contratos de `processPhoto`, `checkAnswer` y progreso.
- Backend debe mantener estable este vocabulario compartido:
  - `pointId`
  - `nextPointId`
  - `currentPointId`
  - `completedChallenges`
  - `unlockedPoints`
  - `routeStatus`
- En el runtime actual, solo se reflejan reglas ya activas:
  - `correctAnswer`
  - `routeCompletionBonus`
- En el runtime actual, siguen fuera:
  - `photoValidated`
  - `hintPenalty`
  - `routeId` dentro de `progress`
- La recomendacion por defecto es que backend calcule progreso, calcule puntuacion y persista progreso; frontend solo refleja estado y envia eventos.
- Si Vision o Gemini fallan, el fallback debe seguir apoyandose en `sample-responses.json`.
- Firestore sigue siendo el objetivo de persistencia real, aunque hoy el backend conserve progreso en memoria.
- Backend no debe compensar discrepancias inventando nuevos campos fuera del contrato comun.

Referencia funcional: `docs/rutas-demo/contrato-integracion.md` y `docs/rutas-demo/firestore-model.md`

## Estado actual de integraciones

- Contratos de Persona 3: listos y validados
- Backend MVP: implementado en `backend/`
- Frontend: no integrado aun en el repo como implementacion funcional
- Google Maps real: pendiente de proyecto compartido, clave y activacion
- Firestore real: pendiente de adopcion por backend
- Vision, Gemini y TTS reales: preparados por adaptador, no obligatorios para la demo mock

## Variables de entorno relevantes

Usa `.env.example` como plantilla. En esta fase no se suben claves reales ni se exige tener `gcloud` o `firebase` instalados.

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

## Comandos de validacion

- `npm run validate:demo-data`: valida contratos, referencias cruzadas y snapshots runtime
- `npm run smoke:persona3`: recorre el flujo demo y comprueba que ruta, progreso y respuestas siguen alineados
- `npm run check:persona3`: ejecuta ambas comprobaciones seguidas

## Backend MVP disponible

El backend MVP de Persona 2 ya esta integrado en `main` y se apoya en los contratos de Persona 3.

### Endpoints disponibles

- `GET /api/health`
- `GET /api/route`
- `POST /api/analyze-image`
- `POST /api/generate-guide`
- `POST /api/generate-audio`
- `POST /api/process-photo`
- `POST /api/check-answer`
- `GET /api/progress/:userId`
- `POST /api/progress`

### Comportamiento actual

- El modo por defecto usa `demo-data/` y `sample-responses.json` para dar respuestas estables.
- `processPhoto` acepta `multipart/form-data` con el campo `image`.
- El progreso se guarda en memoria mientras no exista Firestore real.
- Existe un adaptador `mock/live` para Vision, Vertex AI y Text-to-Speech controlado por variables de entorno.
- Si `GOOGLE_CLOUD_USE_REAL_APIS=false`, backend sigue en modo demo.
- Si `GOOGLE_CLOUD_USE_REAL_APIS=true`, backend intenta usar Google Cloud real mediante ADC.

### Scripts utiles para backend

- `npm run backend:dev`
- `npm run backend:start`
- `node backend/demo-backend.js`

## Documentacion recomendada

- Contrato general: `docs/rutas-demo/contrato-integracion.md`
- Flujo y estados: `docs/rutas-demo/estructura-y-flujo.md`
- Setup funcional de mapa: `docs/rutas-demo/maps-setup.md`
- Modelo logico y persistencia objetivo: `docs/rutas-demo/firestore-model.md`
- Handoff operativo: `docs/rutas-demo/handoff-integracion.md`
- Planning operativo de Persona 3: `docs/rutas-demo/persona3-planning.md`
- Contrato de prompts: `docs/prompts/prompt-contract.md`

## Siguientes pasos de integracion

1. Persona 1 implementa el mapa sobre el contrato ya fijado y con `VITE_GOOGLE_MAPS_API_KEY` real fuera del repo.
2. Persona 2 adopta persistencia real manteniendo el contrato runtime actual.
3. El equipo ejecuta una prueba funcional completa con foto, audioguia, enigma, desbloqueo, mapa y progreso.
4. Si entran Vision, Gemini o TTS reales, backend debe conservar el contrato y usar fallback cuando sea necesario.
