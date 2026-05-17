# Google Cloud paso a paso para Persona 3

Guia operativa para dejar listo Google Cloud segun el estado real del repo.

## Contexto actual del proyecto

- El backend real ya existe en `backend/` y tiene adaptadores para Vision, Vertex AI y Text-to-Speech.
- El frontend real existe en `frontend/`, pero hoy sigue hardcodeado y no consume backend en tiempo real.
- Por eso Persona 3 debe preparar Google Cloud pensando en el backend primero, no en el mapa o la UI como integracion final.

## 1. Crear el proyecto compartido

1. Entrar en Google Cloud Console.
2. Crear un proyecto nuevo del equipo.
3. Guardar:
   - `GOOGLE_CLOUD_PROJECT_ID`
   - nombre visible
   - numero de proyecto
   - owner/admin responsable
4. Activar facturacion.

Resultado esperado:

- Todo backend, Firestore y Maps se apoyan en el mismo proyecto compartido.

## 2. Cerrar regiones

Decision recomendada:

- Cloud Run: `europe-west1` o `europe-southwest1`
- Vertex AI: misma region que backend cuando el modelo lo soporte
- Firestore: `eur3`

Recomendacion practica para este repo:

- Si quereis simplicidad operativa, usar `europe-west1`.
- Si quereis cercania geografica, usar `europe-southwest1` y comprobar el soporte del modelo real elegido.

## 3. Activar APIs obligatorias

Activar estas APIs:

- Vertex AI API
- Cloud Vision API
- Cloud Text-to-Speech API
- Firestore API
- Cloud Run Admin API
- Cloud Build API
- Artifact Registry API
- Maps JavaScript API

No activar todavia salvo necesidad real:

- Cloud Translation API
- Cloud Functions
- Speech-to-Text
- Cloud Storage API

## 4. Crear la API key de Maps

Esta key es solo para frontend.

Pasos:

1. Ir a Credenciales.
2. Crear una API key nueva.
3. Renombrarla como `maps-frontend-dev` o similar.
4. Restringir por `HTTP referrers`.
5. Permitir al menos:
   - `http://localhost:5173/*`
6. Restringir por API:
   - `Maps JavaScript API`
7. Guardar la key fuera del repo.
8. Configurarla como `VITE_GOOGLE_MAPS_API_KEY`.

## 5. Crear Firestore

Pasos:

1. Entrar en Firestore.
2. Crear base de datos.
3. Elegir `Native mode`.
4. Elegir ubicacion `eur3`.
5. Crear la base.

Notas para este repo:

- No hace falta poblarla a mano desde consola.
- Lo importante es que exista para que Persona 2 pueda adoptar persistencia real despues.
- El modelo logico sigue documentado en `docs/rutas-demo/firestore-model.md`.

## 6. Decidir si hace falta Cloud Storage

Para este repo la recomendacion inicial es:

- no crear bucket todavia si el backend procesa la imagen en memoria y devuelve el resultado al momento

Crear bucket solo si decidis:

- guardar imagenes subidas
- guardar audios generados

## 7. Preparar autenticacion local para backend

Pasos:

1. Instalar Google Cloud CLI.
2. Iniciar sesion:
   - `gcloud auth login`
3. Crear ADC local:
   - `gcloud auth application-default login`
4. Comprobar el proyecto activo del equipo.
5. Configurar `backend/.env` con:
   - `GOOGLE_CLOUD_PROJECT_ID`
   - `GOOGLE_CLOUD_REGION`
   - `GOOGLE_CLOUD_USE_REAL_APIS=true`
   - `VERTEX_MODEL`
   - `TTS_VOICE_NAME`

Regla importante:

- no subir secretos al repo
- no repartir JSON de service account salvo necesidad excepcional

## 8. Preparar despliegue a Cloud Run

Pasos conceptuales:

1. Desplegar el backend Express como un servicio en Cloud Run.
2. Asociar una service account al servicio.
3. Esa identidad debe tener acceso a:
   - Vision
   - Vertex AI
   - Text-to-Speech
   - Firestore
   - Storage, si se activa

## 9. Como encaja cada servicio con el backend actual

- Vision:
  - devuelve evidencia tecnica
  - no debe construir la respuesta final de producto
- `demo-data`:
  - decide `canonicalPlace`
  - aporta `name`, `city`, `country`, `constructionYear`, `emoji`, `answerOptions`, `correctAnswer`
- Gemini:
  - genera `placeInfo`, `audioGuideText` y `riddle`
- Text-to-Speech:
  - sintetiza `audioGuideText`
- Firestore:
  - guarda progreso y puntuacion
- Maps:
  - solo participa en frontend

## 10. Checklist minima de Persona 3

- Existe proyecto compartido
- Facturacion activa
- Regiones cerradas
- APIs activadas
- Key de Maps creada y restringida
- Firestore Native creado en `eur3`
- ADC local probado para backend
- `process-photo-debug` definido en repo para QA de Vision, prompts y TTS
