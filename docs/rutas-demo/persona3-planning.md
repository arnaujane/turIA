# Planning de Persona 3

Guia operativa detallada para continuar tu parte del proyecto sin salir del alcance de Persona 3.

El objetivo de este archivo es que, cuando vuelvas a abrir el repo mas adelante, tengas claro:

- que esta ya resuelto
- que sigue pendiente
- en que orden conviene hacerlo
- con quien tienes que coordinarte
- que resultado concreto deberia salir de cada paso

## 1. Estado actual real

Ahora mismo ya tienes cubierto lo siguiente:

- una ruta demo cerrada de 4 puntos en Barcelona sobre Gaudi
- un contrato de datos estable en `demo-data/`
- prompts base para audioguia, enigma y validacion
- un modelo logico de Firestore documentado
- documentacion de integracion para frontend y backend
- scripts de validacion para detectar roturas de contrato
- respuestas fallback y mocks para no depender de Vision o Gemini reales

Tambien sabes ya una cosa importante:

- el backend actual consume bastante bien tus contratos, pero no implementa aun toda la logica de juego objetivo

Eso afecta sobre todo a:

- `routeId` en progreso runtime
- `photoValidated`
- `hintPenalty`

Por tanto, tu trabajo pendiente ya no es "inventar la demo", sino empujarla hacia una integracion real sin romper el contrato comun.

## 2. Tu responsabilidad como Persona 3

Tu zona principal sigue siendo:

- `demo-data/`
- `docs/prompts/`
- `docs/rutas-demo/`
- `scripts/`

Tu papel no es construir el frontend completo ni el backend completo. Tu papel es:

- definir el contrato del juego
- fijar la ruta demo
- dejar el mapa decidible e integrable
- dejar el progreso coherente
- preparar datos de prueba estables
- coordinar que frontend y backend no se desalineen

## 3. Prioridad maxima actual

Tus siguientes pasos reales se pueden resumir en 5 bloques:

1. cerrar todo lo relacionado con mapa real
2. coordinar el progreso real con backend
3. preparar la validacion end-to-end completa con frontend y backend
4. decidir si vais a usar imagenes reales de prueba dentro o fuera del repo
5. dejar evidencia clara de todo lo probado para que la demo sea defendible

## 4. Bloque A: mapa real

### Objetivo

Pasar de "contrato de mapa documentado" a "mapa integrable y listo para Persona 1".

### Lo que ya esta hecho

- ya definiste las coordenadas de los 4 puntos
- ya dejaste claro que el contrato minimo por punto es `id`, `name`, `coordinates`
- ya documentaste `VITE_GOOGLE_MAPS_API_KEY`
- ya dejaste explicado que el mapa debe poder mostrar ubicacion actual, punto actual, siguiente punto desbloqueado y distancia aproximada

### Lo que falta

#### Paso A1. Conseguir la clave real de Google Maps

Tienes que hacer esto:

1. entrar en Google Cloud Console del proyecto compartido
2. comprobar si ya existe un proyecto comun para el equipo
3. si no existe, acordar con el equipo cual usareis
4. activar `Maps JavaScript API`
5. crear una API key para frontend
6. restringirla por origenes HTTP autorizados
7. dejar por escrito quien guarda esa clave y donde se configurara en desarrollo

Resultado esperado:

- una clave real disponible para pruebas de mapa

Prueba de que esta hecho:

- Persona 1 puede poner `VITE_GOOGLE_MAPS_API_KEY` y cargar el mapa sin errores de autenticacion

#### Paso A2. Validar con Persona 1 el contrato real del mapa

Aunque el contrato minimo ya existe, te conviene revisar con Persona 1:

1. si solo necesita `id`, `name` y `coordinates`
2. si quiere tambien `nextPointId` para marcar relacion visual entre puntos
3. si quiere usar `currentPointId` y `unlockedPoints` desde store o desde respuesta backend
4. si necesita un label adicional o si `name` ya basta

Resultado esperado:

- una decision cerrada de que datos exactos usa frontend para la pantalla de mapa

Regla importante:

- si hace falta anadir un campo, se puede estudiar
- si solo es por comodidad visual, no se debe renombrar ningun campo ya congelado

#### Paso A3. Definir el comportamiento visible del mapa

Aqui tu trabajo es funcional, no visual.

Debes dejar decidido:

1. como se identifica el punto actual
2. como se identifica el siguiente punto desbloqueado
3. si se muestran todos los puntos o solo los desbloqueados
4. si la distancia se calcula al punto actual o al siguiente desbloqueado
5. si la ubicacion del usuario se pide siempre o solo al entrar en el mapa
6. que pasa si el usuario deniega permisos de geolocalizacion

