# Varano Lucía — evaluación del output de la IA

**Funciones:** calcularVencimiento · estaVencido · validarFormatoCodigo · generarCodigoVerificacion  
**Versión final:** `tests/M04-plazos-y-codigo.test.js`

## Resultado de ejecutar el output original

7 tests generados, 2 fallaron.

estaVencido › está vencido justo en el momento del vencimiento — «Expected: true · Received: false»; validarFormatoCodigo(" 123456 ") — «Expected: false · Received: true»

## Modificaciones realizadas

1. Límite de las 12 hs: la US-01 dice «más de 12 horas», así que justo a las 12:00:00 la reserva todavía NO está vencida. El código era correcto y el test de la IA estaba mal; se invirtió la expectativa y se dejó el motivo en el nombre del test.
2. Un código con espacios alrededor (pegado desde el mail) se acepta porque la función hace trim(); se decidió que es el comportamiento deseado. Se agregó el caso de espacios internos ("123 456"), que sí es inválido.
3. generarCodigoVerificacion es aleatoria: se reemplazó la prueba de una sola ejecución por 200 ejecuciones y se agregaron los extremos controlando Math.random con jest.spyOn.

## Evaluación crítica

La IA no tenía forma de saber la regla exacta del límite (≥ o >). Ese es justamente el tipo de decisión que debe venir del requerimiento: el test obligó a volver a la US y dejar explícito que el plazo vence después de las 12 hs.
