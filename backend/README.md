# Backend

API MVP de Persona 2 para **Mystery Tourist Lens**.

## Objetivo

Este backend expone endpoints estables para que frontend pueda recorrer el flujo de la demo sin depender todavia de Vision, Gemini o Text-to-Speech reales. La logica actual usa `demo-data/` y `sample-responses.json` como fuente canonica y fallback.

## Requisitos

- Node.js 20 o superior

## Arranque

```bash
cd backend
npm install
npm run dev
```

Servidor por defecto: `http://localhost:3000`

## Google Cloud local

La forma recomendada para desarrollo local es usar **Application Default Credentials (ADC)**. Google documenta que ADC busca credenciales en este orden: variable `GOOGLE_APPLICATION_CREDENTIALS`, credenciales locales creadas con `gcloud auth application-default login`, o la service account adjunta al entorno donde corre la app.

Pasos recomendados:

1. Instalar Google Cloud CLI.
2. Iniciar sesion:

```bash
gcloud auth login
```

3. Crear credenciales locales para ADC:

```bash
gcloud auth application-default login
```

4. Habilitar estas APIs en tu proyecto:

- Vision API
- Vertex AI API
- Cloud Text-to-Speech API

5. Configurar `.env`:

```bash
GOOGLE_CLOUD_PROJECT_ID=tu_project_id
GOOGLE_CLOUD_REGION=europe-southwest1
GOOGLE_CLOUD_USE_REAL_APIS=true
VERTEX_MODEL=gemini-2.0-flash-001
TTS_VOICE_NAME=es-ES-Neural2-A
```

Si no usas `gcloud auth application-default login`, puedes apuntar `GOOGLE_APPLICATION_CREDENTIALS` a un JSON de service account, aunque Google recomienda evitar claves cuando sea posible.

## Modo real vs demo

- `GOOGLE_CLOUD_USE_REAL_APIS=false`: usa mock y fallbacks de `demo-data/`
- `GOOGLE_CLOUD_USE_REAL_APIS=true`: usa Vision, Vertex AI y Text-to-Speech reales mediante ADC

## Endpoints

- `GET /api/health`
- `GET /api/route`
- `POST /api/analyze-image`
- `POST /api/generate-guide`
- `POST /api/generate-audio`
- `POST /api/process-photo`
- `POST /api/check-answer`
- `GET /api/progress/:userId`
- `POST /api/progress`

## Notas

- `POST /api/process-photo` espera `multipart/form-data` con el campo `image`.
- Para pruebas controladas se puede mandar `mockPointId`, `expectedPointId`, `currentPointId` o `forceFallback` en el body.
- El progreso se guarda en memoria mientras `DEMO_ENABLE_MOCK_PROGRESS=true`.
- Si falla Google Cloud y `DEMO_USE_STATIC_FALLBACKS=true`, el backend puede seguir respondiendo con contenido demo.