Resultado esperado:

- una mini especificacion funcional del mapa que Persona 1 pueda implementar sin adivinar nada

### Estado de este bloque

- documentacion: hecha
- configuracion real: pendiente
- coordinacion funcional con frontend: pendiente
- validacion visual en la app: pendiente

## 5. Bloque B: progreso real y Firestore

### Objetivo

Pasar de "modelo logico documentado" a "estrategia real de guardado y lectura de progreso".

### Lo que ya esta hecho

- tienes un modelo logico en `docs/rutas-demo/firestore-model.md`
- tienes un contrato runtime actual en `demo-data/progress.demo.json`
- dejaste claro que `routeId` sigue siendo objetivo logico y no parte del runtime actual
- dejaste claros los campos minimos: `userId`, `currentPointId`, `score`, `completedChallenges`, `unlockedPoints`, `routeStatus`

### Lo que falta

#### Paso B1. Cerrar con Persona 2 quien guarda el progreso

Tienes que hablar con backend y dejar por escrito una decision:

1. si el progreso se guardara desde backend
2. si frontend solo manda eventos y backend calcula el progreso
3. si habra algun guardado temporal local en frontend
4. si Firestore se escribira ya en el MVP o solo se dejara preparado

Recomendacion funcional:

- intenta que backend sea quien calcule y guarde el progreso final
- asi frontend no tiene que inventar logica de puntuacion ni desbloqueos

Resultado esperado:

- una decision cerrada sobre el flujo de persistencia

#### Paso B2. Cerrar cuando cambia cada campo de progreso

Tienes que dejar muy claro:

- cuando cambia `currentPointId`
- cuando se anade un elemento a `completedChallenges`
- cuando se anade un elemento a `unlockedPoints`
- cuando cambia `routeStatus`
- cuando sube `score`

Tienes que distinguir 2 niveles:

1. runtime actual
2. diseno objetivo

Ahora mismo, en runtime actual:

- sumar por respuesta correcta si esta activo
- sumar bonus final si es el ultimo punto
- no asumir que `photoValidated` ya se aplica
- no asumir que `hintPenalty` ya se aplica

Resultado esperado:

- una tabla o texto claro de transiciones de estado

#### Paso B3. Preparar casos de prueba de progreso

Debes dejar preparados al menos estos casos:

1. usuario nuevo al empezar ruta
2. usuario tras completar el primer punto
3. usuario a mitad de ruta
4. usuario que falla una respuesta
5. usuario que completa el ultimo punto

Para cada caso debes saber:

- `currentPointId`
- `score`
- `completedChallenges`
- `unlockedPoints`
- `routeStatus`

Resultado esperado:

- ejemplos faciles de comparar con backend o Firestore

### Estado de este bloque

- modelo logico: hecho
- contrato runtime: hecho
- decision real de persistencia: pendiente
- coordinacion con backend: pendiente
- Firestore real: pendiente o por confirmar

## 6. Bloque C: imagenes de prueba

### Objetivo

Decidir si las referencias de imagen se quedan como referencia logica o se convierten en assets reales de prueba.

### Lo que ya esta hecho

- cada punto tiene `testImageRef`
- las referencias son estables y coherentes

### Lo que falta

Tienes que decidir una de estas dos vias:

#### Opcion 1. Mantener solo referencias logicas

Sirve si:

- Persona 2 ya puede forzar `mockPointId`
- no necesitais pruebas reales de Vision desde repo

Ventaja:

- mas simple

Inconveniente:

- menos util para pruebas de demo real

#### Opcion 2. Tener imagenes reales de prueba

Sirve si:

- quereis probar Vision o el flujo de foto con material controlado

Tareas:

1. reunir una imagen razonable por punto
2. decidir si se guardan dentro del repo o en carpeta compartida externa
3. actualizar `testImageRef` si hace falta
4. documentar que imagen corresponde a cada `pointId`

Resultado esperado:

- cualquier persona del equipo puede probar cada punto con una imagen conocida

### Estado de este bloque

- referencias logicas: hecho
- assets reales: pendiente de decision

## 7. Bloque D: validacion end-to-end real

### Objetivo

Pasar de pruebas por contrato y mocks a prueba funcional de la demo completa.

### Lo que ya esta hecho

- tienes `sample-responses.json`
- tienes scripts que validan consistencia
- tienes documentado el flujo

### Lo que falta

Debes ejecutar o coordinar estos escenarios reales:

#### Escenario D1. Flujo ideal

Secuencia:

1. el usuario abre la app
2. entra en el punto actual
3. sube o captura foto
4. backend devuelve `guideText`, `audio`, `riddle`
5. el usuario responde bien
6. se desbloquea el siguiente punto
7. progreso se actualiza
8. mapa refleja el nuevo estado

