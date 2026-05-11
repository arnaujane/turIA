# Setup funcional de Google Maps

Documento de Persona 3 para dejar el mapa decidido a nivel funcional sin implementar todavia el frontend.

## Estado de esta integracion

- El proyecto de Google Cloud compartido es una tarea externa a confirmar por el equipo.
- La clave real no se guarda en el repo.
- La API necesaria es `Maps JavaScript API`.
- La credencial esperada en frontend es `VITE_GOOGLE_MAPS_API_KEY`.

## Pasos externos en Google Cloud Console

1. Crear o seleccionar el proyecto compartido del equipo.
2. Activar `Maps JavaScript API`.
3. Crear una API key para frontend.
4. Restringir la clave por API y por origenes HTTP autorizados.
5. Configurar la clave real fuera del repo mediante `VITE_GOOGLE_MAPS_API_KEY`.

## Contrato minimo de mapa

Frontend debe poder renderizar el mapa con este minimo estable por punto:

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

Los campos congelados para mapa son:

- `id`
- `name`
- `coordinates`

Si hicieran falta datos visuales adicionales, deben anadirse sin renombrar esos tres campos.

## Comportamiento funcional decidido

### Punto actual

- El punto actual viene de `currentPointId`.
- El frontend no debe inferirlo por posicion en un array si ya tiene `currentPointId`.

### Objetivo visible principal

- El objetivo visible principal es el siguiente punto desbloqueado cuando exista.
- Ese objetivo se deduce con `currentPointId`, `nextPointId` y `unlockedPoints`.
- Si el usuario esta en el ultimo punto, no existe objetivo siguiente y el mapa solo destaca el punto actual.

### Puntos visibles

- Se pueden mostrar todos los puntos de la ruta.
- Solo se deben destacar visualmente:
  - el punto actual
  - el objetivo activo

### Distancia

- La distancia se calcula solo contra el objetivo activo.
- Si no existe objetivo siguiente, no hace falta mostrar distancia a un nuevo destino.

### Geolocalizacion

- Si el usuario concede permisos, el mapa muestra su ubicacion actual.
- Si el usuario niega permisos, el mapa sigue mostrando la ruta, el punto actual y el objetivo activo.
- Sin permisos, no se muestra posicion actual ni distancia.

## Dependencias funcionales

- `currentPointId` sale del progreso runtime.
- `nextPointId` sale del punto actual.
- `unlockedPoints` confirma que el objetivo ya esta disponible.
- El mapa sigue dependiendo de que Persona 1 implemente la pantalla y la carga de Google Maps en frontend.

## Micro handoff para Persona 1

- Necesitas `VITE_GOOGLE_MAPS_API_KEY` fuera del repo.
- Debes consumir `id`, `name` y `coordinates` como contrato minimo de mapa.
- Debes usar `currentPointId` como fuente de verdad del punto actual.
- Debes destacar el siguiente punto desbloqueado como objetivo activo cuando exista.
- Debes soportar fallback sin geolocalizacion sin romper la pantalla.
