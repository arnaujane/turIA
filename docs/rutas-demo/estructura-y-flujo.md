# Estructura y flujo de la ruta demo

## Objetivo

Mantener una ruta corta, estable y facil de integrar entre frontend, backend y capa de progreso.

## Estructura base

- Ruta ID: `demo-route`
- Ruta visible: `Ruta Gaudi Barcelona`
- Numero de puntos: 4
- Orden: lineal y cerrado para demo controlada
- Inicio: `point-1`
- Final: `point-4`
- Tema: obras de Antoni Gaudi en Barcelona

## Flujo canonico de desbloqueo

1. Usuario inicia en `point-1`.
2. Sube o captura una imagen del punto actual.
3. Backend analiza la imagen con Vision o con el mock controlado.
4. Backend resuelve `matchedPointId`.
5. Backend carga `canonicalPlace` desde `demo-data/`.
6. Backend genera `placeInfo`, `audioGuideText` y `riddle`.
7. Text-to-Speech convierte `audioGuideText` en audio.
8. Frontend consume `processPhoto`.
9. Usuario responde al enigma.
10. Si la respuesta es correcta, se desbloquea `nextPointId`.
11. Si el punto actual es el ultimo, `routeStatus` pasa a `completed`.

## Contrato runtime actual

- Ruta:
  - `id`, `name`, `locale`, `startPointId`, `pointOrder`, `totalPoints`, `scoringRules`
- Punto:
  - `id`, `slug`, `name`, `city`, `country`, `constructionYear`, `emoji`, `baseDescription`, `coordinates`, `testImageRef`, `visionAliases`, `expectedRiddle`, `answerOptions`, `correctAnswer`, `nextPointId`
- Progreso:
  - `userId`, `currentPointId`, `score`, `completedChallenges`, `unlockedPoints`, `routeStatus`
- `routeId` queda fuera del progreso runtime actual aunque exista en el modelo logico de Firestore.

## Estados esperados

- `locked`: punto aun no disponible para el usuario
- `in_progress`: ruta activa y no finalizada
- `completed`: ruta finalizada

## Contratos funcionales congelados

- `currentPointId`: punto en el que esta el usuario
- `completedChallenges`: puntos ya resueltos
- `unlockedPoints`: puntos disponibles para visitar
- `nextPointId`: siguiente punto a desbloquear o `null` en el ultimo
- `guideText`: texto base que frontend puede mostrar
- `riddle`: objeto con `question`, `answerOptions` y `hint`
- `processPhotoDebug`: salida extendida para revisar Vision, prompts y TTS sin depender del frontend

## Regla para cambios futuros

- Si frontend o backend necesitan cambiar nombres de campo, primero deben actualizarse `demo-data/`, `scripts/` y esta documentacion.
- Si se activa una nueva regla de puntuacion en runtime, deben actualizarse a la vez `demo-data/`, `scripts/` y esta documentacion.
