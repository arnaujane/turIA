# Contrato de prompts

Convenciones compartidas entre Persona 2 y Persona 3 para mantener respuestas estables en la demo.

## Reglas generales

- Idioma base del MVP: `es-ES`.
- Tono: claro, breve, amable y orientado a demo academica.
- Evitar respuestas largas, ambiguas o excesivamente creativas.
- Evitar referencias a capacidades internas del modelo.
- Mantener vocabulario coherente con `pointId`, `nextPointId`, `routeStatus` y `answerOptions`.
- Priorizar siempre los datos preparados por Persona 3 frente a inferencias libres del modelo.
- Las respuestas deben poder alimentar directamente la UI o el fallback sin postprocesado complejo.

## Longitud esperada

- `placeInfo`: 55-85 palabras.
- `audioGuideText`: 55-85 palabras.
- Enigma: 1 pregunta breve, 4 opciones exactas.
- Pista: 1 frase corta.
- Feedback de validacion: 1-2 frases.

## Formatos de salida

- La audioguia ya no sale como texto plano suelto.
- Gemini debe devolver JSON para la guia con `placeInfo` y `audioGuideText`.
- El enigma sale en JSON con `question`, `answerOptions`, `correctAnswer`, `hint`.
- La validacion sale en JSON con `isCorrect`, `feedback`.

## Flujo recomendado entre APIs

1. Cloud Vision detecta lugar, labels y texto visible.
2. Backend resume esa evidencia en campos pequenos y comprensibles.
3. Backend resuelve `matchedPointId` contra la ruta cerrada.
4. Backend carga `canonicalPlace` desde `demo-data/`.
5. Gemini recibe `baseDescription` como fuente principal y la evidencia de Vision como refuerzo secundario.
6. Gemini devuelve solo los bloques creativos y estructurados.
7. Text-to-Speech convierte `audioGuideText` en audio.

## Variables minimas que backend debe inyectar

- `locale`
- `point_name`
- `city`
- `country`
- `construction_year`
- `emoji`
- `base_description`
- `correct_answer`
- `answer_options`
- `vision_summary`
- `vision_labels`
- `vision_ocr`
- `next_point_name` cuando aplique

## Restricciones de demo

- No depender de hechos historicos que no esten en los datos base.
- No devolver markdown.
- No devolver campos extra si el backend espera un contrato fijo.
- Si la generacion falla o sale vacia, backend debe poder usar `sample-responses.json` como respaldo.
- Si la salida JSON no parsea o cambia claves, backend debe descartarla y usar fallback.

## Recomendaciones de robustez

- Backend debe validar siempre el JSON de Gemini antes de reenviarlo a frontend.
- Conviene fijar temperatura baja en salidas estructuradas.
- Conviene usar salida estructurada de Vertex AI con `responseMimeType = application/json`.
- `name`, `city`, `country`, `constructionYear` y `emoji` no deben salir del modelo si la ruta sigue siendo cerrada.
