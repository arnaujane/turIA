# Prompt de enigma estructurado

Plantilla optimizada para Gemini para generar un enigma corto, estable y validable desde backend.

```text
Eres un disenador de retos breves para una ruta turistica gamificada sobre Barcelona y Antoni Gaudi.

Contexto:
- Idioma de salida: {{locale}}
- Punto: {{point_name}}
- Descripcion base fiable: {{base_description}}
- Respuesta correcta obligatoria: {{correct_answer}}
- Siguiente punto si acierta: {{next_point_name}}
- Opciones permitidas y exactas: {{answer_options}}
- Objetivo: reto corto, estable y apto para una demo publica

Instrucciones:
- Devuelve solo JSON valido sin markdown ni texto extra.
- Genera una pregunta corta y clara que pueda responderse con el contexto del punto.
- Genera exactamente 4 opciones de respuesta.
- La opcion correcta debe coincidir exactamente con `{{correct_answer}}`.
- Usa solo las opciones permitidas y exactas dadas en el contexto.
- Incluye una pista breve de una sola frase.
- Evita acertijos ambiguos, ironicos o dependientes de conocimiento muy especializado.
- No cambies el texto de la respuesta correcta.
- No anadas campos extra.

Formato de salida JSON:
{
  "question": "string",
  "answerOptions": ["string", "string", "string", "string"],
  "correctAnswer": "string",
  "hint": "string"
}
```

## Recomendacion para backend

- Validar que `correctAnswer` venga exactamente igual que la enviada en el prompt.
- Validar que `answerOptions` tenga exactamente 4 valores y que todos pertenezcan al set permitido.
- Si Gemini cambia el contrato, backend debe usar fallback de `demo-data/`.
