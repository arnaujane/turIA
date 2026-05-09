# turIA

Base de trabajo compartida para el proyecto **Mystery Tourist Lens**.

La rama `integrations` funciona como referencia comun para Persona 3 con enfoque `JSON first`: contratos estables, datos demo, prompts y documentacion de integracion para que frontend y backend no trabajen con supuestos distintos.

## Estructura cubierta en `integrations`

```text
turIA/
|-- demo-data/
|-- docs/
|   |-- prompts/
|   `-- rutas-demo/
|-- scripts/
|-- .env.example
|-- .gitignore
`-- package.json
```

## Scripts disponibles

- `npm run validate:demo-data`: valida contratos, IDs, referencias cruzadas y coherencia de los JSON.
- `npm run smoke:persona3`: recorre el flujo demo y comprueba que ruta, progreso y respuestas de ejemplo sigan alineados.
- `npm run check:persona3`: ejecuta ambas comprobaciones seguidas.

## Areas preparadas por Persona 3

- `demo-data/`: ruta demo, puntos, progreso y respuestas fallback estables.
- `docs/prompts/`: prompts de audioguia, enigma, validacion y contrato de prompts.
- `docs/rutas-demo/`: documentacion funcional de ruta, mapa, progreso, Firestore y contrato de integracion.
- `scripts/`: validaciones para detectar roturas de contrato antes de integrar con otras ramas.

## Ruta demo actual

La demo canonica preparada en `integrations` esta pensada para **Barcelona** y recorre 4 obras de **Antoni Gaudi**:

1. `point-1`: Sagrada Familia
2. `point-2`: Casa Batllo
3. `point-3`: La Pedrera
4. `point-4`: Park Guell

Los datos principales viven en:

- `demo-data/route.demo.json`
- `demo-data/points.demo.json`
- `demo-data/sample-responses.json`
- `demo-data/progress.demo.json`

## Lo que debe saber frontend

Frontend debe tomar `integrations` como fuente de verdad de nombres de campo y flujo demo.

- El flujo demo es lineal: un punto actual, un enigma, un desbloqueo y un siguiente punto definido por `nextPointId`.
- El punto inicial es `route.demo.json -> startPointId`.
- El orden canonico de la ruta es `route.demo.json -> pointOrder`.
- El mapa debe leer coordenadas desde `points.demo.json -> coordinates`.
- El contrato minimo de mapa por punto es `id`, `name` y `coordinates`.
- El progreso runtime actual usa estos campos: `userId`, `currentPointId`, `score`, `completedChallenges`, `unlockedPoints`, `routeStatus`.
- `routeId` no forma parte del progreso runtime actual aunque exista en el modelo logico de Firestore.
- El identificador anonimo sugerido por el MVP sigue siendo valido: `localStorage -> mystery_user_id`.
- Mientras backend real no este estable, frontend puede apoyarse en `sample-responses.json` para simular `processPhoto` y `checkAnswer`.
- Los nombres de campo no deben cambiarse por conveniencia de UI sin coordinarlo antes con `integrations`.
- `guideText` esta planteado para poder mostrarse tal cual en pantalla y tambien reutilizarse en audio.

### Campos que frontend consumira con mas frecuencia

- Ruta: `id`, `name`, `locale`, `startPointId`, `pointOrder`, `totalPoints`, `scoringRules`
- Punto: `id`, `slug`, `name`, `baseDescription`, `coordinates`, `testImageRef`, `expectedRiddle`, `correctAnswer`, `nextPointId`
- Respuesta de `processPhoto`: `pointId`, `detectedPlace`, `guideText`, `audio`, `riddle`, `nextPointId`, `routeStatus`
- Respuesta de `checkAnswer`: `isCorrect`, `awardedScore`, `unlockedPointId`, `routeStatus`, `feedback`

## Lo que debe saber backend

Backend debe tomar `integrations` como referencia comun para contratos, fallback y prompts.

- Existe una ruta demo cerrada y estable en `demo-data/` que puede usarse como fuente de verdad temporal para pruebas e integracion.
- Los prompts base que backend debe usar o tomar como referencia estan en `docs/prompts/`.
- Backend debe usar como referencia adicional `docs/prompts/prompt-contract.md` y `docs/prompts/api-optimization-notes.md` para trabajar con Vision, Gemini y TTS de forma consistente.
- El vocabulario compartido de la demo debe mantenerse estable: `pointId`, `nextPointId`, `currentPointId`, `completedChallenges`, `unlockedPoints`, `routeStatus`.
- Si Vision o Gemini fallan, backend debe poder devolver un fallback coherente usando `sample-responses.json` o datos equivalentes.
- Los endpoints del MVP siguen siendo la referencia de integracion, especialmente `POST /api/process-photo` y `POST /api/check-answer`.
- La respuesta de backend debe respetar los contratos preparados en `integrations` para que frontend y progreso no se rompan.
- El modelo logico de Firestore preparado por Persona 3 esta documentado en `docs/rutas-demo/firestore-model.md`.

### Aclaraciones importantes sobre progreso y puntuacion

- El progreso runtime actual no incluye `routeId`.
- `routeId` se mantiene solo en el modelo logico objetivo de Firestore hasta que backend lo adopte de forma real.
- La documentacion de scoring conserva estas reglas de diseno: `photoValidated`, `correctAnswer`, `hintPenalty`, `routeCompletionBonus`.
- En el runtime actual, backend ya refleja `correctAnswer` y `routeCompletionBonus`.
- En el runtime actual, `photoValidated` y `hintPenalty` siguen siendo reglas de diseno no activas.
- Los ejemplos de `progress.demo.json` y `sample-responses.json` ya estan alineados con ese runtime actual para evitar falsas expectativas.

### Expectativas concretas para backend

- `processPhoto` debe devolver punto detectado, texto de guia, audio, enigma, siguiente punto y estado de ruta.
- `checkAnswer` debe devolver si la respuesta es correcta, la puntuacion otorgada, el desbloqueo correspondiente y feedback breve.
- `routeStatus` debe usar solo estos estados: `locked`, `in_progress`, `completed`.
- Si el usuario completa el ultimo punto, la respuesta debe cerrar la ruta con `routeStatus = completed`.
- Backend no deberia pasar el payload bruto de Vision a Gemini; primero debe resumirlo en contexto pequeno y util.
- Backend debe validar el JSON de Gemini antes de devolverlo a frontend y usar fallback si la salida rompe contrato.

## Variables de entorno

Usa `.env.example` como plantilla. En esta fase no se suben claves reales ni se exige tener `gcloud` o `firebase` instalados.

Variables relevantes para integracion:

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

## Documentacion recomendada

- Contrato general: `docs/rutas-demo/contrato-integracion.md`
- Flujo y estados: `docs/rutas-demo/estructura-y-flujo.md`
- Modelo logico de Firestore: `docs/rutas-demo/firestore-model.md`
- Setup de mapa: `docs/rutas-demo/maps-setup.md`
- Planning operativo de Persona 3: `docs/rutas-demo/persona3-planning.md`

## Siguiente uso recomendado

1. Revisar la ruta de Barcelona/Gaudi en `demo-data/`.
2. Ejecutar `npm run check:persona3`.
3. Usar estos contratos como base al integrar frontend, backend, mapa y progreso.
