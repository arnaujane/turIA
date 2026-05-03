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

- Audioguia: 55-85 palabras.
- Enigma: 1 pregunta breve, 3 opciones exactas.
- Pista: 1 frase corta.
- Feedback de validacion: 1-2 frases.

## Formatos de salida

- La audioguia sale como texto plano.
- El enigma sale en JSON con `question`, `answerOptions`, `correctAnswer`, `hint`.
- La validacion sale en JSON con `isCorrect`, `feedback`.

## Flujo recomendado entre APIs

1. Cloud Vision detecta lugar, labels y texto visible.
2. Backend resume esa evidencia en campos pequenos y comprensibles para Gemini.
3. Gemini recibe `baseDescription` como fuente principal y la evidencia de Vision como refuerzo secundario.
4. Gemini devuelve `guideText` y el bloque de enigma en un formato facil de validar.
5. Text-to-Speech convierte `guideText` en audio.

## Variables minimas que backend deberia inyectar

- `locale`
- `point_name`
- `base_description`
- `correct_answer`
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
- Conviene fijar temperatura baja para tareas estructuradas como enigma y validacion.
- Los prompts deben enviarse con instrucciones que prohiban bloques de codigo y texto adicional fuera del formato esperado.
