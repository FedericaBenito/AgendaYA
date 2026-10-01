# Palermo Lourdes — evaluación del output de la IA

**Funciones:** generarSlots · esFechaValida  
**Versión final:** `tests/M04-slots-y-fechas.test.js`

## Resultado de ejecutar el output original

9 tests generados, 1 fallaron.

generarSlots › lanza un error si el formato de hora es inválido — «expect(received).toThrow() · Received function did not throw»

## Modificaciones realizadas

1. El test que esperaba una excepción con "9am" se cambió: la función está diseñada para devolver [] ante entradas inválidas (así la UI muestra «No hay horarios disponibles» en vez de romperse).
2. El test de «fecha de hoy» usaba el reloj real y toISOString() (UTC). Se reemplazó por un «ahora» fijo inyectado como parámetro, para que el resultado no dependa del día ni de la hora en que se corre.
3. Se agregaron casos que la IA no propuso: duración decimal (22.5), horas fuera de rango ("25:00"), turno que termina justo en la hora de fin, y fecha sin hora evaluada a las 22 hs.

## Evaluación crítica

La IA cubrió bien el caso normal y los bordes obvios, pero inventó un comportamiento (lanzar error) que no estaba en el prompt y escribió un test dependiente del reloj real. Los casos nuevos agregados a mano encontraron 3 bugs reales: generarSlots devolvía "09:22.5" con duraciones decimales y "24:00"/"24:30" con horas fuera de rango, y esFechaValida("2026-10-06") interpretaba la fecha en UTC, por lo que en Argentina después de las 21 hs «mañana» se consideraba pasado. Los tres se corrigieron en src/logica-negocio.js.
