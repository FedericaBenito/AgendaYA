Tengo estas funciones de validación del formulario de reserva de AgendaYA (módulo M04) en `src/logica-negocio.js` (CommonJS):

- `validarEmail(email)`: true si el string tiene formato de correo válido.
- `validarDNI(dni)`: true si es un DNI argentino válido de 7 u 8 dígitos (acepta string o number).
- `validarCamposObligatorios(datos, camposObligatorios)`: recibe un objeto y una lista de nombres de campos, y devuelve un array con los campos que faltan (vacíos, null o undefined).

Generá al menos 5 tests unitarios con Jest para estas funciones cubriendo caso normal, casos borde y valores inválidos (tipos incorrectos, strings vacíos, espacios).
