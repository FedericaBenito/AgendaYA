En AgendaYA (M06-F03) las plantillas de correo usan variables con el formato `{{variable}}`. En `src/logica-negocio.js` (CommonJS) tengo:

- `construirCuerpoPlantilla(cuerpo, variables = {})`: reemplaza cada `{{nombre}}` por el valor del objeto `variables`.
- `nombrePlantillaDuplicado(nombre, plantillas, idExcluir = null)`: true si ya existe una plantilla con ese nombre (sin distinguir mayúsculas), ignorando la plantilla con id `idExcluir` (para cuando se edita).

Generá al menos 5 tests unitarios con Jest: reemplazo simple, variable repetida, variable sin valor, entrada inválida, nombre duplicado con distintas mayúsculas, y edición de la misma plantilla.
