# Notas de optimizacion para APIs

Guia breve para que Persona 2 use los prompts de Persona 3 de forma estable dentro del backend.

## Vision API

- No mandar el resultado bruto de Vision a Gemini.
- Extraer un resumen pequeno con el monumento o lugar detectado.
- Extraer entre 3 y 5 labels relevantes.
- Extraer OCR corto solo si aporta contexto real.
- Resolver el punto real de la ruta antes de llamar a Gemini.
- Si Vision no detecta el punto con confianza suficiente, usar el punto esperado de la ruta cerrada.

## Gemini API

- Usar los prompts versionados de `docs/prompts/` como fuente real.
- Mantener temperatura baja en salidas estructuradas.
- Pedir JSON estructurado desde Vertex AI.
- Validar parseo JSON y contrato final antes de responder al frontend.
- Dar prioridad a `baseDescription`, `answerOptions` y `correctAnswer` por encima de cualquier inferencia del modelo.
- No pedir al modelo que invente identidad del lugar cuando `canonicalPlace` ya esta resuelto.

## Text-to-Speech API

- Reutilizar `audioGuideText` como entrada directa a TTS.
- Evitar frases demasiado largas o con puntuacion compleja en la audioguia.
- Si TTS falla, mantener al menos `guideText` visible y usar audio fallback si existe.

## Translation API

- No activar traduccion en esta fase salvo que el MVP lo necesite de verdad.
- Mantener `es-ES` como idioma canonico de los datos demo para evitar inconsistencias.

## Fallbacks

- Si Vision falla o se fuerza fallback, usar la referencia demo del punto esperado.
- Si Gemini falla, devuelve JSON invalido o cambia el contrato, usar `sample-responses.json`.
- Si TTS falla, mantener el flujo con `guideText` y audio de fallback.
