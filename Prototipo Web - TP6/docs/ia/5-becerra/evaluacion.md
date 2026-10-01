# Becerra Joaquín — evaluación del output de la IA

**Funciones:** debeEnviarRecordatorio · proximaReserva · tiempoRelativo  
**Versión final:** `tests/M06-recordatorios-y-alertas.test.js`

## Resultado de ejecutar el output original

6 tests generados, 1 fallaron.

debeEnviarRecordatorio › envía el recordatorio cuando faltan exactamente 24 hs — «Expected: true · Received: false» (solo en GMT-3; en UTC pasaba)

## Modificaciones realizadas

1. El helper de la IA armaba fecha y hora con toISOString() (UTC), pero la función interpreta la reserva en hora local. En Argentina la reserva quedaba 3 hs corrida. Se reescribió el helper con fechaLocalISO().
2. Se agregó tests/jest.global-setup.js para fijar la zona horaria de toda la suite en America/Argentina/Buenos_Aires: así los tests dan igual en cualquier PC y en GitHub Actions.
3. tiempoRelativo usaba Date.now(): se inyectó un «ahora» fijo. Se agregaron los bordes de la ventana [24 hs, 23 hs), reservas canceladas, hora inválida y proximaReserva con lista desordenada.

## Evaluación crítica

Es el error más instructivo de la tarea: el test de la IA pasaba en la máquina donde se generó (UTC) y fallaba en las nuestras. Enseña que un test que depende del entorno no es un test confiable.
