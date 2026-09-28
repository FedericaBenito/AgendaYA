Tengo un archivo `src/logica-negocio.js` (CommonJS, se importa con require) con dos funciones JavaScript de AgendaYA, módulo M04 (Proceso de Reserva):

- `generarSlots(horaInicio, horaFin, duracionMin)`: recibe una hora de inicio y una de fin en formato "HH:MM" y una duración en minutos, y devuelve un array con los horarios de inicio de cada turno ("HH:MM") que entran completos en el rango.
- `esFechaValida(fecha, ahora = new Date())`: recibe una fecha (string ISO u objeto Date) y devuelve true solo si es futura respecto de `ahora`; una reserva no se puede hacer en el pasado.

Generá al menos 5 tests unitarios con Jest que cubran: caso normal, duración mayor al rango disponible, horarios iguales, valores inválidos, y para la fecha: futura, pasada, hoy e inválida.
