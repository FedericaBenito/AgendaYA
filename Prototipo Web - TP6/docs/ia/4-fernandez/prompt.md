En AgendaYA (M04 y dashboard) las reservas son objetos `{ fecha: "YYYY-MM-DD", hora: "HH:MM", estado }` con estado "pendiente", "confirmada", "completada", "cancelada" o "expirada". En `src/logica-negocio.js` (CommonJS) tengo:

- `horarioOcupado(reservas, fecha, hora)`: true si ya hay una reserva en esa fecha y hora; las canceladas y expiradas liberan el horario.
- `filtrarReservasPorRango(reservas, desdeISO, hastaISO, estadosExcluidos = ["cancelada", "expirada"])`: devuelve las reservas entre dos fechas inclusive, sin los estados excluidos.
- `inicioDeSemana(fechaISO)`: devuelve la fecha ISO del lunes de la semana de esa fecha.

Generá al menos 5 tests unitarios con Jest cubriendo caso normal, bordes (límites del rango, domingo) y entradas inválidas.
