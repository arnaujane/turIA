# Setup manual de Google Maps

Guia breve para dejar documentada la integracion sin activar todavia la clave real.

## Pasos en Google Cloud Console

1. Crear o seleccionar el proyecto de Google Cloud compartido.
2. Activar **Maps JavaScript API**.
3. Crear una API key para frontend.
4. Restringir la clave por:
   - API: Maps JavaScript API
   - Origenes HTTP autorizados del entorno de desarrollo y produccion
5. Guardar la clave en `VITE_GOOGLE_MAPS_API_KEY`.

## Contrato que consumira frontend

Frontend deberia recibir o leer por punto este minimo estable:

```json
{
  "id": "point-1",
  "name": "Sagrada Familia",
  "coordinates": {
    "lat": 41.4036,
    "lng": 2.1744
  }
}
```

## Casos de uso previstos

- Mostrar ubicacion actual del usuario.
- Mostrar punto actual y siguiente punto desbloqueado.
- Calcular distancia aproximada entre usuario y objetivo.

## Dependencias funcionales

- El mapa no depende todavia de una implementacion concreta en `frontend/`.
- El punto actual sale de `currentPointId`.
- El siguiente punto desbloqueado se deduce desde `nextPointId` y `unlockedPoints`.
- Si frontend necesita mas datos visuales, deben anadirse sin renombrar `id`, `name` o `coordinates`.

## Decisiones de esta fase

- No se incluye clave real en el repo.
- No se instala `gcloud`.
- No se integra aun `@googlemaps/js-api-loader`; solo se deja listo el contrato de datos.
