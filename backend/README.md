# Backend

API MVP de Persona 2 para **Mystery Tourist Lens**.

## Objetivo

Este backend expone endpoints estables para que frontend pueda recorrer el flujo de la demo y para que Persona 3 pueda depurar Vision, Gemini y TTS con un endpoint extendido.

La fuente compartida sigue siendo:

- `demo-data/`
- `docs/prompts/`
- `docs/rutas-demo/`

## Requisitos

- Node.js 20 o superior

## Arranque

```bash
cd backend
npm install
npm run dev
```

Servidor por defecto: `http://localhost:3000`

## Modo real vs demo

- `GOOGLE_CLOUD_USE_REAL_APIS=false`: usa mock y fallbacks de `demo-data/`
- `GOOGLE_CLOUD_USE_REAL_APIS=true`: usa Vision, Vertex AI y Text-to-Speech reales mediante ADC

## Google Cloud local

La forma recomendada para desarrollo local es usar **Application Default Credentials (ADC)**.

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

4. Activar estas APIs en vuestro proyecto:

- Vertex AI API
- Cloud Vision API
- Cloud Text-to-Speech API
- Firestore API
- Cloud Run Admin API
- Cloud Build API
- Artifact Registry API

5. Configurar `backend/.env`:

```bash
GOOGLE_CLOUD_PROJECT_ID=tu_project_id
GOOGLE_CLOUD_REGION=europe-west1
GOOGLE_CLOUD_USE_REAL_APIS=true
VERTEX_MODEL=gemini-2.0-flash-001
TTS_VOICE_NAME=es-ES-Neural2-A
```

Si no usas `gcloud auth application-default login`, puedes apuntar `GOOGLE_APPLICATION_CREDENTIALS` a un JSON de service account, aunque la via recomendada para desarrollo sigue siendo ADC.

## Endpoints

- `GET /api/health`
- `GET /api/route`
- `POST /api/analyze-image`
- `POST /api/generate-guide`
- `POST /api/generate-audio`
- `POST /api/process-photo`
- `POST /api/process-photo-debug`
- `POST /api/check-answer`
- `GET /api/progress/:userId`
- `POST /api/progress`

## Contratos importantes

### `POST /api/process-photo`

Contrato estable para frontend:

- `requestId`
- `pointId`
- `nextPointId`
- `routeStatus`
- `usedFallback`
- `place`
- `guide`
- `audio`
- `riddle`

### `POST /api/process-photo-debug`

Contrato extendido para Persona 3 y QA:

- `requestId`
- `matchedPointId`
- `usedFallback`
- `vision`
- `canonicalPlace`
- `promptInputs`
- `promptOutputs`
- `audio`
- `frontendResponse`
- `finalResult`
- `finalProcessPhoto`

## Notas de implementacion

- `POST /api/process-photo` espera `multipart/form-data` con el campo `image`.
- Para pruebas controladas se puede mandar `mockPointId`, `expectedPointId`, `currentPointId` o `forceFallback` en el body.
- El progreso se guarda en memoria mientras `DEMO_ENABLE_MOCK_PROGRESS=true`.
- Si falla Google Cloud y `DEMO_USE_STATIC_FALLBACKS=true`, el backend puede seguir respondiendo con contenido demo.
- Los prompts reales viven en `docs/prompts/` y backend los renderiza desde ahi.
