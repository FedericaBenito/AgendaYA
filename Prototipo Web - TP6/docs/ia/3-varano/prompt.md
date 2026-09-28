En AgendaYA el cliente tiene 12 horas para confirmar su reserva y recibe un código de verificación de 6 dígitos. En `src/logica-negocio.js` (CommonJS) tengo:

- `calcularVencimiento(fechaEnvio, horasDePlazo)`: devuelve un Date con la fecha de envío + las horas de plazo.
- `estaVencido(fechaVencimiento, ahora = new Date())`: true si el plazo ya se venció.
- `validarFormatoCodigo(codigo)`: true si el código tiene exactamente 6 dígitos.
- `generarCodigoVerificacion()`: devuelve un código numérico aleatorio de 6 dígitos (string).

Generá al menos 5 tests unitarios con Jest que cubran caso normal, caso límite (justo a las 12 horas) y casos inválidos.
