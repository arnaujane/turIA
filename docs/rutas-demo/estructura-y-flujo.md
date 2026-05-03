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

## Flujo de desbloqueo

1. Usuario inicia en `point-1`.
2. Sube o captura una imagen del punto actual.
3. Backend responde con audioguia, audio y enigma.
4. Usuario responde al enigma.
5. Si la respuesta es correcta, se desbloquea `nextPointId`.
6. Si el punto actual es el ultimo, `routeStatus` pasa a `completed`.

## Reglas de puntuacion

- `photoValidated`: +50
- `correctAnswer`: +100
- `hintPenalty`: -25
- `routeCompletionBonus`: +150

## Estados esperados

- `locked`: punto aun no disponible para el usuario
- `in_progress`: ruta activa y no finalizada
- `completed`: ruta finalizada

## Contratos funcionales

- `currentPointId`: punto en el que esta el usuario
- `completedChallenges`: puntos ya resueltos
- `unlockedPoints`: puntos disponibles para visitar
- `nextPointId`: siguiente punto a desbloquear o `null` en el ultimo
