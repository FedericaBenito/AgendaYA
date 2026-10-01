En AgendaYA (M06) los correos se arman a partir de plantillas con variables `{{variable}}`. En `src/logica-negocio.js` (CommonJS) tengo:

- `detectarVariablesFaltantes(cuerpo, variablesDisponibles = {})`: devuelve un array (sin repetidos) con las variables usadas en la plantilla que no tienen valor.
- `renderizarEmailHtml({ cuerpo, firma, imagenUrl })`: arma el HTML del correo con CSS inline, escapando el texto para evitar inyección de HTML; la imagen de encabezado solo se incluye si es una URL http/https.
- `escaparHtml(texto)`: escapa & < > " '.

Generá al menos 5 tests unitarios con Jest que cubran caso normal, variables repetidas, sin variables faltantes, intento de inyección de HTML y URL de imagen inválida.
