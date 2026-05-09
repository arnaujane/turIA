# Modelo logico de Firestore

Documento de referencia para integrar progreso y ruta sin implementarlo aun.
Este archivo describe el modelo objetivo. No todo este contrato esta activo todavia en el runtime actual.

## Colecciones principales

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

## Documento `users/{userId}/progress/demo-route`

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

## Documento `routes/demo-route`

```json
{
  "id": "demo-route",
  "name": "Ruta Gaudi Barcelona",
  "locale": "es-ES",
  "startPointId": "point-1",
  "totalPoints": 4
}
```

## Documento `routes/demo-route/points/{pointId}`

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

## Notas de integracion

- El modelo replica los mismos campos clave usados en `demo-data/`.
- `progress/demo-route` se plantea como un documento por ruta para simplificar lecturas.
- Las marcas temporales quedan para la futura implementacion de backend o cliente.
- `routeId` se mantiene documentado aqui como parte del modelo logico objetivo.
- `progress.demo.json` no incluye `routeId` por ahora porque el backend runtime actual todavia no lo usa.
- La puntuacion del ejemplo usa solo `correctAnswer` activo en runtime para no mezclar reglas de diseno aun no adoptadas.
