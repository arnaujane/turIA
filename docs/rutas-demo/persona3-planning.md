# Planning de Persona 3

Hoja de ruta practica para desarrollar tu parte del proyecto a partir de lo que ya esta montado.

## Punto de partida

Ya tienes resuelto:

- estructura base del repo para tu area
- contratos en `demo-data/`
- prompts iniciales para Gemini
- documentacion de ruta, mapa y Firestore
- scripts para validar y hacer smoke check

Eso significa que ya no estas en fase de "preparar carpetas", sino en fase de convertir esta base en una demo integrable y defendible.

## Prioridad 1: cerrar la ruta demo

Objetivo: que la ruta de Barcelona/Gaudi quede completamente definida y lista para consumo por frontend y backend.

Tareas:

1. Revisar los 4 puntos y confirmar que el orden final es el deseado.
2. Refinar `baseDescription` si quereis un tono mas historico, mas turistico o mas gamificado.
3. Preparar una carpeta o referencia real para las imagenes de prueba de cada punto.
4. Revisar que cada `expectedRiddle` y `correctAnswer` sean faciles de reconocer por usuario y por backend.
5. Ejecutar `npm run check:persona3` cada vez que cambies datos.

Resultado esperado:

- una ruta demo estable que ya no cambia de estructura

## Prioridad 2: alinear a frontend y backend con tus contratos

Objetivo: que tus companeros no trabajen con supuestos distintos a los tuyos.

Tareas:

1. Compartir el `README` actualizado como referencia comun.
2. Indicar a Persona 1 que el mapa, el progreso y el flujo visual deben apoyarse en `demo-data/` y `sample-responses.json`.
3. Indicar a Persona 2 que los prompts y contratos de respuesta ya estan definidos.
4. Revisar con ambos que los nombres de campo no cambian.
5. Resolver pronto cualquier discrepancia entre UI esperada y contrato de backend.

Resultado esperado:

- frontend y backend consumen la misma estructura de datos

## Prioridad 3: preparar la parte de mapa

Objetivo: dejar la integracion de mapa practicamente decidida aunque aun no este completa.

Tareas:

1. Confirmar que las coordenadas de los 4 puntos son las definitivas.
2. Validar que el frontend solo necesita `id`, `name` y `coordinates` para pintar el mapa.
3. Documentar con Persona 1 como se mostraran:
   - ubicacion actual
   - punto actual
   - siguiente punto desbloqueado
   - distancia aproximada
4. Tener claro el contrato de `VITE_GOOGLE_MAPS_API_KEY` para cuando se active la clave real.

Resultado esperado:

- mapa integrable sin redisenar los datos

## Prioridad 4: preparar progreso y Firestore

Objetivo: que el guardado de progreso este decidido antes de implementarlo.

Tareas:

1. Revisar `docs/rutas-demo/firestore-model.md`.
2. Confirmar con Persona 2 si el progreso se escribira desde backend, desde frontend o mixto.
3. Mantener como minimo estos campos: `currentPointId`, `score`, `completedChallenges`, `unlockedPoints`, `routeStatus`.
4. Definir cuando sube la puntuacion:
   - foto validada
   - respuesta correcta
   - bonus final
   - penalizacion por pista
5. Preparar casos de prueba de progreso normal y progreso completado.

Resultado esperado:

- modelo de progreso claro y facil de implementar

## Prioridad 5: pruebas end-to-end de la demo

Objetivo: que tu parte pueda demostrar que el juego completo tiene sentido.

Tareas:

1. Probar flujo ideal: foto -> guia -> audio -> enigma -> respuesta correcta -> desbloqueo.
2. Probar flujo con error: Vision falla -> fallback -> la demo sigue viva.
3. Probar flujo con respuesta incorrecta.
4. Probar ultimo punto con cierre correcto de ruta.
5. Revisar que la puntuacion final y `routeStatus` sean coherentes.

Resultado esperado:

- una demo robusta para presentacion y pruebas internas

## Como procederia yo a partir de aqui

1. Cerraria definitivamente los datos de la ruta y sus imagenes de prueba.
2. Haria una reunion corta con Persona 1 y Persona 2 solo para bloquear contratos.
3. Pediria a backend un primer mock real de `process-photo` y `check-answer` respetando tus JSON.
4. Ayudaria a frontend a conectar el mapa y el flujo de progreso usando tus mocks.
5. Cuando la demo entera funcione con mocks, pasaria a sustituir partes por APIs reales una a una.
6. Dejaria siempre fallback activo para no romper la presentacion.

## Entregables concretos de Persona 3

- ruta demo cerrada y documentada
- prompts listos para Gemini
- contratos de progreso y mapa claros
- datos fallback estables
- pruebas de flujo completas
- coordinacion final entre frontend y backend

