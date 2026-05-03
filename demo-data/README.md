# demo-data

Datos estáticos y contratos de respaldo para la demo de Persona 3.

## Archivos

- `route.demo.json`: metadatos de la ruta, orden de puntos y reglas de puntuación.
- `points.demo.json`: definición de los puntos de interés y cadena de desbloqueo.
- `sample-responses.json`: ejemplos estables de respuesta del backend para integración y fallback.
- `progress.demo.json`: estado de progreso de ejemplo para pruebas locales.

## Convenciones

- Los IDs usan kebab-case estable: `demo-route`, `point-1`, `point-2`.
- `startPointId` debe existir dentro de `points.demo.json`.
- `pointOrder` debe contener todos los puntos exactamente una vez.
- `nextPointId` apunta al siguiente punto o vale `null` en el último.
- `testImageRef` es una referencia lógica; no implica que la imagen exista ya en el repo.
- `correctAnswer` debe reflejar exactamente la opción válida que luego se espera en validación.

## Uso en la demo

- Frontend puede consumir estos datos como mocks mientras backend y Firestore no estén integrados.
- Backend puede usarlos como respaldo cuando Vision o Gemini no devuelvan una respuesta estable.
- QA e integración pueden verificar el flujo completo sin depender de resultados imprevisibles.

## Edición segura

- Mantén sincronizados `route.demo.json`, `points.demo.json` y `sample-responses.json`.
- Ejecuta `npm run check:persona3` después de cambiar cualquier JSON.
- Si cambias nombres de campos, actualiza también la documentación en `docs/prompts/` y `docs/rutas-demo/`.

