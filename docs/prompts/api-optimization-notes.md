# Notas de optimizacion para APIs

Guia breve para que Persona 2 use los prompts de Persona 3 de forma estable dentro del backend.

## Vision API

- No mandar el resultado bruto de Vision a Gemini.
- Extraer un resumen pequeno con el monumento o lugar detectado.
- Extraer entre 3 y 5 labels relevantes.
- Extraer OCR corto solo si aporta contexto real.
- Si la confianza de Vision es baja, usar fallback antes de pedir creatividad al modelo.

## Gemini API

- Usar los prompts de esta carpeta como plantillas base.
- Mantener temperatura baja en salidas estructuradas.
- Validar parseo JSON en enigma y validacion antes de responder al frontend.
- Dar prioridad a `baseDescription` y `correctAnswer` por encima de cualquier inferencia del modelo.

## Text-to-Speech API

- Reutilizar `guideText` si el texto final es breve y natural.
- Evitar frases demasiado largas o con puntuacion compleja en la audioguia.
- Si el texto supera el rango previsto, recortarlo o regenerarlo antes de TTS.

## Translation API

- No activar traduccion en esta fase salvo que el MVP lo necesite de verdad.
- Mantener `es-ES` como idioma canonico de los datos demo para evitar inconsistencias.

## Fallbacks

- Si Vision no detecta el punto con seguridad suficiente, usar la referencia demo del punto esperado.
- Si Gemini falla, devuelve JSON invalido o cambia el contrato, usar `sample-responses.json`.
- Si TTS falla, mantener al menos `guideText` visible para no romper el flujo.
