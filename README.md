# turIA

Base de trabajo compartida para el proyecto **Mystery Tourist Lens**.

## Rama `integrations`

Esta seccion resume el trabajo preparado en la rama `integrations`, centrado en un enfoque `JSON first`: datos demo, prompts, documentacion de ruta y tooling de validacion. La idea es que frontend y backend tengan aqui una referencia comun de integracion y que luego cada rama pueda ampliar el `README` con sus propias decisiones y avances.

### Estructura incorporada en `integrations`

```text
turIA/
├── demo-data/
├── docs/
│   ├── prompts/
│   └── rutas-demo/
├── scripts/
├── .env.example
├── .gitignore
└── package.json
```

### Scripts disponibles

- `npm run validate:demo-data`: valida contratos, IDs, referencias cruzadas y consistencia basica de los JSON.
- `npm run smoke:persona3`: recorre el flujo demo y comprueba que la ruta, el progreso y las respuestas de ejemplo estan alineados.
- `npm run check:persona3`: ejecuta ambas comprobaciones seguidas.

### Areas cubiertas por `integrations`

- `demo-data/`: contratos y datos estables para ruta, puntos, progreso y respuestas de respaldo.
- `docs/prompts/`: plantillas de prompts para audioguia, enigma y validacion.
- `docs/rutas-demo/`: documentacion funcional de ruta, puntuacion, mapa y modelo logico de Firestore.

### Ruta demo actual

La ruta base preparada en `integrations` esta pensada para **Barcelona** y recorre 4 obras de **Antoni Gaudi**:

1. `point-1`: Sagrada Familia
2. `point-2`: Casa Batllo
3. `point-3`: La Pedrera
4. `point-4`: Park Guell

Los datos principales viven en:

- `demo-data/route.demo.json`
- `demo-data/points.demo.json`
- `demo-data/sample-responses.json`
- `demo-data/progress.demo.json`

Ademas, los `baseDescription` de cada punto ya estan redactados con tono turistico y pensados para servir como fuente fiable de contexto al generar audioguias, enigmas y fallbacks.

### Lo que debe saber frontend

Siguiendo el reparto original del PDF, frontend es responsable de la experiencia de usuario, la navegacion, el flujo de foto, la audioguia, el enigma, el mapa y el progreso visible. Para integrarse con lo preparado en `integrations`, frontend debe asumir lo siguiente:

- El flujo demo es lineal: un punto actual, un enigma, un desbloqueo y un siguiente punto definido por `nextPointId`.
- El punto inicial es `route.demo.json -> startPointId`.
- El orden canonico de la ruta es `route.demo.json -> pointOrder`.
- El mapa debe leer coordenadas desde `points.demo.json -> coordinates`.
- El estado minimo que frontend debe poder guardar o reflejar coincide con el PDF y con `progress.demo.json`: `currentPointId`, `score`, `completedChallenges`, `unlockedPoints`, `routeStatus`.
- El identificador anonimo sugerido por el PDF sigue siendo valido: `localStorage -> mystery_user_id`.
- Mientras backend real no este estable, frontend puede apoyarse en `sample-responses.json` para simular `processPhoto` y `checkAnswer`.
- Los nombres de campo no deben cambiarse por conveniencia de UI sin coordinarlo, porque son la base compartida de integracion.
- `guideText` esta planteado para poder mostrarse tal cual en pantalla y tambien reutilizarse en audio.
- `baseDescription` no es texto decorativo: es la base canonica sobre la que debe construirse la generacion con Gemini.

### Campos que frontend consumira con mas frecuencia

- Ruta: `id`, `name`, `locale`, `startPointId`, `pointOrder`, `totalPoints`, `scoringRules`
- Punto: `id`, `name`, `baseDescription`, `coordinates`, `testImageRef`, `expectedRiddle`, `correctAnswer`, `nextPointId`
- Respuesta de `processPhoto`: `detectedPlace`, `guideText`, `audio`, `riddle`, `nextPointId`, `routeStatus`
- Respuesta de `checkAnswer`: `isCorrect`, `awardedScore`, `unlockedPointId`, `routeStatus`, `feedback`

### Lo que debe saber backend

Siguiendo el PDF, backend es responsable de llamar de forma segura a Google Cloud, generar la audioguia, el enigma, el audio y validar la respuesta. Para integrarse con lo preparado en `integrations`, backend debe asumir lo siguiente:

- Existe una ruta demo cerrada y estable en `demo-data/` que puede usarse como fuente de verdad temporal para pruebas e integracion.
- Los prompts base que backend deberia usar o tomar como referencia estan en `docs/prompts/`.
- Backend debe tomar como referencia adicional `docs/prompts/prompt-contract.md` y `docs/prompts/api-optimization-notes.md` para usar Vision, Gemini y TTS de forma consistente.
- El vocabulario compartido de la demo debe mantenerse estable: `pointId`, `nextPointId`, `currentPointId`, `completedChallenges`, `unlockedPoints`, `routeStatus`.
- Si Vision o Gemini fallan, backend debe poder devolver un fallback coherente usando `sample-responses.json` o datos equivalentes.
- Los endpoints del PDF siguen siendo la referencia de integracion: especialmente `POST /api/process-photo` y `POST /api/check-answer` para el MVP.
- La respuesta de backend debe respetar los contratos ya preparados en `integrations` para que frontend y progreso no se rompan.
- El modelo logico de Firestore preparado en `integrations` esta documentado en `docs/rutas-demo/firestore-model.md`.
- Los prompts se han afinado para trabajar con temperatura baja, salida controlada y validacion estricta del JSON antes de responder al frontend.

### Expectativas concretas para backend

- `processPhoto` debe devolver un punto detectado de la ruta, texto de guia, audio, enigma, siguiente punto y estado de ruta.
- `checkAnswer` debe devolver si la respuesta es correcta, la puntuacion otorgada, el desbloqueo correspondiente y feedback breve.
- `routeStatus` debe usar estos estados: `locked`, `in_progress`, `completed`.
- Si el usuario completa el ultimo punto, la respuesta debe cerrar la ruta con `routeStatus = completed`.
- No deben exponerse claves ni credenciales en frontend; toda llamada privada a Google Cloud debe quedarse en backend.
- Backend no deberia pasar el payload bruto de Vision a Gemini; primero debe resumirlo en contexto pequeno y util.

### Variables de entorno

Usa `.env.example` como plantilla. En esta primera fase no se suben claves reales ni se exige tener `gcloud` o `firebase` instalados.

### Siguiente uso recomendado

1. Revisar la ruta de Barcelona/Gaudi en `demo-data/`.
2. Ejecutar `npm run check:persona3`.
3. Usar estos contratos como base al integrar frontend, backend, mapa y progreso.
