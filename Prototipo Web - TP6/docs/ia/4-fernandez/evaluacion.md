# Fernandez Carla — evaluación del output de la IA

**Funciones:** horarioOcupado · filtrarReservasPorRango · inicioDeSemana · formatearNumeroReserva  
**Versión final:** `tests/M04-disponibilidad-y-agenda.test.js`

## Resultado de ejecutar el output original

6 tests generados, 0 fallaron.

Ninguno: los 6 tests generados pasaron.

## Modificaciones realizadas

1. Todos los tests pasaron, pero la cobertura era pobre: el de filtrarReservasPorRango solo verificaba la cantidad (toHaveLength) y no QUÉ reservas devolvía. Se cambió por toEqual con el resultado exacto.
2. Se agregaron las reservas expiradas (también liberan el horario), misma hora en otro día, rango invertido, lista inválida, lunes como inicio de semana y cruce de mes y de año.
3. Se sumó formatearNumeroReserva (número visible RES-0001) con ceros, negativos y decimales.

## Evaluación crítica

Que todos los tests pasen no significa que prueben lo importante. La IA generó aserciones débiles; la revisión humana fue necesaria para que un error en el filtro no pasara desapercibido.
