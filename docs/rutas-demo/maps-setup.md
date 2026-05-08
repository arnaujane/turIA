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

Frontend deberia recibir o leer por punto:

```json
{
  "id": "point-1",
  "name": "Punto Inicio Demo",
  "coordinates": {
    "lat": 40.4168,
    "lng": -3.7038
  }
}
```

## Casos de uso previstos

- Mostrar ubicacion actual del usuario.
- Mostrar punto actual y siguiente punto desbloqueado.
- Calcular distancia aproximada entre usuario y objetivo.

## Decisiones de esta fase

- No se incluye clave real en el repo.
- No se instala `gcloud`.
- No se integra aun `@googlemaps/js-api-loader`; solo se deja listo el contrato de datos.

