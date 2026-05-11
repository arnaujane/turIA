# Modelo de progreso y Firestore

Documento de Persona 3 para separar con claridad el modelo logico objetivo, el runtime actual y la recomendacion de persistencia.

## Modelo logico objetivo

El modelo logico objetivo mantiene un documento de progreso por usuario y ruta:

```text
users/
  {userId}/
    progress/
      demo-route

routes/
  demo-route/
    points/
      {pointId}
```

### Documento `users/{userId}/progress/demo-route`

```json
{
  "routeId": "demo-route",
  "currentPointId": "point-2",
  "score": 100,
  "completedChallenges": ["point-1"],
  "unlockedPoints": ["point-1", "point-2"],
  "routeStatus": "in_progress",
  "updatedAt": "serverTimestamp"
}
```

### Documento `routes/demo-route`

```json
{
  "id": "demo-route",
  "name": "Ruta Gaudi Barcelona",
  "locale": "es-ES",
  "startPointId": "point-1",
  "totalPoints": 4
}
```

### Documento `routes/demo-route/points/{pointId}`

```json
{
  "id": "point-1",
  "name": "Sagrada Familia",
  "coordinates": {
    "lat": 41.4036,
    "lng": 2.1744
  },
  "nextPointId": "point-2"
}
```

## Runtime actual

El runtime actual sigue un contrato mas pequeno que el modelo logico objetivo.

### Progreso runtime activo hoy

```json
{
  "userId": "mystery_user_demo_001",
  "currentPointId": "point-2",
  "score": 100,
  "completedChallenges": ["point-1"],
  "unlockedPoints": ["point-1", "point-2"],
  "routeStatus": "in_progress"
}
```

### Diferencias respecto al modelo objetivo

- `routeId` existe en el modelo logico objetivo, pero no entra en el runtime actual.
- `updatedAt` queda reservado para persistencia real.
- La estructura actual solo refleja reglas de puntuacion ya activas.

### Reglas runtime activas hoy

- `correctAnswer`: activa
- `routeCompletionBonus`: activa
- `photoValidated`: no activa todavia
- `hintPenalty`: no activa todavia

## Recomendacion de persistencia

La recomendacion por defecto para integracion real es esta:

- backend calcula progreso
- backend calcula puntuacion
- backend persiste progreso
- frontend solo envia eventos y refleja el estado recibido

Mientras Persona 2 no conecte Firestore real, el backend puede seguir usando almacenamiento en memoria para pruebas controladas. Cuando Firestore entre en juego, debe adoptar el mismo vocabulario compartido sin cambiar el contrato runtime por conveniencia interna.

## Transiciones de estado

### Inicio de ruta

- `currentPointId = point-1`
- `score = 0`
- `completedChallenges = []`
- `unlockedPoints = ["point-1"]`
- `routeStatus = in_progress`

### Respuesta correcta en punto intermedio

- se anade el punto actual a `completedChallenges`
- se anade `nextPointId` a `unlockedPoints`
- `currentPointId` pasa al siguiente punto
- `score` sube con `correctAnswer`
- `routeStatus` sigue en `in_progress`

### Respuesta incorrecta

- no cambia `currentPointId`
- no cambia `completedChallenges`
- no cambia `unlockedPoints`
- `score` no sube
- `routeStatus` sigue en `in_progress`

### Finalizacion de ruta

- el ultimo punto entra en `completedChallenges`
- `unlockedPointId` pasa a `null`
- `currentPointId` queda en el ultimo punto
- `score` suma `correctAnswer + routeCompletionBonus`
- `routeStatus` pasa a `completed`

## Notas de integracion

- El modelo replica los mismos campos clave usados en `demo-data/`.
- `progress/demo-route` se plantea como un documento por ruta para simplificar lecturas.
- `progress.demo.json` y los snapshots runtime no deben incluir `routeId` mientras backend no lo adopte de forma real.
- Firestore es el destino de persistencia objetivo cuando Persona 2 conecte la capa real.
