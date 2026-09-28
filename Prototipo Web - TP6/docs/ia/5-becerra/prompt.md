En AgendaYA (M06, US-09) el sistema envía un recordatorio 24 hs antes del turno. En `src/logica-negocio.js` (CommonJS) tengo:

- `debeEnviarRecordatorio(reserva, ahora = new Date(), toleranciaMin = 60)`: reserva = `{ fecha: "YYYY-MM-DD", hora: "HH:MM", estado, recordatorioEnviado }`. Devuelve true solo si la reserva está "confirmada", no se envió antes el recordatorio y faltan entre 24 hs y 24 hs menos la tolerancia para el turno.
- `proximaReserva(reservas, ahora = new Date())`: devuelve la próxima reserva pendiente o confirmada posterior a `ahora`, o null.
- `tiempoRelativo(fecha, ahora = new Date())`: texto para alertas: "Hace instantes", "Hace N min", "Hace N h", "Hace N d".

Generá al menos 5 tests unitarios con Jest (caso normal, borde de la ventana de 24 hs, reserva no confirmada, recordatorio ya enviado, lista vacía).