Debes comprobar:

- que los nombres de campo coinciden
- que no falta informacion
- que la UI no necesita inventar campos

#### Escenario D2. Flujo con fallback

Secuencia:

1. Vision falla o se fuerza fallback
2. backend usa contenido de `sample-responses.json`
3. la demo sigue viva

Debes comprobar:

- que frontend no se rompe si `usedFallback = true`
- que el contenido sigue siendo util para la demo

#### Escenario D3. Respuesta incorrecta

Debes comprobar:

- que `isCorrect` llega bien
- que no se desbloquea siguiente punto
- que el feedback es claro
- que el progreso no se corrompe

#### Escenario D4. Ultimo punto

Debes comprobar:

- que `routeStatus` pasa a `completed`
- que `unlockedPointId` es `null`
- que la puntuacion final cuadra con el runtime actual

#### Escenario D5. Persistencia

Debes comprobar:

- que el progreso no se pierde al refrescar o volver a entrar
- que el punto actual y desbloqueados siguen coherentes

### Evidencia que te conviene guardar

Cuando hagas estas pruebas, intenta guardar:

- capturas
- respuestas JSON reales
- notas de incidencias
- que parte fallo: frontend, backend o contrato

Resultado esperado:

- una lista pequena de pruebas reales superadas y otra de bloqueos pendientes

### Estado de este bloque

- pruebas de contrato: hechas
- pruebas funcionales completas: pendientes

## 8. Bloque E: coordinacion con prompts y Gemini

### Objetivo

Ver si lo que dejaste preparado en prompts funciona bien cuando backend use Gemini real.

### Lo que ya esta hecho

- prompt de audioguia
- prompt de enigma
- prompt de validacion
- contrato de prompts

### Lo que falta

Cuando Persona 2 active Gemini real, deberias revisar:

1. si la audioguia sale demasiado larga
2. si el enigma cambia demasiado la respuesta correcta
3. si las opciones incorrectas son demasiado obvias o demasiado absurdas
4. si el feedback de validacion es util
5. si el JSON se rompe alguna vez

Si detectas problemas, tu trabajo seria:

- ajustar instrucciones
- acotar aun mas el formato
- reforzar fallback

### Estado de este bloque

- preparacion documental: hecha
- validacion con Gemini real: pendiente

## 9. Orden recomendado exacto

Si quieres avanzar de forma eficiente, este es el orden recomendado:

1. revisar con Persona 1 el contrato real de mapa
2. conseguir o confirmar la clave real de Google Maps
3. revisar con Persona 2 la estrategia real de guardado de progreso
4. decidir si usareis imagenes reales de prueba
5. ejecutar primer flujo real completo con mocks
6. ejecutar segundo flujo con fallback forzado
7. comprobar progreso y puntuacion en ese flujo
8. documentar cualquier discrepancia encontrada
9. si backend activa Gemini real, revisar calidad de prompts
10. cerrar una checklist final de demo lista para presentacion

## 10. Lista de preguntas que tienes que resolver con el equipo

Con Persona 1:

- como se dibuja el punto actual
- como se dibuja el siguiente desbloqueado
- si se muestran todos los puntos o solo algunos
- como se muestra la distancia
- que pasa si no hay geolocalizacion

Con Persona 2:

- quien calcula de verdad el progreso
- quien calcula la puntuacion
- cuando se escribe en Firestore
- si `routeId` entrara en runtime antes de la demo
- cuando se activaran Vision, Gemini y TTS reales

Contigo misma como Persona 3:

- si quieres subir imagenes reales de prueba
- si quieres anadir mas casos de ejemplo de progreso
- si necesitas una checklist de validacion mas formal para la entrega

## 11. Senales de que tu parte esta realmente terminada

Podras considerar tu parte practicamente cerrada cuando:

- frontend use tus campos sin pedir renombres
- backend responda con tus contratos sin romper nada
- el mapa tenga clave real o plan cerrado de activacion
- el progreso tenga estrategia real decidida
- exista al menos una prueba completa del flujo
- los fallbacks funcionen
- los prompts den salidas estables o tengan fallback suficiente

## 12. Recordatorio final

Tu trabajo no termina solo con "tener JSON bonitos". Tu valor como Persona 3 esta en unir:

- ruta
- mapa
- puntuacion
- progreso
- prompts
- fallback
- coherencia entre frontend y backend

Si dudas sobre que hacer despues, vuelve a esta pregunta:

"Que decision o prueba hace falta para que frontend y backend puedan integrar la demo sin inventar cosas por su cuenta?"

Esa suele ser la siguiente tarea correcta para Persona 3.
