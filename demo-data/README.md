# demo-data

Datos estaticos y contratos de respaldo para la demo de Persona 3.

## Archivos

- `route.demo.json`: metadatos de la ruta, orden de puntos y reglas de puntuacion de diseno.
- `points.demo.json`: definicion de los puntos de interes y cadena de desbloqueo.
- `sample-responses.json`: ejemplos estables de respuesta del backend para integracion y fallback.
- `progress.demo.json`: estado de progreso runtime de ejemplo para pruebas locales.

## Convenciones

- Los IDs usan kebab-case estable: `demo-route`, `point-1`, `point-2`.
- `startPointId` debe existir dentro de `points.demo.json`.
- `pointOrder` debe contener todos los puntos exactamente una vez.
- `nextPointId` apunta al siguiente punto o vale `null` en el ultimo.
- `testImageRef` es una referencia logica; no implica que la imagen exista ya en el repo.
- `correctAnswer` debe reflejar exactamente la opcion valida que luego se espera en validacion.
- `progress.demo.json` representa el contrato runtime actual y por ahora no incluye `routeId`.

## Uso en la demo

- Frontend puede consumir estos datos como mocks mientras backend y Firestore no esten integrados.
- Backend puede usarlos como respaldo cuando Vision o Gemini no devuelvan una respuesta estable.
- QA e integracion pueden verificar el flujo completo sin depender de resultados imprevisibles.

## Nota sobre puntuacion

- `route.demo.json -> scoringRules` describe el juego objetivo completo.
- El backend actual ya aplica `correctAnswer` y `routeCompletionBonus`.
- `photoValidated` y `hintPenalty` siguen documentados como reglas de diseno, pero no se consideran activas en el runtime actual.
- `progress.demo.json` debe mantenerse alineado con el runtime actual para no dar senales falsas a frontend o backend.

## Edicion segura

- Manten sincronizados `route.demo.json`, `points.demo.json` y `sample-responses.json`.
- Ejecuta `npm run check:persona3` despues de cambiar cualquier JSON o script de validacion.
- Si cambias nombres de campos, actualiza tambien la documentacion en `docs/prompts/` y `docs/rutas-demo/`.
